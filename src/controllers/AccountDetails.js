var models = require('../models');
var Details = models.AccountDetails;

var DetailsPage = function (req, res) {
    res.render('Account', {
        name: "test",
        email: "test2",
        username: req.session.account.username
    });
};

var ModifyDetailsPage = function (req, res) {
    res.render('AccountModify', {
        name: { first: 'test1', last: 'test2' }, 
        email: 'test3'       
    });
};

module.exports.DetailsPage = DetailsPage;
module.exports.ModifyDetailsPage = ModifyDetailsPage;