const mongoose = require("mongoose");
const error = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  message: String,
  error: String,
  name: String,
  stack: String,
});

module.exports = mongoose.model("Error", error);
