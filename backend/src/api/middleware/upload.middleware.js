const multer = require('multer');

// Use memory storage to handle the file buffer directly
const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });