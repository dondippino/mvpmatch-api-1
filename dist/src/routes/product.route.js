"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const router = express_1.Router();
router.post("/", product_controller_1.create);
exports.ProductRoutes = router;
