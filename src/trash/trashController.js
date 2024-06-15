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
exports.getAllTrashes = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const trashModel_1 = __importDefault(require("./trashModel"));
function createTrash(trashData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newTrash = yield trashModel_1.default.create(trashData);
            return newTrash;
        }
        catch (error) {
            // Handle any errors
            console.error("Error creating trash:", error);
            return null;
        }
    });
}
const getAllTrashes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _req = req;
    try {
        let trashData;
        if (_req.userRole === "admin") {
            trashData = yield trashModel_1.default.find();
        }
        else if (_req.userRole === "agent") {
            trashData = yield trashModel_1.default.find({ agent: _req.userId });
        }
        else {
            return next((0, http_errors_1.default)(403, "Access denied: Suspicious activity detected."));
        }
        res.status(200).json(trashData);
    }
    catch (error) {
        console.log(error);
        return next((0, http_errors_1.default)(500, "Error fetching trashes"));
    }
});
exports.getAllTrashes = getAllTrashes;
