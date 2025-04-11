import { Response } from "express";

import db from "../../models";
import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import bcrypt from "bcrypt";
import { AuthRequest, AuthRequestBody } from "./types";

async function login (req: AuthRequest<AuthRequestBody>, res: Response): Promise<void> {
    const { email, password } = req.body as AuthRequestBody;
  
    try {
        const user = await db.users.findOne({ where: { email, is_deleted: 0 } });
        if (!user) {
            logger.system.warn("login", { email }, "User not found");
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Comparing password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.system.warn("login", { email }, "Invalid password");
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = tokenHandler.generateJWTAccessToken({ email: user.email });
        logger.system.info("login", { email }, "`User logged in successfully");
        res.status(200).json({ token });
    } catch (error) {
        logger.system.error("login", { email },`Login error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default login;