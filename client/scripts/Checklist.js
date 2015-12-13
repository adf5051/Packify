"use strict";

$(document).ready(function () {
    
    // send out a POST request to our server
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
    
    $("#addItem").on("click", function (e) {
        e.preventDefault();

        var misc = document.querySelector("#misc");

        $('.miscName').each(function (i, element) {
            element.setAttribute("value", element.value);
        });
        
        $('.miscAmt').each(function (i, element) {
            element.setAttribute("value", element.value);
        });

        misc.innerHTML += 
        "<div style='width:250px' class='form-group miscField'>" +
            "<input type='text' style='float:left; width:50%; margin-bottom:5px' class='miscName' />" +
            "<input type='number' style='float:right; width:25%; margin-bottom:5px' class='miscAmt' min='0'/>" +
        "</div>";
    });
    
    $("#confirmChecklist").on("click", function (e) {
        e.preventDefault();
        
        var adultsArray = $('#adults').serializeArray();
        var adults = {};
        adultsArray.forEach(function (entry) {
            adults[entry.name] = entry.value;
        });

        var kidsArray = $('#kids').serializeArray();
        var kids = {};
        kidsArray.forEach(function (entry) {
            kids[entry.name] = entry.value;
        });

        var heavyJacket = document.querySelector('.heavyJacket').checked;
        var lightJacket = document.querySelector('.lightJacket').checked;
        var sandals = document.querySelector('.sandals').checked;
        var boots = document.querySelector('.boots').checked;
        var shoes = document.querySelector('.shoes').checked;
        var umbrella = document.querySelector('.umbrella').checked;
        var all = {
            heavyJacket : heavyJacket,
            lightJacket: lightJacket, 
            sandals: sandals,
            boots: boots, 
            shoes: shoes, 
            umbrella: umbrella
        };
        
        var misc = {};
        $(".miscField").each(function (i, element) {
            var name = element.querySelector(".miscName").value;
            var val = element.querySelector(".miscAmt").value;
            if (!name || !val) {
                return true;
            }

            misc[name] = val;
        });
       

        var data = { all:all, adults:adults, kids:kids, misc:misc };
        
        var success = function (result, status, xhr) {
            if (result.redirect) {
                window.location = result.redirect;
            }
            console.log(result + " " + status + " " + xhr);
        };

        sendAjax("/modifyChecklist", data, success);
    });
    
  
});