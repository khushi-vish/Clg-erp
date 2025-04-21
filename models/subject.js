const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  code: {
    type: String,
    required: true,
    unique: true,
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
});

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
