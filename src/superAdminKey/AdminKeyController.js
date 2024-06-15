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
const http_errors_1 = __importDefault(require("http-errors"));
const AdminKeyModel_1 = __importDefault(require("./AdminKeyModel"));
const createAdminKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { key } = req.body;
    if (!key) {
        const error = (0, http_errors_1.default)(400, "All fields are required");
        return next(error);
    }
    if (key.length < 4) {
        next((0, http_errors_1.default)("Key should be at least 4 characters"));
    }
    try {
        const keys = yield AdminKeyModel_1.default.findOne({ key });
        if (keys) {
            const error = (0, http_errors_1.default)(400, "key already created");
            return next(error);
        }
        // const hashedkey = await bcrypt.hash(key, 4);
        let newKeys;
        newKeys = yield AdminKeyModel_1.default.create({
            key,
        });
        res.status(201).json({ message: "Key created succesfully" });
    }
    catch (error) {
        return next((0, http_errors_1.default)(500, "Error while creating keys"));
    }
});
exports.default = createAdminKey;
