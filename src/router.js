// router.js
// Alex Fuerst

var controllers = require('./controllers');
var mid = require('./middleware');

var router = function (app) {
    app.get('/login', controllers.Account.loginPage);
    app.get('/signup', controllers.Account.signupPage);
    app.get('/', controllers.Account.loginPage);
};

module.exports = router;
