"use strict";

$(document).ready(function(){
    console.log("ready");

    function sendAjax(action, data) {
        var csrf = $("#csrfToken").val();
        data+= "&_csrf=" + csrf;
        
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
                window.location = result.redirect;
            },
            error: function (xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
                
                //handle errors
            }
        });
    }

    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
        
        if ($("#username").val() == "" || $("#pass").val() == "" || $("#pass2").val() == "") {
            //tell the person they are dumb
            return false;
        }

        if ($("#pass").val() !== $("#pass2").val()) {
            //tell the person they are dumb
            return false;
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());

        return false;
    });

    $("#loginSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#username").val() == "" || $("#pass").val() == "") {
            //tell the person they are dumb
            return false;
        }

        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });

    $("#detailsSubmit").on("click", function (e) {
        e.preventDefault();
        console.log("details");
        if ($("#firstName").val() == "" || $("#lastName").val() == "") {
            //tell the person they are dumb
            return false;
        }

        sendAjax($("#detailsForm").attr("action"), $("#detailsForm").serialize());

        return false;
    });
});
