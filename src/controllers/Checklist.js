// Packify
// Controllers - Checklist.js
// Author: Alex Fuerst

// include our models
var models = require("../models");

// grab the checklist model
var cl = models.CheckList;

// Create some recommendations and prepopulate a checklist
// to then serve up as a modifiable page to the user
var CreateChecklist = function (req, res) {
    
    // try to grab the redis entry for this user
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        // double check to make sure there is a trip that they are working on
        if (!obj.newTrip) {
            return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
        }
        
        // find the trip data by that id provided
        models.Trip.TripModel.findById(obj.newTrip, function (err, doc) {
            if (err) {
                console.log(err);
            }
            
            if (!doc) {
                return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
            }
            
            // if they haven't finished filling out the trip details redirect them
            if (!doc.tripDate || !doc.location || !doc.weather) {
                res.redirect("/tripDetails");
            }
            
            var adults = doc.adults;
            var kids = doc.kids;
            
            var start = doc.tripDate.start;
            var end = doc.tripDate.end;
            var days = end - start;
            days *= 0.001; //ms to s
            //s to min to hr
            days = (days / 60.0) / 60;
            //hr to day
            days = days / 24;
            
            // calculate arbitrary weights
            // this would be where time and research would need to happen to be accurate
            var cold = (doc.weather.freezing + doc.weather.snowing + doc.weather.snowonground) / 3;
            var hot = doc.weather.overninety;
            var mild = doc.weather.oversixty;
            var incl = (doc.weather.windy + doc.weather.raining) / 2;
            
            var heavyJacket = false;
            var lightJacket = false;
            var sandals = false;
            var boots = false;
            var shoes = true;
            var umbrella = false;
            var tshirts = 0;
            var longsleeves = 0;
            var sweaters = 0;
            var underwear = days;
            var pants = 0;
            var shorts = 0;
            var socks = days;
            
            // calculate arbitrary values of items
            // this would be where time and research would need to happen to be accurate
            if (hot >= 75) {
                if (cold >= 10) {
                    lightJacket = true;
                    pants = 2;
                }
                
                tshirts = days;
                shorts = days;
                sandals = true;
            }
            
            if (cold >= 50) {
                if (mild >= 30) {
                    lightJacket = true;
                }
                
                heavyJacket = true;
                boots = true;
                sweaters = 2;
                longsleeves = days;
            }
            
            if (incl >= 30) {
                lightJacket = true;
                umbrella = true;
                sweaters = Math.max(sweaters, 1);
                longsleeves = Math.max(longsleeves, 3);
                pants = Math.max(pants, 2);
            }
            
            var outObj = {
                username: req.session.account.username,
                csrfToken: req.csrfToken(),
                adults : adults,
                kids : kids,
                days : days,
                heavyJacket : heavyJacket,
                lightJacket : lightJacket,
                sandals : sandals,
                boots : boots,
                shoes : shoes,
                umbrella : umbrella,
                tshirts : tshirts,
                longsleeves : longsleeves,
                sweaters : sweaters,
                underwear : underwear,
                pants : pants,
                shorts : shorts,
                socks : socks,
            };
            
            return res.render("ModifyChecklist", outObj);
        });
    });
};

// After the user confirms they like the checklist it gets sent back to us
// this creates the appropriate checklist db entry
var ConfirmChecklist = function (req, res) {
    
    // try to grab the redis entry for this user
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        // make sure they are working on a new trip
        if (!obj.newTrip) {
            return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
        }
        
        // find the trip by the given ID
        models.Trip.TripModel.findById(obj.newTrip, function (err, doc) {
            if (err) {
                console.log(err);
            }
            
            if (!doc) {
                return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
            }
            
            // make sure they have actually filled out all of the trip details
            if (!doc.tripDate || !doc.location || !doc.weather) {
                res.redirect("/tripDetails");
            }
            
            var checklistObj = { adults: {}, kids: {}, misc: {}, trip: doc._id };
            
            checklistObj.adults = req.body.adults;
            checklistObj.kids = req.body.kids;
            
            // this could probably be revised in some way, possibly at the schema.
            // but the idea is these things are usually 1 per person (you don't need
            // 1 pair of boots for each day of the trip) so I am assuming everyone does/n't have them
            checklistObj.kids.heavyJacket = checklistObj.adults.heavyJacket = req.body.all.heavyJacket;
            checklistObj.kids.lightJacket = checklistObj.adults.lightJacket = req.body.all.lightJacket;
            checklistObj.kids.sandals = checklistObj.adults.sandals = req.body.all.sandals;
            checklistObj.kids.boots = checklistObj.adults.boots = req.body.all.boots;
            checklistObj.kids.shoes = checklistObj.adults.shoes = req.body.all.shoes;
            checklistObj.kids.umbrella = checklistObj.adults.umbrella = req.body.all.umbrella;
            
            // populate the misc array
            var misc = req.body.misc;
            checklistObj.misc = [];
            for (var element in misc) {
                checklistObj.misc.push({ name: element, amt: misc[element] });
            }
            
            var newChecklist = new cl.ChecklistModel(checklistObj);
            
            // try to save the entry
            newChecklist.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ error: "An error occured" });
                }
                
                //set the trip to complete and save
                doc.completed = true;
                doc.save(function (err) {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({ error: "An error occured" });
                    }
                    
                    // delete the newTrip redis entry for this user
                    global.redis.hdel(req.session.account._id, "newTrip");
                    
                    // set the requestedTrip entry to then display that to the user
                    global.redis.hmset(req.session.account._id, {
                        "requestedTrip": doc._id
                    });

                    return res.json({ redirect: "/reviewTrip" });
                });
            });
        });
    });
};

// This is called when the user requests to review a trip
// the trip requested is stored in a per user redis entry
var ReviewTrip = function (req, res) {
    
    // try to grab the redis entry for this user
    global.redis.hgetall(req.session.account._id, function (err, obj) {
        if (err) {
            return res.status(400).json({ error: "An error occured" });
        }
        
        if (!obj.requestedTrip) {
            return res.status(400).json({ error: "We can't find the trip you are trying to modify, please restart" });
        }
        
        // look up the checklist by its associated trip
        cl.ChecklistModel.findByTripID(obj.requestedTrip, function (err, doc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            // have to use this offset since there is no UTC Year function. 
            // eg pick 1/1/2016 utc is 12/31/2015 est
            // and with all the UTC functions but the year
            // we would actually get 1/1/2015. not right
            var d = new Date();
            var timezone = d.getTimezoneOffset() * 60000;
            
            // set up the date string as mm/dd/yyyy - mm/dd/yyyy
            var start = new Date(doc.trip.tripDate.start);
            start.setTime(start.getTime() + timezone);
            var end = new Date(doc.trip.tripDate.end);
            end.setTime(end.getTime() + timezone);
            var dateString = (start.getMonth() + 1) + "/" + start.getDate() + "/" + start.getFullYear() + " - " 
                + (end.getMonth() + 1) + "/" + end.getDate() + "/" + end.getFullYear();
            
            var adults = {
                num : doc.trip.adults,
            };
            
            if (adults.num > 0) {
                adults.tshirts = doc.adults.tshirts;
                adults.longsleeves = doc.adults.longsleeves;
                adults.sweaters = doc.adults.sweaters;
                adults.underwear = doc.adults.underwear;
                adults.pants = doc.adults.pants;
                adults.shorts = doc.adults.shorts;
                adults.socks = doc.adults.socks;
            }

            var kids = {
                num : doc.trip.kids,
            };
            
            if (kids.num > 0) {
                kids.tshirts = doc.kids.tshirts;
                kids.longsleeves = doc.kids.longsleeves;
                kids.sweaters = doc.kids.sweaters;
                kids.underwear = doc.kids.underwear;
                kids.pants = doc.kids.pants;
                kids.shorts = doc.kids.shorts;
                kids.socks = doc.kids.socks;
            }

            var outObj = {
                username: req.session.account.username,
                csrfToken: req.csrfToken(),
                address: doc.trip.location.address,
                days: dateString,
                heavyJacket   : doc.adults.heavyJacket,
                lightJacket   : doc.adults.lightJacket,
                sandals       : doc.adults.sandals,
                boots         : doc.adults.boots,
                shoes         : doc.adults.shoes,
                umbrella      : doc.adults.umbrella,
                adults : adults,
                kids : kids,
                misc : doc.misc
            };

            res.render("ReviewChecklist", outObj);
        });
    });
};

module.exports.CreateChecklist = CreateChecklist;
module.exports.ConfirmChecklist = ConfirmChecklist;
module.exports.ReviewTrip = ReviewTrip;