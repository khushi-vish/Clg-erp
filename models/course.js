const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  code: {
    type: String,
    required: true,
    unique: true,
  },

  duration: String,

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
