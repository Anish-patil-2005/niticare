import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Create storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/govt_sync/';
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Professional naming: module-timestamp-randomID.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `sync-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 2. File Filter (Security Check)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

// 3. Initialize Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for healthcare data sync
  }
});

export default upload;