import { Response } from "express";
import bcryptjs from "bcryptjs";

import db from "../../models";
import logger from "../../utils/logger";
import { AuthRequest, AuthRequestBody } from "./types";
import { modelCrud } from "../../utils";
import { SALT_ROUNDS } from "../../config/config";

/**
 * @openapi
 * api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered
 *       400:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User already exists
 *       429:
 *         description: Too many auth requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many auth requests from this IP, please try again after 1 minute
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/*
    [POST] api/signup
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
        const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
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
