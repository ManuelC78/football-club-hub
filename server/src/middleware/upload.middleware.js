const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'), false);
};

// S3 upload — used in production
const s3Upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder = req.uploadFolder || 'uploads';
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${folder}/${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

// Local disk upload — used in development / tests
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/fch-uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});
const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

// Use S3 in production, local disk in dev/test
const upload = process.env.NODE_ENV === 'production' ? s3Upload : localUpload;

// Helper: get URL from uploaded file
const getFileUrl = (file) => {
  if (file.location) return file.location; // S3
  return `/uploads/${file.filename}`;       // local
};

module.exports = { upload, getFileUrl };
