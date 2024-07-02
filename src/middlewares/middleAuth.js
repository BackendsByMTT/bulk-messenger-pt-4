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
exports.checkUserStatus = exports.isAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const http_errors_1 = __importDefault(require("http-errors"));
const userModel_1 = __importDefault(require("../user/userModel"));
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header("Authorization");
    try {
        if (!token) {
            return next((0, http_errors_1.default)(401, "Authorization token is missing"));
        }
        const accessToken = token.split(" ")[1];
        const decodedToken = jsonwebtoken_1.default.verify(accessToken, config_1.config.jwtSecret);
        const user = decodedToken.name;
        const checkForAdmin = yield userModel_1.default.findOne({
            username: user,
            role: "admin",
        });
        console.log(checkForAdmin);
        if (!checkForAdmin) {
            const _req = req;
            _req.userId = decodedToken.userId;
            _req.userRole = decodedToken.role;
            return next((0, http_errors_1.default)(401, "You are not an Admin"));
        }
        next();
    }
    catch (error) {
        return next((0, http_errors_1.default)(401, "Admin Authentication Failed"));
    }
});
exports.isAdmin = isAdmin;
const checkUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield userModel_1.default.findOne({ username });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found"));
        }
        const userStatus = user.status;
        if (userStatus === "inactive") {
            return next((0, http_errors_1.default)(403, "User is inactive and cannot log in"));
        }
        next();
    }
    catch (error) {
        console.error("Error checking user status:", error.message);
        return next((0, http_errors_1.default)(500, "Internal Server Error"));
    }
});
exports.checkUserStatus = checkUserStatus;
