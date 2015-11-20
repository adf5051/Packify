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
        return res.redirect("/accountDetails");
    }

    next();
};

module.exports.RequiresLogin = RequiresLogin;
module.exports.RequiresLogout = RequiresLogout;