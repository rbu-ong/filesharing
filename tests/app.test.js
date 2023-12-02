const chai = require("chai");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app"); // Update with your actual app file

const expect = chai.expect;
const request = supertest(app);
let actualFilePath;
let privateKey, publicKey;

let server;
// beforeEach((done) => {
//   server = app.listen(process.env.PORT || 3000, (err) => {
//     if (err) return done(err);

//     agent = request.agent(server); // since the application is already listening, it should use the allocated port
//     done();
//   });
// });

afterAll((done) => {
  // Cleanup: remove the temporary file
  fs.unlinkSync(actualFilePath);
  app.close(() => {
    done();
  });
});

describe("POST /files", () => {
  it("should upload an actual file and return public and private keys", async () => {
    // Create a temporary file for testing
    const tempFolderPath = path.join(__dirname, "temp");
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    actualFilePath = path.join(tempFolderPath, "test_file.txt");
    fs.writeFileSync(actualFilePath, "Test content");

    const response = await request
      .post("/files")
      .attach("file", actualFilePath);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("publicKey");
    expect(response.body).to.have.property("privateKey");

    publicKey = response.body.publicKey;
    privateKey = response.body.privateKey;
  });
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
