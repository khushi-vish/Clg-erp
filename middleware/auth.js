const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const JWT_SECRET = "your-secret-key"; // In production, use environment variable

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    res.redirect("/login");
  }
};

module.exports = { auth, JWT_SECRET };
