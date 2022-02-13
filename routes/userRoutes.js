const User = require("../schemas/userSchema");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const authToken = require("../middleware/authenticationToken");
const isAuthenticated = require("../middleware/isAuthenticated");
const mongoose = require("mongoose");
const ApplicationException = require("../modules/exceptionModule");
const Types = User.schema.Types;
const Access = User.schema.Access;
module.exports = function (app) {
  app.get(
    "/user/get/all",
    authToken,
    isAuthenticated,
    async (req, res, next) => {
      try {
        try {
          let users = await User.find().select([
            "_id",
            "firstName",
            "surname",
            "phone",
            "email",
            "typeUser",
          ]);
          res.status(200).json({
            msg: "Users list passed",
            data: {
              users: users,
              types: Types,
              access: Access,
            },
            err: false,
          });
        } catch (error) {
          res.status(500).json({
            msg: "Error passing users list",
            err: error,
          });
          throw new ApplicationException("Error passing users list", error);
        }
      } catch (error) {
        next(error);
      }
    }
  );

  app.post("/user/add", isAuthenticated, authToken, (req, res) => {
    try {
      User.findOne({ username: req.body.email }, async (err, doc) => {
        if (err) {
          res.status(500).json({
            msg: err,
            err: true,
          });
        }
        if (doc)
          res.status(409).json({
            msg: "Konto pracownika o podanym loginie już istnieje",
            err: true,
          });
        if (!doc) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);

          let tempAccess;
          if (req.body.userType == "Pracownik") {
            tempAccess = Access[0];
          } else if (req.body.userType === "Właściciel") {
            tempAccess = Access[2];
          } else {
            tempAccess = Access[1];
          }
          const newUser = new User({
            username: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            surname: req.body.surname,
            email: req.body.email,
            typeUser: req.body.userType,
            accessUser: tempAccess,
            phone: req.body.phone,
          });
          await newUser.save();
          res.status(200).json({
            msg: "Adding employee success",
            err: false,
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        msg: "Error adding employee",
        err: error,
      });
      throw new ApplicationException("Error adding employee", error);
    }
  });

  app.delete(
    "/user/delete",
    isAuthenticated,
    authToken,
    async (req, res, next) => {
      try {
        try {
          await User.deleteMany({ _id: req.query.id });
        } catch (error) {
          res.status(500).json({
            msg: "Error removing employee",
            err: error,
          });
          throw new ApplicationException("Error removing employee", error);
        }
        res.status(200).json({
          msg: "Employee removed",
          err: false,
        });
      } catch (error) {
        next(error);
      }
    }
  );
  app.put(
    "/users/update",
    isAuthenticated,
    authToken,
    async (req, res, next) => {
      try {
        try {
          let password;
          if (req.query.password != "") {
            password = await bcrypt.hash(req.query.password, 10);
          } else {
            let user1 = await User.findOne({ _id: req.query._id }).select([
              "password",
            ]);
            password = user1.password;
          }
          const user = await User.updateOne(
            {
              _id: req.query._id,
            },
            {
              password: password,
              firstName: req.query.firstName,
              email: req.query.email,
              surname: req.query.surname,
              typeUser: req.query.typeUser,
              accessUser: req.query.accessUser,
              phone: req.query.phone,
            }
          );

          res.status(200).json({
            msg: "Employee updated",
            data: user,
            err: false,
          });
        } catch (error) {
          res.status(500).json({
            msg: "Error updating employee",
            err: error,
          });
          throw new ApplicationException("Error updating employee", error);
        }
      } catch (error) {
        next(error);
      }
    }
  );
};
