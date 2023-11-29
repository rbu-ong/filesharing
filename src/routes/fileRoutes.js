const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");
const createRateLimiter = require("../middlewares/rateLimitMiddleware");

const router = express.Router();
const upload = multer();

// Set the windowMs and maxRequests as needed
// The 2nd parameter will be the max limit
const rateLimiter = createRateLimiter(24 * 60 * 60 * 1000, 100);

router.post("/", rateLimiter, upload.single("file"), fileController.uploadFile);
router.get("/:publicKey", rateLimiter, fileController.downloadFile);
router.delete("/:privateKey", rateLimiter, fileController.deleteFile);

module.exports = router;
