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
            req.session.newTrip = null;
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
            
            req.session.newTrip = newTrip.toAPI;
            
            res.json({ redirect: "/tripDetails" });
        });

    });
};

module.exports.AddressSearchPage = AddrSearchPage;
module.exports.LookupAddress = AddrSearch;
module.exports.SetAddress = SetAddress;
module.exports.TripDetails = TripDetails;