const express = require("express");
const config = require("config");
const { jsPDF } = require("jspdf");
const { createCanvas, loadImage } = require("canvas");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const csv = require("csvtojson");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const sha = require("js-sha256");
const axios = require("axios");
const fs = require("fs");
const { PDFNet } = require("@pdftron/pdfnet-node");
const User = require("./models/User");
const Cert = require("./models/Cert");
const Verify = require("./models/Verify");
const { ObjectId } = require("mongodb");
const auth = require("./middleware/auth");
var ip = config.get("ip");

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password must be atleast 6 characters long.").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const { name, email, password, school } = req.body;

    try {
      var user1 = await User.findOne({ email });
      if (user1) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      user = new User({
        name,
        email,
        password,
        school: school.toUpperCase(),
        certs: [],
      });
      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(password, salt);
      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, config.get("JWTSecret"), (err, token) => {
        if (err) throw err;
        return res.json({ token });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send("User Register failed");
    }
  }
);

// @route Post api/users
// @desc  test route
// @access Public
router.post(
  "/login",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password must be atleast 6 characters long.").exists(),
  ],

  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const { email, password } = req.body;
    try {
      var user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      console.log(1);
      const ismatch = await bcryptjs.compare(password, user.password);
      if (!ismatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      console.log(2);
      const payload = {
        user: {
          id: user.id,
        },
      };
      console.log(3);
      jwt.sign(payload, config.get("JWTSecret"), (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.log(err);
      res.send("Error");
    }
  }
);

router.post("/encrypt", async (req, res) => {
  try {
    console.log("hi");
    var hash1 = await axios.post("http://" + ip + ":5000/hashOf", {
      fileName: req.body.details.csvFile,
    });
    hash1 = hash1.data.hash;
    var hash2 = await axios.post("http://" + ip + ":5000/hashOf", {
      fileName: req.body.details.certFile,
    });
    hash2 = hash2.data.hash;
    var hashConcat = hash1.concat(hash2);
    var json = await csv().fromFile(req.body.details.csvFile);
    req.body.details.userData = json[req.body.details.csvSerial];
    const crypt = sha.sha256(hashConcat);
    console.log(crypt);
    req.body.details.hash = hashConcat;
    const payload = {
      details: req.body.details,
      iat: 100,
    };
    jwt.sign(payload, crypt, (err, token) => {
      if (err) throw err;
      console.log(token);
      jwt.sign(
        {
          verifivationCode: sha.sha256(token),
          details: req.body.details,
          iat: 100,
        },
        "MySecretKey",
        (err2, token2) => {
          if (err) throw err;
          res.json({ jwt: token2 });
        }
      );
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/decrypt", async (req, res) => {
  var i = 0;
  var decoded = jwt.verify(req.body.token, "MySecretKey");
  var result = await axios.post(
    "http://" + ip + ":5000/encrypt",
    {
      details: decoded.details,
    }
    // { headers: { "x-auth-token": req.headers["x-auth-token"] } }
  );
  console.log(result.data, req.body);
  var decoded2 = jwt.verify(result.data.jwt, "MySecretKey");
  var keys = Object.keys(decoded.details);
  if (result.data.jwt === req.body.token) {
    console.log("token matched");
    if (decoded.verifivationCode === decoded2.verifivationCode) {
      console.log("verification token matched");
      for (var i = 0; i < keys.length; i++) {
        if (decoded.details[keys[i]] !== decoded2.details[keys[i]]) {
          if (typeof decoded.details[keys[i]] === "object") {
            var keys2 = Object.keys(decoded.details[keys[i]]);
            for (var j = 0; j < keys2.length; j++) {
              if (
                decoded.details[keys[i]][keys2[j]] !==
                decoded2.details[keys[i]][keys2[j]]
              ) {
                return res.status(400).json({ msg: "wrong info" });
              }
            }
            console.log(
              keys[i] + " verified " + decoded.details[keys[i]][keys2[j]]
            );
          }
        } else {
          console.log(keys[i] + " verified " + decoded.details[keys[i]]);
        }
      }
    }
  }

  res.send(decoded);
});

router.post("/putName/:docId", auth, async (req, res) => {
  console.log(req.params.docId);
  var xyz = await Cert.find({ _id: ObjectId(req.params.docId) });
  xyz = xyz[0];
  console.log("xyz", xyz);
  var abc = {};
  for (var i = 0; i < xyz.coordinates.length; i++) {
    abc[xyz.coordinates[i].fieldName] = {
      x: xyz.coordinates[i].x,
      y: xyz.coordinates[i].y,
      width: xyz.coordinates[i].width,
      height: xyz.coordinates[i].height,
    };
  }
  console.log(abc);
  var user = await User.findOne({ _id: req.user.id });
  const width = 1200;
  const height = 600;
  var fileName = "./cert/" + xyz.cert;
  var json = await csv().fromFile("./csv/" + xyz.csv);
  // console.log(json[0]);
  user.certs.unshift({
    uuid: req.params.docId,
    count: json.length,
    date: Date.now(),
  });
  console.log(user);
  await user.save();
  var c1 = 0;
  var c2 = 0;
  for (var i = 0; i < json.length; i++) {
    var canvas = createCanvas(width, height);
    var context = canvas.getContext("2d");
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = "#000000";
    image = await loadImage(fileName);
    context.drawImage(image, 0, 0, 1200, 600);
    var keys = Object.keys(abc);
    resObject = [];
    for (var j = 0; j < keys.length; j++) {
      context.font = "bold " + abc[keys[j]].height + "px Arial";
      // console.log(abc[keys[j]].height);
      context.fillText(json[i][keys[j]], abc[keys[j]].x, abc[keys[j]].y);
    }
    var imgData = canvas.toBuffer("image/png");
    // console.log(imgData);
    var pdfContent = new jsPDF({
      orientation: "l",
      unit: "mm",
      format: [297, 210],
    });
    var ret = pdfContent.addImage(imgData, "PNG", 3, 3, 291, 200);
    var body = {
      details: {
        csvFile: "./csv/" + xyz.csv,
        certFile: fileName,
        csvSerial: i,
        docId: req.params.docId,
      },
    };
    var res1 = await axios.post("http://" + ip + ":5000/encrypt", body);
    var token = res1.data.jwt;
    var ver = new Verify({ token: token });
    await ver.save();
    pdfContent.textWithLink("Click here to Verify the Certificate", 200, 210, {
      url: "http://" + ip + ":3000/#/verify/" + ver._id,
    });
    var data = new Buffer(pdfContent.output("arraybuffer"));
    await PDFNet.initialize();
    const doc = await PDFNet.PDFDoc.createFromBuffer(data);
    doc.initSecurityHandler();
    console.log("PDFNet and PDF document initialized and locked");
    const sigHandlerId = await doc.addStdSignatureHandlerFromFile(
      "./ISAA.pfx",
      "@Kartik01"
    );
    const sigField = await doc.fieldCreate(
      "Signature1",
      PDFNet.Field.Type.e_signature
    );
    const page1 = await doc.getPage(1);
    const widgetAnnot = await PDFNet.WidgetAnnot.create(
      await doc.getSDFDoc(),
      await PDFNet.Rect.init(0, 0, 0, 0),
      sigField
    );
    page1.annotPushBack(widgetAnnot);
    widgetAnnot.setPage(page1);
    const widgetObj = await widgetAnnot.getSDFObj();
    widgetObj.putNumber("F", 132);
    widgetObj.putName("Type", "Annot");
    const sigDict = await sigField.useSignatureHandler(sigHandlerId);
    sigDict.putName("SubFilter", "adbe.pkcs7.detached");
    sigDict.putString("Name", "VITC_ISAA");
    data = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);
    console.log("hi");
    try {
      var transport = nodemailer.createTransport({
        host: "smtp.elasticemail.com",
        port: 2525,
        auth: {
          user: "bewithkartik@gmail.com",
          pass: "B1EC82773F4AA49CAA967FB044E221FE6283",
        },
      });
      var mailOptions = {
        from: "'bewithkartik' <bewithkartik@gmail.com>",
        to: json[i].email,
        subject: "Your Certificate for " + xyz.name,
        html: `<p>${xyz.msg}</p>`,
        attachments: [
          {
            filename: "cert.pdf",
            content: data,
            contentType: "application/vnd.pdf",
          },
        ],
      };
      console.log(mailOptions);
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          c1 = c1 + 1;
          console.log(error);
          resObject[mailOptions.to] = "Not Sent";
        } else {
          console.log("Message sent: %s", info.messageId);
          c2 = c2 + 1;
        }
        if (c1 + c2 === json.length) {
          if (c1 !== 0) {
            var failList1 = Object.keys(resObject);
            var failList = "";
            for (var k = 0; k < c1; k++) {
              failList = failList + "<li>" + failList1[k] + "</li>";
            }
            var transport = nodemailer.createTransport({
              host: "smtp.elasticemail.com",
              port: 2525,
              auth: {
                user: "bewithkartik@gmail.com",
                pass: "B1EC82773F4AA49CAA967FB044E221FE6283",
              },
            });
            var mailOptions = {
              from: "'bewithkartik' <bewithkartik@gmail.com>",
              to: xyz.email,
              subject: "Error in sending Certificate for " + xyz.name,
              html:
                `<div><p>Email Could not be sent to the following Addresses provided in the CSV</p><list>` +
                failList +
                `</list></div>`,
            };
            console.log(mailOptions);
            transport.sendMail(mailOptions, (error, info) => {});
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
  return res.send("Processing");
});

router.get("/verify/:docId", async (req, res) => {
  console.log(req.params.docId);
  var xyz = await Verify.find({ _id: ObjectId(req.params.docId) });
  xyz = xyz[0];
  console.log("xyz", xyz);
  var decoded = await axios.post("http://" + ip + ":5000/decrypt", {
    token: xyz.token,
  });
  console.log(decoded.data);
  var zxc = await Cert.find({ _id: decoded.data.details.docId });
  zxc = zxc[0];
  var abc = {};
  for (var i = 0; i < zxc.coordinates.length; i++) {
    abc[zxc.coordinates[i].fieldName] = {
      x: zxc.coordinates[i].x,
      y: zxc.coordinates[i].y,
      width: zxc.coordinates[i].width,
      height: zxc.coordinates[i].height,
    };
  }
  console.log(abc);
  const width = 1200;
  const height = 600;
  var fileName = "./cert/" + zxc.cert;
  var json = await csv().fromFile("./csv/" + zxc.csv);
  console.log(json[0]);
  var imageCaption = "Image caption";
  var i = decoded.data.details.csvSerial;
  var canvas = createCanvas(width, height);
  var context = canvas.getContext("2d");

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = "#000000";

  image = await loadImage(fileName);
  context.drawImage(image, 0, 0, 1200, 600);
  var keys = Object.keys(abc);
  for (var j = 0; j < keys.length; j++) {
    context.font = "bold " + abc[keys[j]].height + "px Arial";
    context.fillText(json[i][keys[j]], abc[keys[j]].x, abc[keys[j]].y);
  }
  var imgData = canvas.toBuffer("image/png");
  return res.send(imgData);
});

router.post("/saveCSV", auth, async (req, res) => {
  try {
    console.log(req.files.csv);
    var file = req.files.csv;
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    console.log(uuid);
    var q = `./csv/${uuid}.csv`;
    console.log(q, typeof q, file.data);
    require("fs").writeFileSync(q, file.data);
    return res.json({ uuid: uuid, csvFile: uuid + ".csv" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/saveCoordinates", auth, async (req, res) => {
  try {
    console.log(req.body);
    var cert = new Cert(req.body);
    await cert.save();
    return res.send(cert);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/saveCert/:uuid", auth, async (req, res) => {
  var file = req.files.cert;
  var dt = new Date().getTime();
  var uuid = req.params.uuid;
  var q = `./cert/${uuid}.${req.headers["extension"]}`;
  require("fs").writeFileSync(q, file.data);
  return res.json({ certFile: uuid + "." + req.headers["extension"] });
});

router.get("/getFields/:csvFile", auth, async (req, res) => {
  var json = await csv().fromFile("./csv/" + req.params.csvFile);
  res.send(Object.keys(json[0]));
});

router.post("/sendMail/:email/:eventName/:msg", async (req, res) => {
  try {
    var transport = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 2525,
      auth: {
        user: "bewithkartik@gmail.com",
        pass: "B1EC82773F4AA49CAA967FB044E221FE6283",
      },
    });
    var mailOptions = {
      from: "'bewithkartik' <bewithkartik@gmail.com>",
      to: req.params.email,
      subject: "Your Certificate for " + req.params.eventName,
      html: `<p>${req.params.msg}</p>`,
      attachments: [
        {
          filename: "cert.pdf",
          content: req.body,
          contentType: "application/vnd.pdf",
        },
      ],
    };
    console.log(mailOptions);
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(400).send(err);
      }
      console.log("Message sent: %s", info.messageId);
      res.send("success");
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
router.post("/hashOf", async (req, res) => {
  try {
    if (req.files) {
      var file = req.files.file;
      console.log("hi", file);
      var hash = sha.sha256(file.data);
      console.log("hash = ", hash);
      return res.json({ hash: hash });
    } else {
      fs.readFile(req.body.fileName, async (err, data) => {
        if (err) throw err;
        var hash = sha.sha256(data);
        console.log("hash = ", hash);
        return res.json({ hash: hash });
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/sign", auth, async (req, res) => {
  try {
    var imgData = req.body.img;
    console.log(imgData);
    var pdfContent = new jsPDF();
    var ret = pdfContent.addImage(imgData, "PNG", 20, 20, 540, 270);
    var data = new Buffer(pdfContent.output("arraybuffer"));

    fs.appendFile("./canvas.pdf", data, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("PDF created");
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getPersonalReport", auth, async (req, res) => {
  try {
    var user = await User.findOne({ _id: req.user.id });
    if (!user) {
      console.log("user not found");
      return res.status(400).send("User not found");
    }
    var report = { date: {} };
    for (var i = 0; i < user.certs.length; i++) {
      var date =
        user.certs[i].date.getDate() +
        "-" +
        user.certs[i].date.getMonth() +
        "-" +
        user.certs[i].date.getFullYear();
      if (!report.date[date]) {
        report.date[date] = [];
      }
      report.date[date].unshift(user.certs[i]);
    }
    res.send(report);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getSchoolReport/:school", async (req, res) => {
  try {
    var users = await User.find({ school: req.params.school });
    var report = { date: {}, user: {} };
    for (var i = 0; i < users.length; i++) {
      report.user[users[i].name] = users[i].certs;
      for (var j = 0; j < users[i].certs.length; j++) {
        var date =
          users[i].certs[j].date.getDate() +
          "-" +
          users[i].certs[j].date.getMonth() +
          "-" +
          users[i].certs[j].date.getFullYear();
        if (!report.date[date]) report.date[date] = {};
        if (!report.date[date][users[i].name])
          report.date[date][users[i].name] = [];
        report.date[date][users[i].name].unshift(users[i].certs[j]);
      }
    }
    return res.send(report);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/sendImage/:fileName", async (req, res) => {
  fs.readFile("./cert/" + req.params.fileName, async (err, data) => {
    if (err) throw err;
    return res.send(data);
  });
});

module.exports = router;