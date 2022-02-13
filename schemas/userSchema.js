const mongoose = require("mongoose");
const types = ["Pracownik", "Właściciel", "Technik"];
const access = ["employee", "support", "admin"];
const user = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  surname: String,
  phone: Number,
  email: String,
  typeUser: {
    type: String,
    enum: types,
    default: "Pracownik",
  },
  accessUser: {
    type: [String],
    enum: access,
    default: "support",
  },
});
user.Types = types;
user.Access = access;
module.exports = mongoose.model("User", user);
