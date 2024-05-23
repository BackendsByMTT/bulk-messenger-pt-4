import server from "./src/server";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";
import wss from "./src/socket";

const startServer = async () => {
  await connectDB();

  const port = config.port || 3000;

  server.listen(port, () => {
    console.log("Listening on port : ", port);
  });

  wss.on("listening", () => {
    console.log(`WebSocket server running ........`);
  });
};

startServer();
