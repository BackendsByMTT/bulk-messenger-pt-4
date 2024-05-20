import WebSocket from "ws";
import server from "./app";
import { clients, updateTaskStatus } from "./utils/util";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config/config";

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  let systemID: string | null = null;
  let token = null;
  let agentID: string = "";

  ws.onmessage = async (message) => {
    try {
      const data = JSON.parse(message.data.toString());
      if (data.action === "keepalive") {
        console.log(`WEBSOCKET IS ALIVE FOR :${systemID}`);
      }

      if (data.action === "clientID") {
        console.log("Data : ", data.payload);
        systemID = data.payload.systemID;
        token = data.payload.token;

        const decodedToken: JwtPayload = jwt.verify(
          token,
          config.jwtSecret!
        ) as JwtPayload;
        agentID = decodedToken.userId;

        const agent = {
          agentID: decodedToken.userId,
          socketID: ws,
          systemID: systemID,
        };

        clients.set(agent.agentID, agent);

        if (clients.has(agent.agentID)) {
          const existingAgent = clients.get(agent.agentID);
          existingAgent.socketID = ws;
          existingAgent.systemID = systemID;
          clients.set(agent.agentID, existingAgent);
          console.log(`SocketID updated for agentID ${agent.agentID}`);
        } else {
          clients.set(agent.agentID, agent);
          console.log("Agent added to clients Map:", agent);
        }
      }

      if (data.action === "updateTask") {
        console.log("Update Task : ", data.payload);
        const { id, status, reason } = data.payload;
        await updateTaskStatus(id, status, reason);
      }
    } catch (error) {
      console.log(error);
    }
  };
  ws.on("close", () => {
    console.log(`Disconnedted`);
  });
});

export default wss;
