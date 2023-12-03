const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const fileRoutes = require("./src/routes/fileRoutes");
const cleanupJob = require("./src/middlewares/cleanupJob");
app.use("/files", fileRoutes);

// Start cleanup job
cleanupJob;

app.get("/", function (req, res) {
  // Read the HTML file
  const htmlFilePath = "index.html";
  fs.readFile(htmlFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading HTML file");
    }

    // Replace placeholders with actual environment variable values
    const modifiedHTML = data.replace("{{PORT}}", process.env.PORT || "5000");

    // Send the modified HTML file
    res.send(modifiedHTML);
  });
});

// Handle process termination to stop cleanup job and close server
// process.on("SIGTERM", () => {
//   cleanupJob.stopCleanupJob();
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });

// process.on("SIGINT", () => {
//   cleanupJob.stopCleanupJob();
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });

// Start server
// const PORT = process.env.PORT || 3000;
// const server = app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
