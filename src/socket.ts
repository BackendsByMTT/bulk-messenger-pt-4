import { wss } from "./app";
import messageModel from "./message/messageModel";

wss.on("connection", async (ws) => {
  let clientId = null;
  let token = null;

  ws.send(JSON.stringify({ action: "pendingTasks", payload: "pendingTasks" }));
  ws.onmessage = async (message) => {
    try {
      const data = message.data;
      console.log("Socket Data : ", data);
    } catch (error) {}
  };
});
