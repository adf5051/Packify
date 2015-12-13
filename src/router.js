// Packify
// Server - router.js
// Author: Alex Fuerst

var controllers = require('./controllers');
var mid = require('./middleware');

var router = function (app) {
    app.get('/login', mid.RequiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.RequiresLogout, controllers.Account.login);

    app.get('/signup', mid.RequiresLogout, controllers.Account.signupPage);
    app.post('/signup', mid.RequiresLogout, controllers.Account.signup);

    app.get('/logout', mid.RequiresLogin, controllers.Account.logout);
    
    app.get('/home', mid.RequiresLogin, controllers.AccountDetails.Home);

    app.get('/addressSearch', mid.RequiresLogin, controllers.Trips.AddressSearchPage);
    app.post('/addressSearch', mid.RequiresLogin, controllers.Trips.LookupAddress);

    app.post('/setAddress', mid.RequiresLogin, controllers.Trips.SetAddress);

    app.get('/tripDetails', mid.RequiresLogin, mid.RequiresTripEntryStarted, controllers.Trips.TripDetails);
    app.post('/tripDetails', mid.RequiresLogin, mid.RequiresTripEntryStarted, controllers.Trips.SetDetails);
    
    app.get('/weather', mid.RequiresLogin, mid.RequiresTripEntryStarted, controllers.Trips.DisplayWeather);

    app.get('/modifyChecklist', mid.RequiresLogin, mid.RequiresTripEntryStarted, controllers.Checklist.CreateChecklist);
    app.post('/modifyChecklist', mid.RequiresLogin, mid.RequiresTripEntryStarted, controllers.Checklist.ConfirmChecklist);
    
    app.get('/reviewTrip', mid.RequiresLogin, controllers.Checklist.ReviewTrip);

    app.get('/accountDetails', mid.RequiresLogin, controllers.AccountDetails.DetailsPage);

    app.get('/accountDetailsModify', mid.RequiresLogin, controllers.AccountDetails.ModifyDetailsPage);
    app.post('/accountDetailsModify', mid.RequiresLogin, controllers.AccountDetails.UpdateDetails);
    
    var outObj = {
        address     : "test",
        days        : 2,
        heavyJacket : true,
        lightJacket : true,
        sandals     : true,
        boots       : true,
        shoes       : true,
        umbrella    : true,
        adults: {
            num         : 2,
            tshirts     : 2,
            longsleeves : 2,
            sweaters    : 2,
            underwear   : 2,
            pants       : 2,
            shorts      : 2,
            socks       : 2,
        },
        kids: {
            num: 0
        },
        misc : 
            [ { name: "shit", amt: "ton" },
            { name: "shit", amt: "ton"}]
    };

    app.get('/testPage', function (req, res) { outObj.csrfToken = req.csrfToken(); res.render("ReviewChecklist", outObj); });

    app.get('/', mid.RequiresLogout, controllers.Account.loginPage);
    app.get('*', mid.RequiresLogout, controllers.Account.loginPage);
};

module.exports = router;
