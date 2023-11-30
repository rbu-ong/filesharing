const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");
const createRateLimiter = require("../middlewares/rateLimitMiddleware");

const router = express.Router();
const upload = multer();

// Set the windowMs and maxRequests as needed
// The 2nd parameter will be the max limit
const uploadRateLimiter = createRateLimiter(
  24 * 60 * 60 * 1000,
  process.env.MAXLIMIT || 100
);

const downloadRateLimiter = createRateLimiter(
  24 * 60 * 60 * 1000,
  process.env.MAXLIMIT || 100
);

router.post(
  "/",
  uploadRateLimiter,
  upload.single("file"),
  fileController.uploadFile
);
router.get("/:publicKey", downloadRateLimiter, fileController.downloadFile);
router.delete("/:privateKey", fileController.deleteFile);

module.exports = router;
