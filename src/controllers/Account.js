var models = require('../models');
var Account = models.Account;

var loginPage = function (req, res) {
    res.render('SignIn');
};

var signupPage = function (req, res) {
    res.render('SignUp');
};

var logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};

var login = function(req, res){
    if(!req.body.username || !req.body.pass){
        return res.status(400).json({error: "Please fill all fields"});
    }
    
    Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account) {
       if(err || !account) {
           return res.status(401).json({error: "Wrong username or passowrd"});
       } 
        
        req.session.account = account.toAPI();
        
        res.json({redirect: '/accountDetails'});
        
    });
};

var signup = function(req, res) {
    if(!req.body.username || !req.body.pass || !req.body.pass2){
        return res.status(400).json({error: "Please fill all fields"});
    }
    
    if(req.body.pass != req.body.pass2) {
        return res.status(400).json({error: "Passwords do not match"});
    }

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

var CreateNew = function (req, res){
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
            
            req.session.account = newAccount.toAPI();
            
            res.json({ redirect: '/accountDetailsModify' });
        });
    }); 
}

module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;

module.exports.login = login;
module.exports.signup = signup;

module.exports.logout = logout;