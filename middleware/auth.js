const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  console.log(1, token);
  if (!token) {
    return res.status(401).json({ msg: "NO token. Auth Failed" });
  }
  try {
    console.log(token);
    const decoded = jwt.verify(token, config.get("JWTSecret"));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
