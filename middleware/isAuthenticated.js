const AUTH = require('.././routes/config.json')['AUTH'];

module.exports = function(req, res, next) {
    if(!AUTH){
      return next();
    }
    if (req.user) {
      return next();
    }
    return res.status(401)
    .send({
      err: "Unauthorized session",
      msg: "You are unathorized"
    });
  };