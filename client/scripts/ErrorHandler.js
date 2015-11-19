$(document).ready(function () {
    console.log("ready");
    $("#errorDisplay").hide();

    $("#closeError").on("click", function (e) {
        e.preventDefault();

        $("#errorDisplay").animate({ height: 'hide' }, 200);
    });
});

var HandleError = function (error) {
    $("#errorMessage").text(error);
    $("#errorDisplay").animate({ height: 'toggle' }, 200);
};