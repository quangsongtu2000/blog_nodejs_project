import { Response } from "express";
import bcrypt from "bcrypt";

import db from "../../models";
import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import { AuthRequest, AuthRequestBody } from "./types";
import { modelCrud } from "../../utils";

/*
    [POST] signup/
    API for sign up
 */
async function signUp(req: AuthRequest<AuthRequestBody>, res: Response): Promise<void> {
    const { email, password } = req.body as AuthRequestBody;
  
    try {
        const existingUser = await db.users.findOne({ where: { email, is_deleted: 0 } });
        if (existingUser) {
            logger.system.warn("signUp", { email }, `Registration failed: Email ${email} already exists`);
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await modelCrud.insertData(
            db.users,
            {
                email,
                password: hashedPassword
            }
        );
        logger.system.info("signUp",{ email }, "User registered successfully");
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        logger.system.error("signUp", { email }, `Registration error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default signUp;