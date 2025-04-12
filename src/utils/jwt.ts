import jwt, { JsonWebTokenError } from "jsonwebtoken";

import logger from "./logger";
import { 
    AccessTokenVerification, 
    JWTPayload, 
    PayloadAccessToken, 
    PayloadRefreshToken, 
    RefreshTokenVerification, 
    TokenStatus 
} from "./types";
import { JWT } from "../config/config";
import utilities from "./dataHandler";

const tokenHandler = {
    /**
     * Method is used to generate a JWT access token
     * @param payload payload to include in the access token
     * @returns generated JWT access token
     */
    generateJWTAccessToken: (payload: PayloadAccessToken): string => {
        logger.system.info(
            "generateJWTAccessToken",
            { payload },
            "Generating JWT access token for user"
        );

        // Because JWT tokens are encoded in base64, sensitive data in the payload needs to be encrypted
        const encryptedPayload = utilities.encryptData(
            JSON.stringify(payload), JWT.PAYLOAD_KEY).toString("base64");
        return jwt.sign({ data: encryptedPayload }, JWT.ACCESS_TOKEN_KEY!, {
            algorithm: JWT.ALGORITHM,
            expiresIn: JWT.ACCESS_TOKEN_EXPIRES_IN
        });
    },

    /**
     * Method to verify the access token
     * @param accessToken JWT access token from client
     * @returns 'TOKENINVALID', 'TOKENEXPIRED' or 'TOKENVALID' and email
     */
    verifyAccessToken: function (accessToken: string): AccessTokenVerification {
        try {
            const decoded = jwt.verify(accessToken, JWT.ACCESS_TOKEN_KEY!);
            const encryptedData = Buffer.from((decoded as JWTPayload).data, "base64");
            const decryptedPayload = utilities.decryptData(encryptedData,
                JWT.PAYLOAD_KEY).toString();
            const email = (JSON.parse(decryptedPayload) as PayloadAccessToken).email;

            logger.system.info("verifyAccessToken", { email }, "Verify access token successfully");
            return { tokenStatus: TokenStatus.Valid, email };
        } catch (err) {
            logger.system.error("verifyAccessToken", { err }, "Verify access token failed");
            if ((err as JsonWebTokenError).name === "TokenExpiredError") {
                return { tokenStatus: TokenStatus.Expired, email: null };
            }
            return { tokenStatus: TokenStatus.Invalid, email: null };
        }
    },
    /**
     * Method is used to generate a JWT refresh token
     * @param payload payload to include in the refresh token
     * @returns generated JWT refresh token
     */
    generateJWTRefreshToken: (payload: PayloadRefreshToken): string => {
        logger.system.info(
            "generateJWTRefreshToken",
            { payload },
            "Generating JWT refresh token for user"
        );
        const encryptedPayload = utilities.encryptData(
            JSON.stringify(payload), JWT.PAYLOAD_KEY).toString("base64");
        return jwt.sign({ data: encryptedPayload }, JWT.REFRESH_TOKEN_KEY!, {
            algorithm: JWT.ALGORITHM,
            expiresIn: JWT.REFRESH_TOKEN_EXPIRES_IN
        });
    },
    /**
     * Method to verify the refresh token
     * @param refreshToken JWT refresh token from client
     * @returns 'TOKENINVALID', 'TOKENEXPIRED' or 'TOKENVALID', email
     */
    verifyRefreshToken: function (refreshToken: string): RefreshTokenVerification {
        try {
            const decoded = jwt.verify(refreshToken, JWT.REFRESH_TOKEN_KEY!);
            const encryptedData = Buffer.from((decoded as JWTPayload).data, "base64");
            const decryptedPayload = utilities.decryptData(encryptedData,
                JWT.PAYLOAD_KEY).toString();
            const { email } = (JSON.parse(decryptedPayload) as PayloadRefreshToken);

            logger.system.info("verifyRefreshToken", { email }, "Verify refresh token successfully");
            return { tokenStatus: TokenStatus.Valid, email };
        } catch (err) {
            logger.system.error("verifyRefreshToken", { err }, "Verify refresh token failed");
            if ((err as JsonWebTokenError).name === "TokenExpiredError") {
                return { tokenStatus: TokenStatus.Expired, email: null };
            }
            return { tokenStatus: TokenStatus.Invalid, email: null };
        }
    }
}

export default tokenHandler;
