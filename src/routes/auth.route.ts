import { Router } from "express";
import { signIn } from "../controllers/auth.controller";

const router = Router();
router.post("/sign-in", signIn);
export const AuthRoutes = router;
