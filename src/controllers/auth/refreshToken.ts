import { Response } from "express";

import tokenHandler from "../../utils/jwt";
import logger from "../../utils/logger";
import { TokenStatus } from "../../utils/types";
import { AuthRequest, RefreshRequestBody } from "./types";

/*
    [POST] refresh/
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