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
exports.getSingle = exports.getMany = exports.create = void 0;
const superstruct_1 = require("superstruct");
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        superstruct_1.assert(body, superstruct_1.pick(validation_1.UserValidator, ["username", "password", "role"]));
        const hashedPassword = yield utils_1.hashPassword(body.password);
        const user = yield prisma_1.prisma.user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                role: body.role,
            },
            select: {
                id: true,
                username: true,
                deposit: true,
                role: true,
            },
        });
        res.send(user);
    }
    catch (error) {
        utils_1.handleError(error, res);
    }
});
exports.create = create;
const getMany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = res.locals.decoded;
        const users = yield prisma_1.prisma.user.findMany({
            where: {},
            select: {
                id: true,
                username: true,
                deposit: true,
                role: true,
            },
            take: 10,
        });
        res.send(users);
    }
    catch (error) {
        utils_1.handleError(error, res);
    }
});
exports.getMany = getMany;
const getSingle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params } = req;
        const coercedId = utils_1.coerceInteger(params.id);
        superstruct_1.assert(coercedId, superstruct_1.number());
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id: coercedId,
            },
            select: {
                id: true,
                username: true,
                deposit: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    }
    catch (error) {
        utils_1.handleError(error, res);
    }
});
exports.getSingle = getSingle;
