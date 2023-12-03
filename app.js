const { createServer } = require("http");
const app = require("./server");
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
