const chai = require("chai");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("./server"); // Update with your actual app file
const mocks = require("chai-jest-mocks");

// import request from "supertest";

const expect = chai.expect;
const request = supertest(app);
let actualFilePath;
let privateKey, publicKey;

const fileController = require("./src/controllers/fileController");
const fileHandler = require("./src/components/fileHandler");

jest.mock("./src/controllers/fileController");
jest.mock("./src/components/fileHandler");

chai.use(mocks);

let server;
beforeEach((done) => {
  server = app.listen(4000, (err) => {
    if (err) return done(err);

    done();
  });
});

afterEach((done) => {
  server.close(done);
});

// afterAll(async () => {
//   fs.rmdirSync("./temp", { recursive: true, force: true });
// });

describe("POST /files", () => {
  it("should upload an actual file and return public and private keys", async () => {
    // Create a temporary file for testing
    const tempFolderPath = path.join(__dirname, "temp");
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    actualFilePath = path.join(tempFolderPath, "test_file.txt");
    fs.writeFileSync(actualFilePath, "Test content");

    for (let index = 0; index < process.env.MAXLIMIT - 1; index++) {
      const response = await request
        .post("/files")
        .attach("file", actualFilePath);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("publicKey");
      expect(response.body).to.have.property("privateKey");
    }
    fs.unlinkSync(actualFilePath);
  });

  it("Should status code of 400, no file attach", async () => {
    const response = await request.post("/files");

    expect(response.status).to.equal(400);
  });

  it("Should status code of 429, max limit is reached for the day", async () => {
    const response = await request.post("/files");

    expect(response.status).to.equal(429);
  });
});

describe("GET /files", () => {
  it("should download an existing file", async () => {
    for (let index = 0; index < process.env.MAXLIMIT - 1; index++) {
      const database = fileHandler.readFileDatabase();
      publicKey = database.files[database.files.length - 1].publicKey;

      const response = await request.get(`/files/${publicKey}`);

      expect(response.status).to.equal(200);
      expect(response.type).to.equal("text/plain");
    }
  });

  it("should handle error when file does not exist or wrong privateKey", async () => {
    const response = await request.get(`/files/non-existing-publicKey`);

    expect(response.status).to.equal(404);
  });

  it("Should status code of 429, max limit is reached for the day", async () => {
    const response = await request.get("/files/privateKey");

    expect(response.status).to.equal(429);
  });
});

describe("DELETE /files", () => {
  it("should delete an existing file", async () => {
    const database = fileHandler.readFileDatabase();
    privateKey = database.files[database.files.length - 1].privateKey;

    const response = await request.delete(`/files/${privateKey}`);

    expect(response.status).to.equal(200);
  });

  it("should handle error when file does not exist or wrong privateKey", async () => {
    const response = await request.delete(`/files/non-existing-publicKey`);

    expect(response.status).to.equal(404);
  });
});

describe("Cleanup Files", () => {
  it("should delete outdated files", async () => {
    const response = await fileHandler.removeInactiveFiles();

    expect(response.status).to.equal(200);
  });
});
