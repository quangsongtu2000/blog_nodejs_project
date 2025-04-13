import { NextFunction, Response } from "express";

import { CustomRequest } from "./types";
import tokenHandler from "../utils/jwt";
import { TokenStatus } from "../utils/types";

/**
 * Middleware to authen access token
 * @param req API request
 * @param res API response
 * @param next Proceed to next controller if valid token
 */
function verifyAccessToken(
    req: CustomRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
  
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) {
        res.status(401).json({ message: "Malformed token: Bearer prefix missing" });
        return;
    }
  
    const result = tokenHandler.verifyAccessToken(token);
  
    switch (result.tokenStatus) {
        case TokenStatus.Invalid:
            res.status(401).json({ message: "Invalid token" });
            return;
        case TokenStatus.Expired:
            res.status(401).json({ message: "Token expired" });
            return;
        case TokenStatus.Valid:
            if (!result.email) {
                res.status(500).json({ message: "Server error: Email missing in valid token" });
                return;
            }
            req.userInfo = { email: result.email };
            next();
            return;
        default:
            res.status(500).json({ message: "Unknown token status" });
            return;
    }
};

export { verifyAccessToken };
