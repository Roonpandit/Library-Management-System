// src/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage to handle high-resolution images
const storage = multer.memoryStorage();

// Enhanced file filter to allow high-quality image formats
const fileFilter = (req, file, cb) => {
  // Allow common image formats including high-resolution ones
  const allowedFileTypes = /jpeg|jpg|png|webp|tiff|heic|heif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, WebP, TIFF, HEIC)"));
  }
};

// Increased file size limit for high-quality images
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for high-quality images
  fileFilter: fileFilter
});

module.exports = upload;