import server, { wss } from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async () => {
  await connectDB();

  const port = config.port || 3000;
  const address = server!.address();

  server.listen(port, () => {
    console.log("Listening on port : ", port);
  });

  wss.on("listening", () => {
    console.log(`WebSocket server running ........`);
  });
};

startServer();
