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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = void 0;
const superstruct_1 = require("superstruct");
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const validation_1 = require("../validation");
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        superstruct_1.assert(body, superstruct_1.pick(validation_1.UserValidator, ["username", "password"]));
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                username: body.username,
            },
        });
        if (!user) {
            return res.status(404).send({});
        }
        const { password } = user, userObject = __rest(user, ["password"]);
        const isUserAuthenticated = yield utils_1.comparePassword(body.password, user.password);
        if (!isUserAuthenticated) {
            return res.status(401).send();
        }
        const token = utils_1.createJwtToken(userObject);
        res.send({ access_token: token });
    }
    catch (error) {
        utils_1.handleError(error, res);
    }
});
exports.signIn = signIn;
