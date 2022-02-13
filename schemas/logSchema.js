const mongoose = require("mongoose");
const log = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  message: String,
  type: String,
});

module.exports = mongoose.model("Log", log);
