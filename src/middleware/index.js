// Packify
// Middleware - index.js
// Author: Alex Fuerst

var RequiresLogin = function (req, res, next){
  
    if(!req.session.account){
        return res.redirect('/');
    }
    
    next();
};

var RequiresLogout = function (req, res, next) {
    if (req.session.account) {
        return res.redirect("/home");
    }

    next();
};

var RequiresTripEntryStarted = function (req, res, next) {

    global.redis.hgetall(req.session.account._id, function (err, obj) {
        if (err) {
            console.log(err);
            return res.redirect("/home");
        }

        if (!obj || !obj.newTrip) {
            return res.redirect("/home");
        }

        next();
    });
}

module.exports.RequiresLogin = RequiresLogin;
module.exports.RequiresLogout = RequiresLogout;
module.exports.RequiresTripEntryStarted = RequiresTripEntryStarted;