import { Router } from "express";
import { logoutAll, signIn } from "../controllers/auth.controller";

const router = Router();
router.post("/sign-in", signIn);
router.post("/logout/all", logoutAll);
export const AuthRoutes = router;
