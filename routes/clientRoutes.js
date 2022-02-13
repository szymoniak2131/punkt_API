const Client = require("../schemas/clientSchema");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const isAuthenticated = require("../middleware/isAuthenticated");
const authToken = require("../middleware/authenticationToken");
const ApplicationException = require("../modules/exceptionModule");
module.exports = function (app) {
  app.get(
    "/client/get/all",
    authToken,

    async (req, res, next) => {
      try {
        try {
          let clients = await Client.find().select([
            "_id",
            "firstName",
            "surname",
            "phone",
            "documentNumber",
            "address",
            "city",
          ]);
          res.status(200).json({
            msg: "Clients list passed",
            data: clients,
            err: false,
          });
        } catch (error) {
          res.status(500).json({
            msg: "Error passing clients list",
            err: error,
          });
          throw new ApplicationException("Error passing clients list", error);
        }
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    "/client/add",
    isAuthenticated,
    authToken,
    async (req, res, next) => {
      try {
        try {
          const client = await Client.findOne({
            email: req.body.documentNumber,
          });
          if (client) {
            res.status(422).json({
              msg: "Client with this document is exist",
              err: true,
            });
          } else {
            const newClient = new Client({
              firstName: req.body.firstname,
              surname: req.body.surname,
              phone: req.body.phone,
              documentNumber: req.body.documentNumber,
              address: req.body.address,
              city: req.body.city,
            });
            const client = await newClient.save();
            res.status(200).json({
              msg: "Client created",
              data: client,
              err: false,
            });
          }
        } catch (error) {
          res.status(500).json({
            msg: "Error creating client",
            err: error,
          });
          throw new ApplicationException("Error creating client", error);
        }
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    "/client/delete",
    isAuthenticated,
    authToken,
    async (req, res, next) => {
      try {
        try {
          await Client.deleteMany({ _id: req.query.id });
        } catch (error) {
          res.status(500).json({
            msg: "Error removing client",
            err: error,
          });
          throw new ApplicationException("Error removing client", error);
        }
        try {
          res.status(200).json({
            msg: "Client removed",
            err: false,
          });
        } catch (error) {
          res.status(500).json({
            msg: "Error removing clients invitations",
            err: error,
          });
          throw new ApplicationException(
            "Error removing clients invitations",
            error
          );
        }
      } catch (error) {
        next(error);
      }
    }
  );
  app.put(
    "/client/update",
    isAuthenticated,
    authToken,
    async (req, res, next) => {
      try {
        try {
          const client = await Client.updateOne(
            {
              _id: req.query._id,
            },
            {
              $set: req.query,
            }
          );
          res.status(200).json({
            msg: "Client updated",
            data: client,
            err: false,
          });
        } catch (error) {
          res.status(500).json({
            msg: "Error updating client",
            err: error,
          });
          throw new ApplicationException("Error updating client", error);
        }
      } catch (error) {
        next(error);
      }
    }
  );
};
