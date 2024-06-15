"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const trashController_1 = require("./trashController");
const trashRouter = express_1.default.Router();
trashRouter.get("/", authenticate_1.default, trashController_1.getAllTrashes);
exports.default = trashRouter;
