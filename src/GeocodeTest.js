var maps = require('googlemaps');
var request = require('request');


var publicConfig = {
    key: "AIzaSyB1nI-pAheMM6cDkCkvlEgOcLZ046Wz4rE",
    stagger_time: 1000,
    encode_polylines: false,
    secure: true
};

var wundergroundKey = "e35191cba7ae2724";

gmAPI = new maps(publicConfig);

var geocodeParams = {
    "address": "328 saxonburg blvd"
};

gmAPI.geocode(geocodeParams, function (err, result) {
    request("http://api.wunderground.com/api/" + wundergroundKey + "/conditions/q/CA/San_Francisco.json",
        function (err, response, body) {
        if (err) {
            console.log(err);
        } else {
            console.log(body);
        }
        });
});