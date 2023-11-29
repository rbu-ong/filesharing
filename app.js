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
app.use("/files", fileRoutes);

app.get("/", function (req, res) {
  // res.sendFile(path.join(__dirname, "./", "index.html"));

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
