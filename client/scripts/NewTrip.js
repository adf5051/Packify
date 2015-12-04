"use strict";

$(document).ready(function () {
    
    // send out a POST request to our server
    function sendAjax(action, data) {
        console.log(data);
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
            success: function (result, status, xhr) {
                //window.location = result.redirect;
                DisplayMatches(result);
                $("#errorDisplay").animate({ height: 'hide' }, 200);
            },
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
        
        sendAjax($("#addressSearchForm").attr("action"), $("#addressSearchForm").serialize());
    });

    function DisplayMatches(matches){
        console.log(matches.results[0]);
        
        var listGroup = document.querySelector("#addressList");

        if (matches.results.length <= 0) {
            listGroup.innerHTML = "<p>No matches found</p>";
        } else {
            listGroup.innerHTML = "";
        }

        for (var i = 0; i < matches.results.length; i++) {
            listGroup.innerHTML += "<a href='#' class='list-group-item'>" + matches.results[i].formatted_address + "</a>";
        }
    }
});