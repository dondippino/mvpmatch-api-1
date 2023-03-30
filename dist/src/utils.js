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
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceInteger = exports.createJwtToken = exports.comparePassword = exports.hashPassword = exports.handleError = exports.isObject = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const superstruct_1 = require("superstruct");
const isObject = (obj) => typeof obj === "object" && obj !== null && !Array.isArray(obj);
exports.isObject = isObject;
const handleError = (error, res) => {
    if (error instanceof superstruct_1.StructError) {
        return res.status(400).send({ message: "Bad Request" });
    }
    else if (error instanceof Error) {
        return res.status(500).send({ messasge: error.message });
    }
    else {
        res.status(500);
    }
};
exports.handleError = handleError;
const hashPassword = (plain) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield bcrypt_1.hash(plain, 10);
    return hashed;
});
exports.hashPassword = hashPassword;
const comparePassword = (plain, hash) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bcrypt_1.compare(plain, hash);
    return result;
});
exports.comparePassword = comparePassword;
const createJwtToken = (payload) => {
    if (!exports.isObject(payload)) {
        throw new Error("payload is not a valid object");
    }
    const privateKey = process.env.AUTH_PRIVATE_KEY;
    return privateKey && jsonwebtoken_1.sign(payload, privateKey, { algorithm: "RS256" });
};
exports.createJwtToken = createJwtToken;
const IdInteger = superstruct_1.coerce(superstruct_1.number(), superstruct_1.string(), (value) => parseInt(value));
const coerceInteger = (unknownNumber) => superstruct_1.create(unknownNumber, IdInteger);
exports.coerceInteger = coerceInteger;
