const mongoose = require("mongoose");
const client = new mongoose.Schema({
  firstName: String,
  surname: String,
  phone: Number,
  documentNumber: String,
  address: String,
  city: String,
});
module.exports = mongoose.model("Client", client);
