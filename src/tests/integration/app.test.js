const chai = require("chai");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../../../app"); // Update with your actual app file

const expect = chai.expect;
const request = supertest(app);

describe("Integration Tests", () => {
  let actualFilePath;
  let privateKey, publicKey;

  before(() => {
    // Create a temporary file for testing
    const tempFolderPath = path.join(__dirname, "temp");
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    actualFilePath = path.join(tempFolderPath, "test_file.txt");
    fs.writeFileSync(actualFilePath, "Test content");
  });

  after(() => {
    // Cleanup: remove the temporary file
    fs.unlinkSync(actualFilePath);
  });

  describe("POST /files", () => {
    it("should upload an actual file and return public and private keys", async () => {
      const response = await request
        .post("/files")
        .attach("file", actualFilePath);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("publicKey");
      expect(response.body).to.have.property("privateKey");

      publicKey = response.body.publicKey;
      privateKey = response.body.privateKey;
    });

    // Add more tests for error cases, edge cases, etc.
  });

  describe("GET /files", () => {
    it("should download an existing file", async () => {
      const response = await request.get(`/files/${publicKey}`);

      expect(response.status).to.equal(200);
      expect(response.type).to.equal("text/plain");
    });

    it("should handle error when file does not exist", async () => {
      const response = await request.get(`/files/non-existing-publicKey`);

      expect(response.status).to.equal(404);
    });
  });

  describe("DELETE /files", () => {
    it("should delete an existing file", async () => {
      const response = await request.delete(`/files/${privateKey}`);

      expect(response.status).to.equal(200);
    });

    it("should handle error when file does not exist", async () => {
      const response = await request.delete(`/files/non-existing-publicKey`);

      expect(response.status).to.equal(404);
    });
  });

  // Add more tests for other endpoints
});
