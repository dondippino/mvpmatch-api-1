"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidator = exports.RoleValidator = void 0;
const client_1 = require("@prisma/client");
const superstruct_1 = require("superstruct");
exports.RoleValidator = superstruct_1.enums(Object.values(client_1.Role));
exports.UserValidator = superstruct_1.object({
    id: superstruct_1.number(),
    username: superstruct_1.string(),
    deposit: superstruct_1.number(),
    password: superstruct_1.string(),
    role: exports.RoleValidator,
});
