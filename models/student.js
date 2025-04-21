const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: String,

  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  results: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      marksObtained: Number,
      totalMarks: Number,
    },
  ],
  fees: {
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Partial"],
      default: "Unpaid",
    },
    amount: Number,
    dueDate: Date,
    lastPaidOn: Date,
  },

  attendance: {
    total: {
      type: Number,
      default: 0,
    },
    attended: {
      type: Number,
      default: 0,
    },
  },
});

const Student = new mongoose.model("Student", studentSchema);

module.exports = Student;
