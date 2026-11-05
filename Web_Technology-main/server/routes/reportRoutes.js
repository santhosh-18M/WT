const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protectRoute, authorizeAdmin, authorizeAdminOrGov } = require('../middleware/authMiddleware');
const {
  createReport,
  getMyReports,
  getAllReportsForAdmin,
  getAdminReportAnalytics,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

const uploadDirectory = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

router.get('/admin/analytics', protectRoute, authorizeAdminOrGov, getAdminReportAnalytics);
router.get('/admin', protectRoute, authorizeAdminOrGov, getAllReportsForAdmin);
router.get('/', protectRoute, getMyReports);
router.post('/', protectRoute, upload.single('image'), createReport);
router.put('/:id', protectRoute, updateReport);
router.delete('/:id', protectRoute, deleteReport);

module.exports = router;
