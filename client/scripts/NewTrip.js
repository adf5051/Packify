"use strict";

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
    
    $("#addressSubmit").on("click", function (e) {
        e.preventDefault();
        
        if ($("#street").val() == "" || $("#country").val() == "") {
            if (HandleError) {
                HandleError("Street and Country are both required");
            }
            return false;
        }
        var success = function (result, status, xhr) {
            DisplayMatches(result);
            $("#errorDisplay").animate({ height: 'hide' }, 200);
        };

        sendAjax($("#addressSearchForm").attr("action"), $("#addressSearchForm").serialize(), success);
    });
    
    $("#detailsSubmit").on("click", function (e) {
        e.preventDefault();

        var arrival = new Date($("#arrivalDate").val()).getTime();
        var departure = new Date($("#departureDate").val()).getTime();
        var now = Date.now();
        
        var adults = $("#numberAdults").val();
        var kids = $("#numberKids").val();
        console.log(arrival + ' ' + departure);
        console.log(adults + " " + kids);
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

    });

    function DisplayMatches(matches){
        
        var listGroup = document.querySelector("#addressList");

        if (matches.results.length <= 0) {
            listGroup.innerHTML = "<p>No matches found</p>";
        } else {
            listGroup.innerHTML = "";
        }

        for (var i = 0; i < matches.results.length; i++) {
            var lat = matches.results[i].geometry.location.lat;
            var long = matches.results[i].geometry.location.lng;

            listGroup.innerHTML += "<a href='/setAddress' data-lat='" 
            + lat + "' data-long='" + long 
            + "' class='list-group-item addressConfirmLink'>" 
            + matches.results[i].formatted_address + "</a>";
        }

        $(".addressConfirmLink").on("click", function (e) {
            e.preventDefault();
            
            var data = "lat=" + $(e.target).attr("data-lat") + "&long=" + $(e.target).attr("data-long")
            + "&address=" + $(e.target).text();

            var action = "/setAddress";
            
            var success = function (result, status, xhr) {
                if (result.redirect) {
                    window.location = result.redirect;
                }
            };

            sendAjax(action, data, success);
        });
    }
});