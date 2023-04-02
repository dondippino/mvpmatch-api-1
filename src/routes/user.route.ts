import { Router } from "express";
import {
  create,
  deposit,
  getMany,
  getSingle,
  remove,
  reset,
  update,
} from "../controllers/user.controller";
import { middlewares } from "../middlewares";

const router = Router();
const secureMidleware = [middlewares.verifyToken, middlewares.hasAccess];

router.post("/", create);
router.get("/", secureMidleware, getMany);
router.get("/:id", secureMidleware, getSingle);
router.put("/deposit", secureMidleware, deposit);
router.put("/reset", secureMidleware, reset);
router.put("/:id", secureMidleware, update);
router.delete("/:id", secureMidleware, remove);

export const UserRoutes = router;
