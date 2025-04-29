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

    // Create admin user
    const admin = await User.create({
      email: "admin@gmail.com",
      password: "123",
      role: "admin",
      profilePicture: "/uploads/profile-pictures/default-img.png",
    });

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
      { name: "Data Structures", code: "CS101" },
      { name: "Algorithms", code: "CS102" },
      { name: "Database Systems", code: "CS103" },
      { name: "Operating Systems", code: "CS104" },
      { name: "Computer Networks", code: "CS105" },
      { name: "Mechanics", code: "ME101" },
      { name: "Thermodynamics", code: "ME102" },
      { name: "Marketing", code: "BA101" },
      { name: "Finance", code: "BA102" },
      { name: "Accounting", code: "COM101" },
    ]);

    // Create teachers and their user accounts
    const teachers = await Teacher.create([
      {
        name: "John Smith",
        email: "teacher1@gmail.com",
        password: "123",
        subjects: [subjects[0]._id, subjects[1]._id],
      },
      {
        name: "Sarah Johnson",
        email: "teacher2@gmail.com",
        password: "123",
        subjects: [subjects[2]._id, subjects[3]._id],
      },
      {
        name: "Michael Brown",
        email: "teacher3@gmail.com",
        password: "123",
        subjects: [subjects[5]._id, subjects[6]._id],
      },
      {
        name: "Emily Davis",
        email: "teacher4@gmail.com",
        password: "123",
        subjects: [subjects[7]._id, subjects[8]._id],
      },
      {
        name: "Robert Wilson",
        email: "teacher5@gmail.com",
        password: "123",
        subjects: [subjects[9]._id],
      },
    ]);

    // Create user accounts for teachers
    for (const teacher of teachers) {
      await User.create({
        email: teacher.email,
        password: teacher.password,
        role: "teacher",
        teacher: teacher._id,
        profilePicture: "default-img.png",
      });
    }

    // Create students
    const students = await Student.create([
      {
        name: "Alice Johnson",
        rollNumber: "CS2023001",
        email: "student1@gmail.com",
        password: "123",
        course: courses[0]._id,
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
        name: "Bob Wilson",
        rollNumber: "CS2023002",
        email: "student2@gmail.com",
        password: "123",
        course: courses[0]._id,
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
        name: "Carol Davis",
        rollNumber: "ME2023001",
        email: "student3@gmail.com",
        password: "123",
        course: courses[1]._id,
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
        name: "David Miller",
        rollNumber: "BA2023001",
        email: "student4@gmail.com",
        password: "123",
        course: courses[2]._id,
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
        name: "Eve Thompson",
        rollNumber: "COM2023001",
        email: "student5@gmail.com",
        password: "123",
        course: courses[3]._id,
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

    // Create user accounts for students
    for (const student of students) {
      await User.create({
        email: student.email,
        password: student.password,
        role: "student",
        student: student._id,
        profilePicture: "default-img.png",
      });
    }

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
