const sha = require("js-sha256");
var nodemailer = require("nodemailer");
const express = require("express");
const csv = require("csvtojson");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
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
app.use("/", require("./api"));
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server started at port ${port}`));

// exports.api = functions.https.onRequest(async (request, response) => {
//   var transport = nodemailer.createTransport({
//     host: "smtp.elasticemail.com",
//     port: 2525,
//     auth: {
//       user: "bewithkartik@gmail.com",
//       pass: "B1EC82773F4AA49CAA967FB044E221FE6283",
//     },
//   });
//   console.log(request.body);
//   // const fileId = await files.create(fileName, contentType, contentBuffer);
//   console.log("hash = ", sha.sha256(request.body));
//   //   pdfUtil.pdfToText(
//   //     "https://firebasestorage.googleapis.com/v0/b/isaa-project.appspot.com/o/KM%20FOR%20YOU%20BY%20ALIVE%20IS%20AWESOME.pdf?alt=media&token=c6fed607-be30-4e5a-9d8d-9d9a7af958ef",
//   //     function (err, data) {
//   //       if (err) throw err;
//   //       console.log(data); //print all text
//   //     }
//   //   );
//   //   extract(
//   //     "https://firebasestorage.googleapis.com/v0/b/isaa-project.appspot.com/o/KM%20FOR%20YOU%20BY%20ALIVE%20IS%20AWESOME.pdf?alt=media&token=c6fed607-be30-4e5a-9d8d-9d9a7af958ef",
//   //     function (err, pages) {
//   //       if (err) {
//   //         console.dir(err);
//   //         return;
//   //       }
//   //       console.dir(pages);
//   //     }
//   //   );
//   // let pdfPipe = request({
//   //   url:
//   //     "https://firebasestorage.googleapis.com/v0/b/isaa-project.appspot.com/o/KM%20FOR%20YOU%20BY%20ALIVE%20IS%20AWESOME.pdf?alt=media&token=c6fed607-be30-4e5a-9d8d-9d9a7af958ef",
//   //   encoding: null,
//   // }).pipe(pdfParser);

//   // pdfPipe.on("pdfParser_dataError", (err) => console.error(err));
//   // pdfPipe.on("pdfParser_dataReady", (pdf) => {
//   //optionally:
//   //let pdf = pdfParser.getMergedTextBlocksIfNeeded();

//   //   let count1 = 0;
//   //   //get text on a particular page
//   //   for (let page of pdf.formImage.Pages) {
//   //     count1 += page.Texts.length;
//   //   }

//   //   console.log(count1);
//   //   pdfParser.destroy();
//   // });
//   const converter = csv()
//     .fromFile("./Data.csv")
//     .then((json) => {
//       console.log(json);
//     });
//   var dt = new Date().getTime();
//   var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
//     c
//   ) {
//     var r = (dt + Math.random() * 16) % 16 | 0;
//     dt = Math.floor(dt / 16);
//     return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
//   });
//   console.log(uuid);
//   var q = `./${uuid}.csv`;
//   console.log(q, typeof q);
//   require("fs").writeFileSync(q, Buffer.from(request.body));

//   response.send("hi");
// });
