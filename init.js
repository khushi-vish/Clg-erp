const mongoose = require("mongoose");
const User = require("./models/user.js");
const Student = require("./models/student.js");
const Teacher = require("./models/teacher.js");
const Course = require("./models/course.js");
const Subject = require("./models/subject.js");

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/collegeERP");
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});

    // Create users
    const users = await User.create([
      { email: "admin@gmail.com", password: "123", role: "admin" },
      { email: "teacher@gmail.com", password: "123", role: "teacher" },
      { email: "teacher2@gmail.com", password: "123", role: "teacher" },
      { email: "teacher3@gmail.com", password: "123", role: "teacher" },
      { email: "teacher4@gmail.com", password: "123", role: "teacher" },
      { email: "teacher5@gmail.com", password: "123", role: "teacher" },
      { email: "student@gmail.com", password: "123", role: "student" },
      { email: "student2@gmail.com", password: "123", role: "student" },
      { email: "student3@gmail.com", password: "123", role: "student" },
      { email: "student4@gmail.com", password: "123", role: "student" },
      { email: "student5@gmail.com", password: "123", role: "student" },
    ]);

    // Create courses
    const courses = await Course.create([
      {
        name: "Bachelor of Computer Science",
        code: "BCS",
        duration: "4 years",
      },
      { name: "Bachelor of Engineering", code: "BE", duration: "4 years" },
      {
        name: "Bachelor of Business Administration",
        code: "BBA",
        duration: "3 years",
      },
      { name: "Bachelor of Commerce", code: "BCOM", duration: "3 years" },
      { name: "Bachelor of Arts", code: "BA", duration: "3 years" },
    ]);

    // Create subjects
    const subjects = await Subject.create([
      { name: "Data Structures", code: "CS101", course: courses[0]._id },
      { name: "Algorithms", code: "CS102", course: courses[0]._id },
      { name: "Database Systems", code: "CS103", course: courses[0]._id },
      { name: "Operating Systems", code: "CS104", course: courses[0]._id },
      { name: "Computer Networks", code: "CS105", course: courses[0]._id },
      { name: "Mechanics", code: "ME101", course: courses[1]._id },
      { name: "Thermodynamics", code: "ME102", course: courses[1]._id },
      { name: "Marketing", code: "BA101", course: courses[2]._id },
      { name: "Finance", code: "BA102", course: courses[2]._id },
      { name: "Accounting", code: "COM101", course: courses[3]._id },
    ]);

    // Create teachers
    const teachers = await Teacher.create([
      {
        user: users[1]._id,
        name: "John Smith",
        email: "teacher1@gmail.com",
        courses: [courses[0]._id],
        subjects: [subjects[0]._id, subjects[1]._id],
      },
      {
        user: users[2]._id,
        name: "Sarah Johnson",
        email: "teacher2@gmail.com",
        courses: [courses[0]._id],
        subjects: [subjects[2]._id, subjects[3]._id],
      },
      {
        user: users[3]._id,
        name: "Michael Brown",
        email: "teacher3@gmail.com",
        courses: [courses[1]._id],
        subjects: [subjects[5]._id, subjects[6]._id],
      },
      {
        user: users[4]._id,
        name: "Emily Davis",
        email: "teacher4@gmail.com",
        courses: [courses[2]._id],
        subjects: [subjects[7]._id, subjects[8]._id],
      },
      {
        user: users[5]._id,
        name: "Robert Wilson",
        email: "teacher5@gmail.com",
        courses: [courses[3]._id],
        subjects: [subjects[9]._id],
      },
    ]);

    // Update subjects with teacher references
    await Subject.updateMany(
      { _id: { $in: subjects.map((s) => s._id) } },
      { $set: { teacher: teachers[0]._id } }
    );

    // Create students
    const students = await Student.create([
      {
        user: users[6]._id,
        name: "Alice Johnson",
        rollNumber: "CS2023001",
        email: "student1@gmail.com",
        course: courses[0]._id,
        subjects: [subjects[0]._id, subjects[1]._id],
        results: [
          { subject: subjects[0]._id, marksObtained: 85, totalMarks: 100 },
          { subject: subjects[1]._id, marksObtained: 78, totalMarks: 100 },
        ],
        fees: {
          status: "Paid",
          amount: 50000,
          dueDate: new Date("2023-12-31"),
          lastPaidOn: new Date("2023-06-01"),
        },
        attendance: { total: 100, attended: 95 },
      },
      {
        user: users[7]._id,
        name: "Bob Wilson",
        rollNumber: "CS2023002",
        email: "student2@gmail.com",
        course: courses[0]._id,
        subjects: [subjects[2]._id, subjects[3]._id],
        results: [
          { subject: subjects[2]._id, marksObtained: 92, totalMarks: 100 },
          { subject: subjects[3]._id, marksObtained: 88, totalMarks: 100 },
        ],
        fees: {
          status: "Partial",
          amount: 50000,
          dueDate: new Date("2023-12-31"),
          lastPaidOn: new Date("2023-06-01"),
        },
        attendance: { total: 100, attended: 90 },
      },
      {
        user: users[8]._id,
        name: "Carol Davis",
        rollNumber: "ME2023001",
        email: "student3@gmail.com",
        course: courses[1]._id,
        subjects: [subjects[5]._id, subjects[6]._id],
        results: [
          { subject: subjects[5]._id, marksObtained: 75, totalMarks: 100 },
          { subject: subjects[6]._id, marksObtained: 82, totalMarks: 100 },
        ],
        fees: {
          status: "Unpaid",
          amount: 50000,
          dueDate: new Date("2023-12-31"),
        },
        attendance: { total: 100, attended: 85 },
      },
      {
        user: users[9]._id,
        name: "David Miller",
        rollNumber: "BA2023001",
        email: "student4@gmail.com",
        course: courses[2]._id,
        subjects: [subjects[7]._id, subjects[8]._id],
        results: [
          { subject: subjects[7]._id, marksObtained: 88, totalMarks: 100 },
          { subject: subjects[8]._id, marksObtained: 91, totalMarks: 100 },
        ],
        fees: {
          status: "Paid",
          amount: 40000,
          dueDate: new Date("2023-12-31"),
          lastPaidOn: new Date("2023-06-01"),
        },
        attendance: { total: 100, attended: 98 },
      },
      {
        user: users[10]._id,
        name: "Eve Thompson",
        rollNumber: "COM2023001",
        email: "student5@gmail.com",
        course: courses[3]._id,
        subjects: [subjects[9]._id],
        results: [
          { subject: subjects[9]._id, marksObtained: 95, totalMarks: 100 },
        ],
        fees: {
          status: "Paid",
          amount: 35000,
          dueDate: new Date("2023-12-31"),
          lastPaidOn: new Date("2023-06-01"),
        },
        attendance: { total: 100, attended: 100 },
      },
    ]);

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
