const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },

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
