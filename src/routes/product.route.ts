import { Router } from "express";
import {
  buy,
  create,
  getMany,
  getSingle,
  remove,
  update,
} from "../controllers/product.controller";
import { middlewares } from "../middlewares";

const router = Router();
const secureMidleware = [middlewares.verifyToken, middlewares.hasAccess];

router.post("/", secureMidleware, create);
router.get("/", getMany);
router.get("/:id", getSingle);
router.post("/buy", secureMidleware, buy);
router.put("/:id", secureMidleware, update);
router.delete("/:id", secureMidleware, remove);
export const ProductRoutes = router;
