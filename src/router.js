// Packify
// Server - router.js
// Author: Alex Fuerst

var controllers = require('./controllers');
var mid = require('./middleware');

var router = function (app) {
    app.get('/login', mid.RequiresLogout,  controllers.Account.loginPage);
    app.get('/signup', mid.RequiresLogout, controllers.Account.signupPage);
    app.post('/login', mid.RequiresLogout, controllers.Account.login);
    app.post('/signup', mid.RequiresLogout, controllers.Account.signup);
    app.get('/logout', mid.RequiresLogin, controllers.Account.logout);
    app.get('/home', mid.RequiresLogin, controllers.AccountDetails.Home);
    app.get('/addressSearch', mid.RequiresLogin, controllers.Trips.AddressSearchPage);
    app.post('/addressSearch', mid.RequiresLogin, controllers.Trips.LookupAddress);
    app.get('/accountDetails', mid.RequiresLogin, controllers.AccountDetails.DetailsPage);
    app.get('/accountDetailsModify', mid.RequiresLogin, controllers.AccountDetails.ModifyDetailsPage);
    app.post('/accountDetailsModify', mid.RequiresLogin, controllers.AccountDetails.UpdateDetails);
    app.get('/', mid.RequiresLogout, controllers.Account.loginPage);
};

module.exports = router;
