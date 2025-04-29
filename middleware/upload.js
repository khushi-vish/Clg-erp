const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-pictures/"); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp + original extension
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

// Create the multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB max file size
  },
});

module.exports = upload;
