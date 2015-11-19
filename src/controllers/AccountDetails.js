var models = require('../models');
var Details = models.AccountDetails;

var DetailsPage = function (req, res) {
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }
        
        if (!doc) {
            return res.status(400).json({ error: "No Account Info Found" });
        }

        res.render('Account', {
            name: doc.name.first + " " + doc.name.last,
            email: doc.email,
            username: req.session.account.username
        });
    });

};

var ModifyDetailsPage = function (req, res) {
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }

        var details;

        if (!doc) {
            details = {
                name: { first: '', last: '' },
                email: ''
            };
        } else {
            details = {
                name: doc.name,
                email: doc.email
            };
        }
        
        res.render('AccountModify', details);
    });
};

var UpdateDetails = function (req, res) {
    
    console.log("sd;lfkjasd;lkjf");

    if (!req.body.firstName || !req.body.lastName) {
        return res.status(400).json({ error: "Please enter your full name" });
    }

    var detailsData = {
        name: { first: req.body.firstName, last: req.body.lastName },
        email: req.body.email,
        owner: req.session.account._id
    };

    var details;
    
    Details.AccountDetailsModel.findByOwner(req.session.account._id, function (err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: "An error occured" });
        }

        if (!doc) {
            details = new Details.AccountDetailsModel(detailsData);

        } else {
            details = doc;
            details.name = detailsData.name;
            details.email = detailsData.email;
        }
        
        details.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: "An error occured" });
            }
            
            res.json({ redirect: "/accountDetails" });
        });    
    });
};

module.exports.DetailsPage = DetailsPage;
module.exports.ModifyDetailsPage = ModifyDetailsPage;
module.exports.UpdateDetails = UpdateDetails;