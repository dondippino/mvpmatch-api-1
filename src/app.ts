import { config } from "dotenv";
import express, { json } from "express";
import { AuthRoutes } from "./routes/auth.route";
import { ProductRoutes } from "./routes/product.route";
import { UserRoutes } from "./routes/user.route";

const app = express();

config();
app.use(json());

app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);
app.use("/products", ProductRoutes);

export const App = app;
