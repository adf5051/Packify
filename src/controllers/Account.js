// Packify
// Controllers - Account.js
// Author: Alex Fuerst

// grab all the models
var models = require('../models');

// grab the account model
var Account = models.Account;

// dish up the login page
var loginPage = function (req, res) {
    res.render('SignIn', { csrfToken: req.csrfToken() });
};

// dish up the sign up page
var signupPage = function (req, res) {
    res.render('SignUp', { csrfToken: req.csrfToken() });
};

// log the user out by destroying their session
var logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};

// log in the user
var login = function (req, res){
    
    // double check the fields
    if(!req.body.username || !req.body.pass){
        return res.status(400).json({error: "Please fill all fields"});
    }
    
    // double check the user exists
    Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account) {
       if(err || !account) {
           return res.status(401).json({error: "Wrong username or passowrd"});
       } 
        
        // create the session
        req.session.account = account.toAPI();
        
        // redirect the user to the account details page
        res.json({redirect: '/home'});
        
    });
};

// Process a new user request
var signup = function (req, res) {
    
    // double check the fields
    if(!req.body.username || !req.body.pass || !req.body.pass2){
        return res.status(400).json({error: "Please fill all fields"});
    }
    
    // make sure passwords match
    if(req.body.pass != req.body.pass2) {
        return res.status(400).json({error: "Passwords do not match"});
    }
    
    // make sure the username is not already taken
    Account.AccountModel.findByUsername(req.body.username, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }
        
        if (doc) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        CreateNew(req, res);
    });
};

// create a new user
var CreateNew = function (req, res) {

    // create a new account
    Account.AccountModel.generateHash(req.body.pass, function (salt, hash) {
        var accountData = {
            username: req.body.username,
            salt: salt,
            password: hash
        };

        var newAccount = new Account.AccountModel(accountData);

        newAccount.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }

            // set up the session
            req.session.account = newAccount.toAPI();

            // redirect the user to the edit details page
            res.json({ redirect: '/accountDetailsModify' });
        });
    });
};

module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;

module.exports.login = login;
module.exports.signup = signup;

module.exports.logout = logout;