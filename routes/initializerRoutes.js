const Client = require("../schemas/clientSchema");
const User = require("../schemas/userSchema");
const { clients } = require("../routes/initData/clientInitializationData.json");
const { users } = require("../routes/initData/userInitializationData.json");
const ApplicationException = require(".././modules/exceptionModule");
module.exports = function (app) {
  //Data initializer
  Client.find().then(async (data) => {
    if (data.length === 0) {
      try {
        await Client.insertMany(clients);
        console.log("Initial data for clients loaded");
      } catch (error) {
        throw new ApplicationException(
          "Failed to load initial data for clients",
          error
        );
      }
    }
  });

  User.find().then(async (data) => {
    if (data.length === 0) {
      try {
        await User.insertMany(users);
        console.log("Initial data for users loaded");
      } catch (error) {
        throw new ApplicationException(
          "Failed to load initial data for users",
          error
        );
      }
    }
  });
};
