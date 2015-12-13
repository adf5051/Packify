var models = require('../models');
var mapsAPIHelper = require('googlemaps');
var request = require('request');
var moment = require('moment');
var Trip = models.Trip;

var wundergroundKey = "e35191cba7ae2724";
//http:api.wunderground.com/api/[key]/[feature]/[feature]/.../[settings]/q/[query].json

var apiConfig = {
    key: "AIzaSyB1nI-pAheMM6cDkCkvlEgOcLZ046Wz4rE",
    stagger_time: 1000,
    encode_polylines: false,
    secure: true
};

var gmAPI = new mapsAPIHelper(apiConfig);

var AddrSearchPage = function (req, res) {
    res.render('AddressSearch', {
        username: req.session.account.username,
        csrfToken: req.csrfToken()
    });
};

var TripDetails = function (req, res) {
    res.render('TripDetails', {
        username: req.session.account.username,
        csrfToken: req.csrfToken()
    });
};

var AddrSearch = function (req, res) {
    
    if (!req.body.street || !req.body.country) {
        return res.status(400).json({ error: "Street and Country are both required." });
    }

    var addr = req.body.street + ",%20";

    if (req.body.city != "" && req.body.city != " ") {
        addr += req.body.city + ",%20";
    }

    if (req.body.state != "" && req.body.state != " ") {
        addr += req.body.state + ",%20";
    }

    addr += req.body.country;
    
    var searchParams = {
        "address": addr
    };

    gmAPI.geocode(searchParams, function (err, result) {
        if (err) {
            console.log(err);
        }

        return res.status(200).json(result);
    });
};

var SetAddress = function (req, res) {
    Trip.TripModel.findUnfinished(req.session.account._id, function (err, docs) {

        if (err) {
            console.log(err);
        }
        
        if (docs.length > 0) {
            for (var i = 0; i < docs.length; i++) {
                docs[i].remove();
            }
            
            global.redis.hdel(req.session.account._id, "newTrip");
            console.log("Unfinished Document Removed");
        }
            
        var newTrip;
        var tripData = {
            location: {
                address: req.body.address,
                lat: req.body.lat,
                long: req.body.long
            },
            owner: req.session.account._id,
            completed: false
        };
        
        newTrip = new Trip.TripModel(tripData);

        newTrip.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }

            var id = newTrip.toAPI()._id;

            global.redis.hmset(req.session.account._id, {
                "newTrip": id
            });

            return res.json({ redirect: "/tripDetails" });
        });

    });
};

var SetDetails = function (req, res) {
    
    var newTripID;

    var adults = req.body.adults;
    var kids = req.body.kids;
    
    var start = req.body.start;
    var end = req.body.end;
    
    var span = end - start;
    span *= 0.001; //ms to s
    //s to min to hr
    span = (span / 60.0) / 60;
    //hr to day
    span = span / 24;

    if (span > 30) {
        // this is a limitation on the wunderground weather planner
        return res.status(400).json({ error: "We can only provide data for trips up to 30 days" });
    } else if (span < 0) {
        return res.status(400).json({ error: "Please enter a valid date range" });
    }
    
    if (adults === 0 && kids === 0) {
        return res.status(400).json({ error: "There has to be at least one person traveling" });
    }
    
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }

        Trip.TripModel.findById(obj.newTrip, function (err, doc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            if (!doc) {
                return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
            }
            
            newTrip = doc;
            
            newTrip.adults = adults;
            newTrip.kids = kids;
            newTrip.tripDate.start = start;
            newTrip.tripDate.end = end;
            newTrip.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ error: "An error occured" });
                }
                
                return res.status(200).json({ redirect: "/weather" });
            });
        });
    });
};

var DisplayWeather = function (req, res) {
    
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        Trip.TripModel.findById(obj.newTrip, function (err, doc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            if (!doc) {
                return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
            }
            
            if (!doc.tripDate || !doc.location) {
                res.redirect("/tripDetails");
            }
            
            function prependZero(numberAsString) {
                if (numberAsString.length < 2) {
                    return "0" + numberAsString;
                } else {
                    return numberAsString;
                }
            }
            
            // why do months start at 0 and days start at 1?
            var start = new Date(doc.tripDate.start);
            var startMonth = prependZero((start.getUTCMonth() + 1).toString());
            var startDay = prependZero(start.getUTCDate().toString());
            
            var end = new Date(doc.tripDate.end);
            var endMonth = prependZero((end.getUTCMonth() + 1).toString());
            var endDay = prependZero(end.getUTCDate().toString());
            
            var plannerString = "planner_" + startMonth + startDay + endMonth + endDay;
            var latlongString = doc.location.lat + "," + doc.location.long;
            
            var queryString = "http://api.wunderground.com/api/" + wundergroundKey 
            + "/geolookup/" + plannerString + "/q/" + latlongString + ".json";
            
            request(queryString, function (err, response, body) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ error: "Error occured while looking up weather" });
                }
                
                //remove the damn excess characters or json.parse explodes
                var jsonOBJ = body.replace(/(\r\n|\r|\n|\t)/gm, "");
                var jsonOBJ = JSON.parse(jsonOBJ);
                if (jsonOBJ.response.error) {
                    console.log(jsonOBJ.response.error);
                    return res.status(400).json({ error: "Error occured while looking up weather" });
                }          

                doc.weather = {
                    wuurl : jsonOBJ.location.wuiurl,
                    freezing : jsonOBJ.trip.chance_of.tempbelowfreezing.percentage,
                    oversixty : jsonOBJ.trip.chance_of.tempoversixty.percentage,
                    overninety : jsonOBJ.trip.chance_of.tempoverninety.percentage,
                    snowing : jsonOBJ.trip.chance_of.chanceofsnowday.percentage,
                    snowonground : jsonOBJ.trip.chance_of.chanceofsnowonground.percentage,
                    raining : jsonOBJ.trip.chance_of.chanceofrainday.percentage,
                    windy : jsonOBJ.trip.chance_of.chanceofwindyday.percentage,
                };
                
                doc.save(function (err) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({error: "An error occured"})
                    }

                    return res.render("Weather",{
                        username: req.session.account.username,
                        csrfToken: req.csrfToken(),
                        weather: doc.weather
                    });
                });
            });
        });
    });

};

module.exports.AddressSearchPage = AddrSearchPage;
module.exports.LookupAddress = AddrSearch;
module.exports.SetAddress = SetAddress;
module.exports.SetDetails = SetDetails;
module.exports.TripDetails = TripDetails;
module.exports.DisplayWeather = DisplayWeather;