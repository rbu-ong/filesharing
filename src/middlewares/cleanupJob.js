const fs = require("fs");
const path = require("path");
const fileHandler = require("../components/fileHandler");
const cron = require("node-cron");

const cleanupJob = () => {
  // Check if npm script is 'test'
  const isTestScript = process.env.npm_lifecycle_event === "test";

  // If it's the 'test' script, don't schedule the cron job
  if (isTestScript) {
    console.log("Cron job skipped during testing.");
    return;
  }

  const inactivityPeriod =
    (process.env.INACTIVE_CLEANUP_DAYS || 7) * 24 * 60 * 60 * 1000;

  // Schedule the cleanup job to run every hour;
  cron.schedule("0 * * * *", () => {
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
  });
};

module.exports = cleanupJob;
