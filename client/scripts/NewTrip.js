// Packify
// Client - NewTrip.js
// Author: Alex Fuerst

"use strict";

// when the page finishes loading hook up some event listeners
$(document).ready(function () {
    
    // send out a POST request to our server
    function sendAjax(action, data, callback) {

        // append our csrf token to the data string;
        var csrf = $("#csrfToken").val();
        data += "&_csrf=" + csrf;
        
        // set up the ajax request
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: callback,
            error: function (xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
                
                //handle errors
                if (HandleError) {
                    HandleError(messageObj.error);
                }
            }
        });
    }
    
    // when we are displaying a list of trips listen to their click event
    $(".tripLink").on("click", function (e) {
        e.preventDefault();
        
        // grab their mongo id and send it off to the server
        var tripID = "tripID=" + $(e.target).attr("data-id");

        var success = function (result, status, xhr) {
            window.location = result.redirect;
            $("#errorDisplay").animate({ height: 'hide' }, 200);
        };

        sendAjax("/trips", tripID, success);
    });
    
    // when searching for a destination listen to the submit button
    $("#addressSubmit").on("click", function (e) {
        e.preventDefault();
        
        // check the input
        if ($("#street").val() == "" || $("#country").val() == "") {
            if (HandleError) {
                HandleError("Street and Country are both required");
            }
            return false;
        }
        
        // on success display the list
        var success = function (result, status, xhr) {
            DisplayMatches(result);
            $("#errorDisplay").animate({ height: 'hide' }, 200);
        };
        
        // send the request off to the server
        sendAjax($("#addressSearchForm").attr("action"), $("#addressSearchForm").serialize(), success);
    });
    
    
    // when we are updating the date and attendees listen to the submit button
    $("#detailsSubmit").on("click", function (e) {
        e.preventDefault();
        
        // figure out the local timezone
        var d = new Date();
        var timezone = d.getTimezoneOffset() * 60000;
        
        // grab the ms value of the date pickers
        var arrival = new Date($("#arrivalDate").val()).getTime();
        var departure = new Date($("#departureDate").val()).getTime();
        
        // offset now(UTC) by the timezone
        var now = Date.now();
        now -= timezone;

        var adults = $("#numberAdults").val();
        var kids = $("#numberKids").val();
        
        // validate inputs
        if (arrival >= departure || arrival < now || departure < now || isNaN(arrival) || isNaN(departure)) {
            if (HandleError) {
                HandleError("Please enter a valid date range");
            }
            return false;
        } else if (adults <= 0 && kids <= 0) {
            if (HandleError) {
                HandleError("There has to be at least one person traveling");
            }
            return false;
        } else {
            $("#errorDisplay").animate({ height: 'hide' }, 200);
        }
        
        // serialize our data
        var data = "start=" + arrival + "&end=" + departure + "&adults=" + adults + "&kids=" + kids;

        var action = "/tripDetails";

        var success = function (result, status, xhr) {
            if (result.redirect) {
                window.location = result.redirect;
            }
        };
        
        // send the trip details to the server
        sendAjax(action, data, success);
    });
    
    // when we are looking up addresses this will populate a list for us
    function DisplayMatches(matches){
        
        var listGroup = document.querySelector("#addressList");
        
        // check for no hits
        if (matches.results.length <= 0) {
            listGroup.innerHTML = "<p>No matches found</p>";
        } else {
            listGroup.innerHTML = "";
        }
        
        // populate list
        for (var i = 0; i < matches.results.length; i++) {
            var lat = matches.results[i].geometry.location.lat;
            var long = matches.results[i].geometry.location.lng;
            
            // create html with custom lat long attributes
            listGroup.innerHTML += "<a href='/setAddress' data-lat='" 
            + lat + "' data-long='" + long 
            + "' class='list-group-item addressConfirmLink'>" 
            + matches.results[i].formatted_address + "</a>";
        }
        
        // after we create all these links listen for their click event
        $(".addressConfirmLink").on("click", function (e) {
            e.preventDefault();
            
            // serialize the address info
            var data = "lat=" + $(e.target).attr("data-lat") + "&long=" + $(e.target).attr("data-long")
            + "&address=" + $(e.target).text();

            var action = "/setAddress";
            
            var success = function (result, status, xhr) {
                if (result.redirect) {
                    window.location = result.redirect;
                }
            };
            
            // send address of to the server
            sendAjax(action, data, success);
        });
    }
});