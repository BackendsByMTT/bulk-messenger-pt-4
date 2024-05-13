import WebSocket from "ws";
import server from "./app";
import messageModel from "./task/taskModel";
import { clients } from "./utils/util";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config/config";

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  let systemID: string | null = null;
  let token = null;

  ws.onmessage = (message) => {
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

        const agent = {
          agentID: decodedToken.userId,
          socketID: ws,
          systemID: systemID,
        };

        clients.set(agent.agentID, agent);
        console.log("Agent added to clients Map:", agent);

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
    } catch (error) {
      console.log(error);
    }
  };
  ws.on("close", () => {
    console.log(`Disconnedted`);
  });
});

export default wss;
