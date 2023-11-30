const fs = require("fs");
const path = require("path");
const fileHandler = require("../components/fileHandler");

const cleanupJob = () => {
  const inactivityPeriod =
    (process.env.CLEANUP_DAYS || 7) * 24 * 60 * 60 * 1000;

  setInterval(() => {
    const folderPath = process.env.FOLDER || "./uploads";
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      const now = new Date();
      const lastAccessed = new Date(stat.atime);

      const timeDifference = now - lastAccessed;

      if (timeDifference > inactivityPeriod) {
        fileHandler.deleteFile("", file);
        console.log(`File ${file} deleted due to inactivity.`);
      }
    });
  }, inactivityPeriod);
};

module.exports = cleanupJob;
