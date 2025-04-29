const express = require("express");
const app = express();
const path = require("path");
const PORT = 5000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { auth, JWT_SECRET } = require("./middleware/auth.js");
const jwt = require("jsonwebtoken");
const upload = require("./middleware/upload.js");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // Populate role-specific data based on user role
    if (user.role === "student") {
      const student = await Student.findById(user.student);
      req.user = { ...user.toObject(), studentData: student };
      res.redirect("/student/dashboard");
    } else if (user.role === "teacher") {
      const teacher = await Teacher.findById(user.teacher);
      req.user = { ...user.toObject(), teacherData: teacher };
      res.redirect("/teacher/dashboard");
    } else if (user.role === "admin") {
      res.redirect("/admin/dashboard");
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

// Profile Routes ==============================================
app.get("/:role/dashboard/profile", auth, async (req, res) => {
  const role = req.params.role;
  if (req.user.role !== role) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    res.render(`${role}/profile`, {
      role: role,
      user: user,
      currentRoute: `/${role}/dashboard/profile`,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.redirect(`/${role}/dashboard`);
  }
});

app.post(
  "/:role/profile/upload",
  auth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const role = req.params.role;

      if (req.user.role !== role) {
        return res.status(403).send("Unauthorized");
      }

      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      // Update user's profile picture path in database
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          profilePicture: `/uploads/profile-pictures/${req.file.filename}`,
        },
        { new: true }
      );

      // Redirect back to appropriate profile page
      res.redirect(`/${role}/dashboard/profile`);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).send("Error uploading file");
    }
  }
);

// Admin Routes ==============================================
app.get("/admin/dashboard", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    const [totalStudents, totalTeachers, totalCourses, totalSubjects] =
      await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Course.countDocuments(),
        Subject.countDocuments(),
      ]);

    res.render("admin/dashboard", {
      role: "admin",
      error: null,
      user: user,
      currentRoute: "/admin/dashboard",
      stats: {
        students: totalStudents,
        teachers: totalTeachers,
        courses: totalCourses,
        subjects: totalSubjects,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.render("admin/dashboard", {
      role: "admin",
      error: "Error loading dashboard statistics",
      user: req.user,
      currentRoute: "/admin/dashboard",
      stats: {
        students: 0,
        teachers: 0,
        courses: 0,
        subjects: 0,
      },
    });
  }
});

app.get("/admin/profile", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    res.render("admin/profile", {
      role: "admin",
      user: user,
      currentRoute: "/admin/profile",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.render("admin/profile", {
      role: "admin",
      user: req.user,
      currentRoute: "/admin/profile",
    });
  }
});

app.get("/admin/course/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    const subjects = await Subject.find({});

    res.render("admin/course-form", {
      role: "admin",
      currentRoute: "/admin/course/add",
      user: user,
      subjects: subjects,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.render("admin/course-form", {
      role: "admin",
      currentRoute: "/admin/course/add",
      user: req.user,
      subjects: [],
      error: "Error loading form. Please try again.",
      success: null,
    });
  }
});

app.post("/admin/course/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const { name, code, subjects } = req.body;

    // Check if course with same name or code already exists
    const existingCourse = await Course.findOne({
      $or: [{ name }, { code }],
    });

    if (existingCourse) {
      return res.render("admin/course-form", {
        role: "admin",
        currentRoute: "/admin/course/add",
        user: req.user,
        subjects: await Subject.find({}),
        error: "A course with this name or code already exists",
        success: null,
      });
    }

    // Create new course
    const newCourse = await Course.create({
      name,
      code,
      subjects: subjects || [],
    });

    res.render("admin/course-form", {
      role: "admin",
      currentRoute: "/admin/course/add",
      user: req.user,
      subjects: await Subject.find({}),
      error: null,
      success: "Course added successfully!",
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.render("admin/course-form", {
      role: "admin",
      currentRoute: "/admin/course/add",
      user: req.user,
      subjects: await Subject.find({}),
      error: "Error creating course. Please try again.",
      success: null,
    });
  }
});

app.get("/admin/subject/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    res.render("admin/subject-form", {
      role: "admin",
      currentRoute: "/admin/subject/add",
      user: user,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.render("admin/subject-form", {
      role: "admin",
      currentRoute: "/admin/subject/add",
      user: req.user,
      error: "Error loading form. Please try again.",
      success: null,
    });
  }
});

app.post("/admin/subject/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const { name, code } = req.body;

    // Check if subject with same name or code already exists
    const existingSubject = await Subject.findOne({
      $or: [{ name }, { code }],
    });

    if (existingSubject) {
      return res.render("admin/subject-form", {
        role: "admin",
        currentRoute: "/admin/subject/add",
        user: req.user,
        error: "A subject with this name or code already exists",
        success: null,
      });
    }

    // Create new subject
    const newSubject = await Subject.create({
      name,
      code,
    });

    res.render("admin/subject-form", {
      role: "admin",
      currentRoute: "/admin/subject/add",
      user: req.user,
      error: null,
      success: "Subject added successfully!",
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.render("admin/subject-form", {
      role: "admin",
      currentRoute: "/admin/subject/add",
      user: req.user,
      error: "Error creating subject. Please try again.",
      success: null,
    });
  }
});

app.get("/admin/student/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    const courses = await Course.find({});

    res.render("admin/student-form", {
      role: "admin",
      currentRoute: "/admin/student/add",
      user: user,
      courses: courses,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.render("admin/student-form", {
      role: "admin",
      currentRoute: "/admin/student/add",
      user: req.user,
      courses: [],
      error: "Error loading form. Please try again.",
      success: null,
    });
  }
});

app.post("/admin/student/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const {
      name,
      rollNumber,
      email,
      password,
      course,
      "fees.amount": feesAmount,
      "fees.dueDate": feesDueDate,
    } = req.body;

    // Check if student with same roll number or email already exists
    const existingStudent = await Student.findOne({
      $or: [{ rollNumber }, { email }],
    });

    if (existingStudent) {
      return res.render("admin/student-form", {
        role: "admin",
        currentRoute: "/admin/student/add",
        user: req.user,
        courses: await Course.find({}),
        error: "A student with this roll number or email already exists",
        success: null,
      });
    }

    // Create new student
    const newStudent = await Student.create({
      name,
      rollNumber,
      email,
      password, // This will be hashed by the user schema
      course,
      fees: {
        status: "Unpaid",
        amount: Number(feesAmount),
        dueDate: new Date(feesDueDate),
      },
      attendance: {
        total: 0,
        attended: 0,
      },
    });

    // Create user account for the student
    const newUser = await User.create({
      email,
      password,
      role: "student",
      student: newStudent._id,
    });

    res.render("admin/student-form", {
      role: "admin",
      currentRoute: "/admin/student/add",
      user: req.user,
      courses: await Course.find({}),
      error: null,
      success: "Student added successfully!",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.render("admin/student-form", {
      role: "admin",
      currentRoute: "/admin/student/add",
      user: req.user,
      courses: await Course.find({}),
      error: "Error creating student. Please try again.",
      success: null,
    });
  }
});

app.get("/admin/teacher/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.user._id);
    const courses = await Course.find({});
    const subjects = await Subject.find({});

    res.render("admin/teacher-form", {
      role: "admin",
      currentRoute: "/admin/teacher/add",
      user: user,
      courses: courses,
      subjects: subjects,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.render("admin/teacher-form", {
      role: "admin",
      currentRoute: "/admin/teacher/add",
      user: req.user,
      courses: [],
      subjects: [],
      error: "Error loading form. Please try again.",
      success: null,
    });
  }
});

app.post("/admin/teacher/add", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const { name, email, password, subjects } = req.body;

    // Check if teacher with same email already exists
    const existingTeacher = await Teacher.findOne({ email });

    if (existingTeacher) {
      return res.render("admin/teacher-form", {
        role: "admin",
        currentRoute: "/admin/teacher/add",
        user: req.user,
        courses: await Course.find({}),
        subjects: await Subject.find({}),
        error: "A teacher with this email already exists",
        success: null,
      });
    }

    // Create new teacher
    const newTeacher = await Teacher.create({
      name,
      email,
      password,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
    });

    // Create user account for the teacher
    const newUser = await User.create({
      email,
      password,
      role: "teacher",
      teacher: newTeacher._id,
      profilePicture: "/uploads/profile-pictures/default-img.png",
    });

    res.render("admin/teacher-form", {
      role: "admin",
      currentRoute: "/admin/teacher/add",
      user: req.user,
      courses: await Course.find({}),
      subjects: await Subject.find({}),
      error: null,
      success: "Teacher added successfully!",
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.render("admin/teacher-form", {
      role: "admin",
      currentRoute: "/admin/teacher/add",
      user: req.user,
      courses: await Course.find({}),
      subjects: await Subject.find({}),
      error: "Error creating teacher. Please try again.",
      success: null,
    });
  }
});

// Student Routes ==============================================

app.get("/student/dashboard", auth, async (req, res) => {
  if (req.user.role !== "student") {
    return res.redirect("/login");
  }

  try {
    const user = await Student.findOne({ email: req.user.email }).populate({
      path: "course",
      populate: {
        path: "subjects",
      },
    });
    res.render("student/dashboard", { role: "student", user, error: null });
  } catch (error) {
    console.log(error);
    res.status(500).render("dashboard", {
      role: "student",
      error: "Failed to load student data",
      user: null,
    });
  }
});

// Teacher Routes ==============================================

app.get("/teacher/dashboard", auth, async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.redirect("/login");
  }

  try {
    const user = await Teacher.findOne({ email: req.user.email });
    res.render("teacher/dashboard", { role: "teacher", user, error: null });
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
