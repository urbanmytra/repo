const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Organize by file type
    if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'serviceImages') {
      uploadPath += 'services/';
    } else if (file.fieldname === 'reviewImages') {
      uploadPath += 'reviews/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on fieldname
  if (file.fieldname === 'documents') {
    // Allow documents
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents (PDF, DOC, DOCX) and images (JPG, JPEG, PNG) are allowed'));
    }
  } else {
    // Allow only images for other fields
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Memory storage for immediate processing
const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadConfigs = {
  // Single avatar upload
  avatar: upload.single('avatar'),
  
  // Multiple service images
  serviceImages: upload.array('serviceImages', 5),
  
  // Multiple review images
  reviewImages: upload.array('reviewImages', 3),
  
  // Documents upload
  documents: upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'policeClearance', maxCount: 1 }
  ]),
  
  // Mixed uploads
  mixed: upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  
  // Memory storage versions
  avatarMemory: uploadMemory.single('avatar'),
  serviceImagesMemory: uploadMemory.array('serviceImages', 5),
  reviewImagesMemory: uploadMemory.array('reviewImages', 3)
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please reduce the number of files.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Validate uploaded files
const validateFiles = (requiredFields = []) => {
  return (req, res, next) => {
    const uploadedFields = [];
    
    // Check single file uploads
    if (req.file) {
      uploadedFields.push(req.file.fieldname);
    }
    
    // Check multiple file uploads
    if (req.files) {
      if (Array.isArray(req.files)) {
        // Files uploaded as array
        req.files.forEach(file => {
          if (!uploadedFields.includes(file.fieldname)) {
            uploadedFields.push(file.fieldname);
          }
        });
      } else {
        // Files uploaded as object
        Object.keys(req.files).forEach(fieldname => {
          uploadedFields.push(fieldname);
        });
      }
    }
    
    // Check required fields
    const missingFields = requiredFields.filter(field => !uploadedFields.includes(field));
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required files: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

// Clean up uploaded files on error
const cleanupFiles = (req, res, next) => {
  const fs = require('fs');
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to clean up files on error
  res.end = function(chunk, encoding) {
    if (res.statusCode >= 400) {
      const filesToDelete = [];
      
      if (req.file) {
        filesToDelete.push(req.file.path);
      }
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.forEach(file => filesToDelete.push(file.path));
        } else {
          Object.values(req.files).forEach(fileArray => {
            fileArray.forEach(file => filesToDelete.push(file.path));
          });
        }
      }
      
      // Delete files asynchronously
      filesToDelete.forEach(filePath => {
        if (filePath) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      });
    }
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = {
  upload,
  uploadMemory,
  uploadConfigs,
  handleUploadError,
  validateFiles,
  cleanupFiles
};