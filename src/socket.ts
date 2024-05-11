import WebSocket from "ws";
import server from "./app";
import messageModel from "./task/taskModel";

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.onmessage = (message) => {};
  ws.on("close", () => {
    console.log(`Disconnedted`);
  });
});

export default wss;
