"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewares = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const superstruct_1 = require("superstruct");
const validation_1 = require("../validation");
const access_control_listl_1 = require("./access-control-listl");
exports.middlewares = {
    verifyToken: (req, res, next) => {
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
            if (!token || !process.env.AUTH_PUBLIC_KEY) {
                return res.sendStatus(401);
            }
            const decoded = jsonwebtoken_1.verify(token, process.env.AUTH_PUBLIC_KEY);
            if (typeof decoded === "string") {
                return res.status(401).send();
            }
            res.locals.decoded = decoded;
            next();
        }
        catch (error) {
            return res.status(401).send();
        }
    },
    hasAccess: (req, res, next) => {
        try {
            const { method, baseUrl, route } = req;
            const key = `${method}_${baseUrl}${route.path}`;
            superstruct_1.assert(res.locals.decoded, superstruct_1.object(Object.assign(Object.assign({}, superstruct_1.omit(validation_1.UserValidator, ["password"]).schema), { iat: superstruct_1.number() })));
            const role = res.locals.decoded.role;
            const access = access_control_listl_1.ACCESS_CONTROL_LIST[key][role];
            if (!access) {
                return res.status(403).send();
            }
            next();
        }
        catch (error) {
            return res.status(403).send();
        }
    },
};
