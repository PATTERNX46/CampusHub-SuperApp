const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-super-app', // Folder name in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowing PDF for OCR notes later!
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };