const express = require("express");
const app = express();
const path = require("path");
const PORT = 5000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { auth, JWT_SECRET } = require("./middleware/auth.js");
const jwt = require("jsonwebtoken");

// models
const User = require("./models/user.js");
const Student = require("./models/student.js");
const Teacher = require("./models/teacher.js");
const Course = require("./models/course.js");
const Subject = require("./models/subject.js");

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// mongoose server =========================================

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/collegeERP");
}

// Routes =====================================================

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    if (user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else if (user.role === "student") {
      res.redirect("/student/dashboard");
    } else if (user.role === "teacher") {
      res.redirect("/teacher/dashboard");
    } else {
      res.status(403).send("Unauthorized role");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "An error occurred. Please try again." });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Protected routes
app.get("/admin/dashboard", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  res.render("dashboard", { role: "admin", error: null });
});

app.get("/student/dashboard", auth, async (req, res) => {
  if (req.user.role !== "student") {
    return res.redirect("/login");
  }

  try {
    const user = await Student.findOne({ email: req.user.email });
    res.render("dashboard", { role: "student", user, error: null });
  } catch (error) {
    console.log(error);
    res.status(500).render("dashboard", {
      role: "student",
      error: "Failed to load student data",
      user: null,
    });
  }
});

app.get("/teacher/dashboard", auth, async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.redirect("/login");
  }

  try {
    const user = await Teacher.findOne({ email: req.user.email });
    res.render("dashboard", { role: "teacher", user, error: null });
  } catch (error) {
    console.log(error);
    res.status(500).render("dashboard", {
      role: "teacher",
      error: "Failed to load teacher data",
      user: null,
    });
  }
});

// server =====================================================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
