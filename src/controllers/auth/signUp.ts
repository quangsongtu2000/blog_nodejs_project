import { Response } from "express";
import db from "../../models";
import bcrypt from "bcrypt";
import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import { AuthRequest, AuthRequestBody } from "./types";

async function signUp (req: AuthRequest<AuthRequestBody>, res: Response): Promise<void> {
    const { email, password } = req.body as AuthRequestBody;
  
    try {
        const existingUser = await db.users.findOne({ where: { email, is_deleted: 0 } });
        if (existingUser) {
            logger.system.warn("signUp", { email }, `Registration failed: Email ${email} already exists`);
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.users.create({
            email,
            password: hashedPassword,
        });
        const token = tokenHandler.generateJWTAccessToken(user.id);
        logger.system.info("signUp",{ email }, "User registered successfully");
        res.status(200).json({ token });
    } catch (error) {
        logger.system.error("signUp", { email }, `Registration error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default signUp;