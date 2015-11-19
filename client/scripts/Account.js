// Packify
// Client - Account.js
// Author: Alex Fuerst

"use strict";

// when the page finishes loading hook up some event listeners
$(document).ready(function(){

    // send out a POST request to our server
    function sendAjax(action, data) {

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
                window.location = result.redirect;
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

    // Signup Event listener
    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
        
        // check for required inputs
        if ($("#username").val() == "" || $("#pass").val() == "" || $("#pass2").val() == "") {
            //tell the person they are messed up

            if (HandleError) {
                HandleError("All fields are required");
            }
            return false;
        }

        // check for matching passwords
        if ($("#pass").val() !== $("#pass2").val()) {
            //tell the person they are messed up

            if (HandleError) {
                HandleError("Passwords do not match");
            }
            return false;
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());

        return false;
    });

    // Login event listener
    $("#loginSubmit").on("click", function (e) {
        e.preventDefault();

        // check all required fields
        if ($("#username").val() == "" || $("#pass").val() == "") {
            //tell the person they are messed up

            if (HandleError) {
                HandleError("All fields are required");
            }
            return false;
        }

        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });

    // Submit details event listener
    $("#detailsSubmit").on("click", function (e) {
        e.preventDefault();
        
        // check all required fields
        if ($("#firstName").val() == "" || $("#lastName").val() == "") {
            //tell the person they are messed up

            if (HandleError) {
                HandleError("First and Last name are required");
            }
            return false;
        }

        sendAjax($("#detailsForm").attr("action"), $("#detailsForm").serialize());

        return false;
    });
});
