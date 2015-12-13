// Packify
// Controllers - Trip.js
// Author: Alex Fuerst

// include our needed modules
var models = require('../models');
var mapsAPIHelper = require('googlemaps');
var request = require('request');
var moment = require('moment');
var Trip = models.Trip;

// my wunderground api key for packify
// wunderground format - http:api.wunderground.com/api/[key]/[feature]/[feature]/.../[settings]/q/[query].json
var wundergroundKey = "e35191cba7ae2724";

// api configuration for google maps API
var apiConfig = {
    key: "AIzaSyB1nI-pAheMM6cDkCkvlEgOcLZ046Wz4rE",
    stagger_time: 1000,
    encode_polylines: false,
    secure: true
};

// set up mapsAPIHelper
var gmAPI = new mapsAPIHelper(apiConfig);

// serve up the destination search page
var AddrSearchPage = function (req, res) {
    res.render('AddressSearch', {
        username: req.session.account.username,
        csrfToken: req.csrfToken()
    });
};

// serve up the trip details page
var TripDetails = function (req, res) {
    res.render('TripDetails', {
        username: req.session.account.username,
        csrfToken: req.csrfToken()
    });
};

// This is called when a user submits an address to look up
// this calls the google geocoding api to grab a list of hits
var AddrSearch = function (req, res) {
    
    if (!req.body.street || !req.body.country) {
        return res.status(400).json({ error: "Street and Country are both required." });
    }
    
    // format the query string
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
    
    // attempt to look up the address
    gmAPI.geocode(searchParams, function (err, result) {
        if (err) {
            console.log(err);
        }

        return res.status(200).json(result);
    });
};

// This is called when the user confirms an address hit as correct
// this will then begin the process of creating a new trip db entry
var SetAddress = function (req, res) {
    
    // find all the unfinished entries for this user
    Trip.TripModel.findUnfinished(req.session.account._id, function (err, docs) {
        
        if (err) {
            console.log(err);
        }
        
        // delete the entries
        if (docs.length > 0) {
            for (var i = 0; i < docs.length; i++) {
                docs[i].remove();
            }
            
            global.redis.hdel(req.session.account._id, "newTrip");
        }
        
        // create a new entry based upon the info we have so far
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
            
            // save the trip id for this user
            global.redis.hmset(req.session.account._id, {
                "newTrip": id
            });
            
            // continue on to the details page
            return res.json({ redirect: "/tripDetails" });
        });

    });
};

// This is called when the user wants to see all of their submited trips
var ListTrips = function (req, res) {
    
    // attempt to find all the trips for this user
    Trip.TripModel.findByOwner(req.session.account._id, function (err, docs) {
        if (err) {
            console.log(err);
        }

        var trips = [];
        
        // populate the trips array
        for (var i = 0; i < docs.length; i++) {
            var doc = docs[i];
            // have to use this offset since there is no UTC Year function. 
            // eg pick 1/1/2016 utc is 12/31/2015 est
            // and with all the UTC functions but the year
            // we would actually get 1/1/2015. not right
            var d = new Date();
            var timezone = d.getTimezoneOffset() * 60000;
            
            var start = new Date(doc.tripDate.start);
            start.setTime(start.getTime() + timezone);
            var end = new Date(doc.tripDate.end);
            end.setTime(end.getTime() + timezone);
            var dateString = (start.getMonth() + 1) + "/" + start.getDate() + "/" + start.getFullYear() + " - " 
                + (end.getMonth() + 1) + "/" + end.getDate() + "/" + end.getFullYear();

            trips.push({
                address: doc.location.address,
                adults: doc.adults,
                kids: doc.kids,
                date: dateString,
                id: doc._id
            });
        }

        return res.render("TripList", {
            username: req.session.account.username,
            csrfToken: req.csrfToken(),
            trips: trips
        });
    });
};

// This is called when the user selects a specific trip to then review
// this will set the user's redis entry for requestedTrip and then redirect
// the user to the reviewTrip page
var SelectTrip = function (req, res) {
    if (req.body.tripID) {
        global.redis.hdel(req.session.account._id, "requestedTrip");
        global.redis.hmset(req.session.account._id, {
            "requestedTrip": req.body.tripID
        });

        return res.status(200).json({ redirect: "/reviewTrip" });
    }
};

// This is called when the user submits the trip detals (attendees and date)
var SetDetails = function (req, res) {
    
    var newTripID;

    var adults = req.body.adults;
    var kids = req.body.kids;
    
    var start = req.body.start;
    var end = req.body.end;
    
    // figure out the number of total days
    var span = end - start;
    span *= 0.001; //ms to s
    //s to min to hr
    span = (span / 60.0) / 60;
    //hr to day
    span = span / 24;

    if (span > 30) {
        // this is a limitation on the wunderground weather planner
        return res.status(400).json({ error: "We can only provide data for trips up to 30 days in length" });
    } else if (span < 0) {
        return res.status(400).json({ error: "Please enter a valid date range" });
    }
    
    if (adults === 0 && kids === 0) {
        return res.status(400).json({ error: "There has to be at least one person traveling" });
    }
    
    // try to grab this user's redis entry
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        // look up the trip by id
        Trip.TripModel.findById(obj.newTrip, function (err, doc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            if (!doc) {
                return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
            }
            
            // update the entry with more information and attempt to save
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
                
                // redirect the user to the weather page
                return res.status(200).json({ redirect: "/weather" });
            });
        });
    });
};

// Serve up the weather estimates page
var DisplayWeather = function (req, res) {
    
    // attempt to grab the user's redis entry
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        // find the trip
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
            
            // add zeros to the dates
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
            
            // set up the planner query like planner_mmddmmdd
            var plannerString = "planner_" + startMonth + startDay + endMonth + endDay;
            
            // set up the geolookup query like lat,long
            var latlongString = doc.location.lat + "," + doc.location.long;
            
            // piece together the querystring
            var queryString = "http://api.wunderground.com/api/" + wundergroundKey 
            + "/geolookup/" + plannerString + "/q/" + latlongString + ".json";
            
            // request the weather from wunderground.com
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
                
                // add the weather to the current trip
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
                
                // save the trip entry
                doc.save(function (err) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({error: "An error occured"})
                    }
                    
                    // display the estimates to the user
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
module.exports.ListTrips = ListTrips;
module.exports.SelectTrip = SelectTrip;