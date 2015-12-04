var models = require('../models');
var mapsAPIHelper = require('googlemaps');
var request = require('request');

var wundergroundKey = "e35191cba7ae2724";

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

        console.log(result);
        return res.status(200).json(result);
    });
};

module.exports.AddressSearchPage = AddrSearchPage;
module.exports.LookupAddress = AddrSearch;