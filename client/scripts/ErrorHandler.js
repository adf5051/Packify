// Packify
// Client - ErrorHandler.js
// Author: Alex Fuerst

"use strict";

// hide the message box and set up a listener for close clicks
$(document).ready(function () {
    console.log("ready");
    $("#errorDisplay").hide();

    $("#closeError").on("click", function (e) {
        e.preventDefault();

        $("#errorDisplay").animate({ height: 'hide' }, 200);
    });
});

// global handle error function;
var HandleError = function (error) {
    $("#errorMessage").text(error);
    $("#errorDisplay").animate({ height: 'show' }, 200);
};