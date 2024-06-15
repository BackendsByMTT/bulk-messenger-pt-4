"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const server_1 = __importDefault(require("./server"));
const util_1 = require("./utils/util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config/config");
const wss = new ws_1.default.Server({ server: server_1.default });
wss.on("connection", (ws) => {
    let systemID = null;
    let token = null;
    let agentID = "";
    ws.onmessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = JSON.parse(message.data.toString());
            if (data.action === "keepalive") {
                console.log(`WEBSOCKET IS ALIVE FOR :${systemID}`);
            }
            if (data.action === "clientID") {
                console.log("Data : ", data.payload);
                systemID = data.payload.systemID;
                token = data.payload.token;
                const decodedToken = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
                agentID = decodedToken.userId;
                const agent = {
                    agentID: decodedToken.userId,
                    socketID: ws,
                    systemID: systemID,
                };
                util_1.clients.set(agent.agentID, agent);
                if (util_1.clients.has(agent.agentID)) {
                    const existingAgent = util_1.clients.get(agent.agentID);
                    existingAgent.socketID = ws;
                    existingAgent.systemID = systemID;
                    util_1.clients.set(agent.agentID, existingAgent);
                    console.log(`SocketID updated for agentID ${agent.agentID}`);
                }
                else {
                    util_1.clients.set(agent.agentID, agent);
                    console.log("Agent added to clients Map:", agent);
                }
            }
            if (data.action === "updateTask") {
                console.log("Update Task : ", data.payload);
                const { id, status, reason } = data.payload;
                yield (0, util_1.updateTaskStatus)(id, status, reason);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    ws.on("close", () => {
        console.log(`Disconnedted`);
    });
});
exports.default = wss;
