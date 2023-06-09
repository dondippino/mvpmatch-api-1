"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importStar(require("express"));
const auth_route_1 = require("./routes/auth.route");
const product_route_1 = require("./routes/product.route");
const user_route_1 = require("./routes/user.route");
const app = express_1.default();
const PORT = 5090;
dotenv_1.config();
app.use(express_1.json());
app.use("/auth", auth_route_1.AuthRoutes);
app.use("/users", user_route_1.UserRoutes);
app.use("/products", product_route_1.ProductRoutes);
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
