import { Response } from "express";
import bcryptjs from "bcryptjs";

import db from "../../models";
import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import { AuthRequest, AuthRequestBody } from "./types";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
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
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
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
    [POST] api/login
    API for log in
 */
async function login(req: AuthRequest<AuthRequestBody>, res: Response): Promise<void> {
    const { email, password } = req.body as AuthRequestBody;
  
    try {
        const user = await db.users.findOne({ where: { email, is_deleted: 0 } });
        if (!user) {
            logger.system.warn("login", { email }, "User not found");
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Comparing password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            logger.system.warn("login", { email }, "Invalid password");
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const payload = { email: user.email };
        const token = tokenHandler.generateJWTAccessToken(payload);
        const refreshToken = tokenHandler.generateJWTRefreshToken(payload);
        logger.system.info("login", { email }, "`User logged in successfully");
        res.status(200).json({ token, refreshToken });
    } catch (error) {
        logger.system.error("login", { email },`Login error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default login;
