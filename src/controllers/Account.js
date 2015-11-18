var models = require('../models');
var Account = models.Account;

var loginPage = function (req, res) {
    res.render('SignIn');
};

var signupPage = function (req, res) {
    res.render('SignUp');
};

module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;