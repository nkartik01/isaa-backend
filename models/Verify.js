const mongoose = require("mongoose");
const { verify } = require("jsonwebtoken");
const verifySchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
});

module.exports = Verify = mongoose.model("verify", verifySchema);
