import { RequestHandler, Router } from "express";

import { login, signUp, refreshToken } from "../controllers/auth";
import validator from "../middleware/validator"

const router = Router();

router.post("/signup", validator("AuthRequestValidaton"), signUp);
router.post("/login", validator("AuthRequestValidaton"), login);
router.post("/refresh", refreshToken);

export default router;