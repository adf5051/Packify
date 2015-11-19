"use strict";

$(document).ready(function(){
    console.log("ready");

    function sendAjax(action, data) {
        console.log(data);
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
        console.log("here");
        if ($("#username").val() == "" || $("#pass").val() == "" || $("#pass2").val() == "") {
            //tell the person they are dumb
            return false;
        }

        if ($("#pass").val() !== $("#pass2").val()) {
            //tell the person they are dumb
            return false;
        }

        console.log($("#signupForm").serialize());
        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());

        return false;
    });

});
