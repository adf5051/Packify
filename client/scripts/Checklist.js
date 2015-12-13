// Packify
// Client - Checklist.js
// Author: Alex Fuerst

"use strict";

// when the page finishes loading hook up some event listeners
$(document).ready(function () {
    
    // send out a POST request to our server
    // different from our other ajax functions
    // this one sends json not urlencoded
    function sendAjax(action, data, callback) {
        
        // append our csrf token to the data string;
        var csrf = $("#csrfToken").val();
        data._csrf = csrf;        
        data = JSON.stringify(data);

        // set up the ajax request
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
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
    
    // when displaying the checklist listen for the add item click
    $("#addItem").on("click", function (e) {
        e.preventDefault();

        var misc = document.querySelector("#misc");
        
        // force the value attributes
        $('.miscName').each(function (i, element) {
            element.setAttribute("value", element.value);
        });
        
        // force the value attributes
        $('.miscAmt').each(function (i, element) {
            element.setAttribute("value", element.value);
        });
        
        // add a new entry
        misc.innerHTML += 
        "<div style='width:250px' class='form-group miscField'>" +
            "<input type='text' style='float:left; width:50%; margin-bottom:5px' class='miscName' />" +
            "<input type='number' style='float:right; width:25%; margin-bottom:5px' class='miscAmt' min='0'/>" +
        "</div>";
    });
    
    // when displaying the modifiable checklist listen to the confirm click
    $("#confirmChecklist").on("click", function (e) {
        e.preventDefault();
        
        // serialize the adult form into usable json
        var adultsArray = $('#adults').serializeArray();
        var adults = {};
        adultsArray.forEach(function (entry) {
            adults[entry.name] = entry.value;
        });
        
        // serialize the kid form into usable json
        var kidsArray = $('#kids').serializeArray();
        var kids = {};
        kidsArray.forEach(function (entry) {
            kids[entry.name] = entry.value;
        });
        
        // grab all the boolean values
        var heavyJacket = document.querySelector('.heavyJacket').checked;
        var lightJacket = document.querySelector('.lightJacket').checked;
        var sandals = document.querySelector('.sandals').checked;
        var boots = document.querySelector('.boots').checked;
        var shoes = document.querySelector('.shoes').checked;
        var umbrella = document.querySelector('.umbrella').checked;
        
        // set the everybody json with the booleans
        var all = {
            heavyJacket : heavyJacket,
            lightJacket: lightJacket, 
            sandals: sandals,
            boots: boots, 
            shoes: shoes, 
            umbrella: umbrella
        };
        
        // serialize the user submitted entries
        var misc = {};
        $(".miscField").each(function (i, element) {
            var name = element.querySelector(".miscName").value;
            var val = element.querySelector(".miscAmt").value;
            if (!name || !val) {
                return true;
            }

            misc[name] = val;
        });
       
        // set up our data structure
        var data = { all:all, adults:adults, kids:kids, misc:misc };
        
        var success = function (result, status, xhr) {
            if (result.redirect) {
                window.location = result.redirect;
            }
            $("#errorDisplay").animate({ height: 'hide' }, 200);
        };
        
        // send the checklist off to the server
        sendAjax("/modifyChecklist", data, success);
    });
    
  
});