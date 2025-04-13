import { Response } from "express";

import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import { TokenStatus } from "../../utils/types";
import { AuthRequest, RefreshRequestBody } from "./types";

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *       400:
 *         description: Refresh token required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token required
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid refresh token
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
    [POST] api/refresh
    API for refresh token
 */
async function refreshToken(req: AuthRequest<RefreshRequestBody>, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }

    try {
        const result = tokenHandler.verifyRefreshToken(refreshToken);

    switch (result.tokenStatus) {
        case TokenStatus.Invalid:
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        case TokenStatus.Expired:
            res.status(401).json({ message: "Refresh token expired" });
            return;
        case TokenStatus.Valid:
        if (!result.email) {
            res.status(500).json({ message: "Server error: Invalid refresh token payload" });
            return;
        }

        // Create new token
        const newAccessToken = tokenHandler.generateJWTAccessToken({ email: result.email });
            logger.system.info("refreshToken", {}, `Access token refreshed for user ${result.email}`);
            res.json({ accessToken: newAccessToken });
            return;
        default:
            res.status(500).json({ message: "Unknown token status" });
            return;
    }
    } catch (error) {
        logger.system.error("refreshToken", {},`Refresh token error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default refreshToken;
