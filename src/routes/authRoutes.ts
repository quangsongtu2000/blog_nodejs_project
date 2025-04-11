import { Router } from "express";

import { login, signUp, refreshToken } from "../controllers/auth";

const router = Router();

router.post("/register", signUp);
router.post("/login", login);
router.post("/refresh", refreshToken);

export default router;