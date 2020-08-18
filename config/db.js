const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongodb");
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongo db connected");
  } catch (err) {
    console.log(err.message);
    //exit process with failure
    process.exit(1);
  }
};
module.exports = connectDB;
