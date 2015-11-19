// router.js
// Alex Fuerst

var controllers = require('./controllers');
var mid = require('./middleware');

var router = function (app) {
    app.get('/login', controllers.Account.loginPage);
    app.get('/signup', controllers.Account.signupPage);
    app.post('/login', controllers.Account.login);
    app.post('/signup', controllers.Account.signup);
    app.get('/accountDetails', controllers.AccountDetails.DetailsPage);
    app.get('/accountDetailsModify', controllers.AccountDetails.ModifyDetailsPage);
    app.post('/accountDetailsModify', controllers.AccountDetails.UpdateDetails);
    app.get('/', controllers.Account.loginPage);
};

module.exports = router;
