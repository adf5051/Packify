// Packify
// Controllers - AccountDetails.js
// Author: Alex Fuerst

// include the models
var models = require('../models');

// grab the details model
var Details = models.AccountDetails;

var HomePage = function (req, res) {
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }
        
        // redirect if no account info exists yet
        if (!doc) {
            ModifyDetailsPage(req, res);
        } else {
            res.render('WelcomePage', {
                name: doc.name.first,
                username: req.session.account.username,
                csrfToken: req.csrfToken()
            });
        }
    });
};

// dish up the details page
var DetailsPage = function (req, res) {
    // find the detalis for this user
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }
        
        // redirect if no account info exists yet
        if (!doc) {
            ModifyDetailsPage(req, res);
            //return res.status(400).json({ error: "No Account Info Found" });
        } else {          
            res.render('Account', {
                name: doc.name.first + " " + doc.name.last,
                email: doc.email,
                username: req.session.account.username,
                csrfToken: req.csrfToken()
            });
        }
    });
};

// dish up the edit details page
var ModifyDetailsPage = function (req, res) {
    
    // try to find account details for this user
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }

        var details;
        
        // if no details exist create an empty render object
        // if details do exist render the current entries
        if (!doc) {
            details = {
                name: { first: '', last: '' },
                email: '',
                username: req.session.account.username,
                csrfToken: req.csrfToken()
            };
        } else {
            details = {
                name: doc.name,
                email: doc.email,
                username: req.session.account.username,
                csrfToken: req.csrfToken()
            };
        }
        
        res.render('AccountModify', details);
    });
};

// handle updating or creating account details
var UpdateDetails = function (req, res) {
    
    // double check required fields
    if (!req.body.firstName || !req.body.lastName) {
        return res.status(400).json({ error: "Please enter your full name" });
    }
    
    // populate the data object
    var detailsData = {
        name: { first: req.body.firstName, last: req.body.lastName },
        email: req.body.email,
        owner: req.session.account._id
    };

    var details;
    
    // try to find an entry to update
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }
        
        // if no entry exists create a new one
        if (!doc) {
            details = new Details.AccountDetailsModel(detailsData);

        } else {
            details = doc;
            details.name = detailsData.name;
            details.email = detailsData.email;
        }
        
        // save the updated or new entry
        details.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            return res.status(200).json({ redirect: "/accountDetails" });
        });    
    });
};

module.exports.DetailsPage = DetailsPage;
module.exports.ModifyDetailsPage = ModifyDetailsPage;
module.exports.UpdateDetails = UpdateDetails;
module.exports.Home = HomePage;