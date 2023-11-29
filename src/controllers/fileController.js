const fileHandler = require("../components/fileHandler");

function uploadFile(req, res) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    const { publicKey, privateKey } = fileHandler.uploadFile(file);
    res.json({ publicKey, privateKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function downloadFile(req, res) {
  const publicKey = req.params.publicKey;
  const file = fileHandler.getFile(publicKey);

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(file.filePath, file.originalName);
}

function deleteFile(req, res) {
  const privateKey = req.params.privateKey;

  if (!fileHandler.deleteFile(privateKey)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.json({ message: "File deleted successfully" });
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
};
