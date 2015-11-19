"use strict";

$(document).ready(function(){

    function sendAjax(action, data) {
        var csrf = $("#csrfToken").val();
        data+= "&_csrf=" + csrf;
        console.log(data);
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

    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
        
        if ($("#username").val() == "" || $("#pass").val() == "" || $("#pass2").val() == "") {
            //tell the person they are messed up

            if (HandleError) {
                HandleError("All fields are required");
            }
            return false;
        }

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

    $("#loginSubmit").on("click", function (e) {
        e.preventDefault();

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

    $("#detailsSubmit").on("click", function (e) {
        e.preventDefault();
        
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
