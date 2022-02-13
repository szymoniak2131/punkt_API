const Client = require("../schemas/clientSchema")
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use('clientLocal',
    new localStrategy({
      usernameField: "email",
      passwordField: "password"
      },(email, password, done) => {
      Client.findOne({ email: email }, (err, client) => {
        if (err) throw err;
        if (!client) return done(null, false);
        bcrypt.compare(password, client.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, client);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );

  passport.serializeUser((client, cb) => {
    cb(null, client.id);
  });
  passport.deserializeUser(function(obj, cb) {s
    cb(null, obj);
  });
};
