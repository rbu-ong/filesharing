const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const uploadFolderPath = "./temp";

const dbPath = path.join("./", "dbtest.json");

function readFileDatabase() {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
}

function writeFileDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

function uploadFile(file) {
  const database = readFileDatabase();
  const publicKey = uuidv4();
  const privateKey = uuidv4();
  const timestamp = Date.now();

  // Save metadata to the database
  database.files.push({
    publicKey,
    privateKey,
    originalName: timestamp + "-" + file.originalname,
  });

  // Write back to the database file
  writeFileDatabase(database);

  // Create upload directory if not created yet
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath);
  }

  // Move the file to the storage folder
  const storagePath = path.join(
    uploadFolderPath,
    timestamp + "-" + file.originalname
  );
  fs.writeFileSync(storagePath, file.buffer);

  return { publicKey, privateKey };
}

function getFile(publicKey) {
  const database = readFileDatabase();
  const file = database.files.find((f) => f.publicKey === publicKey);

  if (!file) {
    return null; // File not found
  }

  const filePath = path.join(uploadFolderPath, file.originalName);
  return { filePath, originalName: file.originalName };
}

function deleteFile(privateKey, originalName = "") {
  const database = readFileDatabase();
  let fileIndex = -1;

  if (originalName) {
    fileIndex = database.files.findIndex(
      (f) => f.originalName === originalName
    );
  } else {
    fileIndex = database.files.findIndex((f) => f.privateKey === privateKey);
  }

  if (fileIndex === -1) {
    return false; // File not found
  }

  // Remove from the database
  const deletedFile = database.files.splice(fileIndex, 1)[0];

  // Write back to the database file
  writeFileDatabase(database);

  // Remove the file from the storage folder
  const filePath = path.join(uploadFolderPath, deletedFile.originalName);
  fs.unlinkSync(filePath);

  return true;
}

function removeInactiveFiles() {
  const files = fs.readdirSync(uploadFolderPath);
  const inactivityPeriod = 60 * 1000;

  try {
    files.forEach((file) => {
      const filePath = path.join(uploadFolderPath, file);
      const stat = fs.statSync(filePath);

      const now = new Date();
      const lastAccessed = new Date(stat.atime);

      const timeDifference = now - lastAccessed;

      if (timeDifference > inactivityPeriod) {
        deleteFile("", file);
      }
    });

    return {
      status: 200,
    };
  } catch (error) {
    return {
      status: 500,
      error: error,
    };
  }
}

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  readFileDatabase,
  removeInactiveFiles,
};
