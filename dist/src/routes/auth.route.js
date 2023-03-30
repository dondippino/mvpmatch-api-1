"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.Router();
router.post("/sign-in", auth_controller_1.signIn);
exports.AuthRoutes = router;
