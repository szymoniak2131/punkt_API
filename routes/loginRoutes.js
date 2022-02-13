const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middleware/isAuthenticated");
const ApplicationException = require("../modules/exceptionModule");
const { ApplicationLogger } = require("../modules/loggerModule");
const { json } = require("body-parser");
module.exports = function (app) {
  //[OPEN] [POST] user login route
  let refreshTokens = [];
  app.post("/login", async (req, res, next) => {
    passport.authenticate("local", async (error, user, info) => {
      if (error) {
        throw new ApplicationException(error);
      }
      ApplicationLogger("Log in", `User ${user.username} authenticated`);
      if (!user) {
        res.status(401).json({
          msg: "Invalid credentials",
          err: true,
        });
      } else {
        req.logIn(user, async (error) => {
          if (error) {
            throw new ApplicationException(error);
          }

          const body = { _id: user._id, username: user.username };

          const accesToken = await jwt.sign(
            { user: body },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
          );

          const refreshToken = await jwt.sign(
            { user: body },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );

          refreshTokens.push(refreshToken);
          res.status(200).send({
            msg: "User authenticated",
            accessToken: accesToken,
            refreshToken: refreshToken,
            user: user,
            err: false,
          });
          //  res.json({ token: token, auth: true, user: user });
        });
      }
    })(req, res, next);
  });

  app.post("/token", async (req, res) => {
    const refreshToken = req.header("x-auth-token");
    if (!refreshToken) {
      res.status(401).json({
        errors: [
          {
            msg: "Token not found",
          },
        ],
      });
    }
    if (!refreshTokens.includes(refreshToken)) {
      res.status(403).json({
        errors: [
          {
            msg: "Invalid refresh token",
          },
        ],
      });
    }

    try {
      const user = await JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const body = { _id: user._id, username: user.username };
      const accessToken = await JWT.sign(
        { user: body },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10m" }
      );
      res.json({ accessToken });
    } catch (error) {
      res.status(403).json({
        errors: [
          {
            msg: "Invalid token",
          },
        ],
      });
    }
  });

  //[SECURED] [GET] logout route
  app.get("/logout", isAuthenticated, (req, res, next) => {
    res.status(200).send({
      msg: "User logged out",
      err: false,
    });

    req.logout();
  });

  //[SECURED] [POST] register route
  app.post("/register", isAuthenticated, async (req, res, next) => {
    try {
      try {
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          res.status(409).json({
            msg: "User account already exists",
            err: false,
          });
        } else {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
          });
          await newUser.save();
          res.status(200).send({
            msg: "User created",
            err: false,
          });
        }
      } catch (error) {
        throw new ApplicationException(error);
      }
    } catch (error) {
      next(error);
    }
  });

  //[SECURED] [GET] user
  app.get("/user", isAuthenticated, async (req, res) => {
    if (!req.user) {
      res.status(401).send({ error: "Failed" });
    } else {
      const user = await User.findOne({ _id: req.user });
      res.status(200).send(user);
    }
  });
  //[SECURED] [GET] main
  app.get("/", isAuthenticated, (req, res) => {
    res.send("API bpDEV authenticated");
  });
};
