const sha = require("js-sha256");
var nodemailer = require("nodemailer");
const express = require("express");
const csv = require("csvtojson");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const path = require("path");
// const admin = require("firebase-admin");
const cors = require("cors");
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://sarvogyan-course-platform.firebaseio.com",
//   storageBucket: "https://sarvogyan-course-platform.appspot.com",
// });
// var pdfUtil = require("pdf-to-text");
var app = express();
// app.use(bodyParser.json());
connectDB();
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api", require("./api"));
// if (process.env.NODE_ENV === "production") {
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server started at port ${port}`));
