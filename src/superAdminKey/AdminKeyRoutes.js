"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminKeyController_1 = __importDefault(require("./AdminKeyController"));
const adminKeyRouter = express_1.default.Router();
const middleAuth_1 = require("../middlewares/middleAuth");
adminKeyRouter.post("/createAdminKey", middleAuth_1.isAdmin, AdminKeyController_1.default);
exports.default = adminKeyRouter;
