const mongoose = require("mongoose");
const certSchema = new mongoose.Schema({
  csv: {
    type: String,
    required: true,
  },
  cert: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  coordinates: [
    {
      fieldName: {
        type: String,
        required: true,
      },
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = Cert = mongoose.model("cert", certSchema);
