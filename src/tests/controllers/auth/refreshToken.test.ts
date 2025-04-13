import { Response } from "express";

import { refreshToken } from "../../..//controllers/auth";
import { AuthRequest } from "../../..//controllers/auth/types";
import { logger } from "../../..//utils";
import tokenHandler from "../../..//utils/jwt";
import { TokenStatus } from "../../..//utils/types";

// Mock dependencies
jest.mock("../../..//utils/jwt");
jest.mock("../../..//utils/logger");

describe("refreshToken controller", () => {
    let mockRequest: Partial<AuthRequest<{ refreshToken: string }>>;
    let mockResponse: Partial<Response>;
    let mockVerifyRefreshToken: jest.Mock;
    let mockGenerateAccessToken: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            body: { refreshToken: "valid-refresh-token" },
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock tokenHandler
        mockVerifyRefreshToken = jest.fn();
        mockGenerateAccessToken = jest.fn();
        (tokenHandler.verifyRefreshToken as jest.Mock) = mockVerifyRefreshToken;
        (tokenHandler.generateJWTAccessToken as jest.Mock) = mockGenerateAccessToken;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 400 if refreshToken is missing", async () => {
        mockRequest.body = { refreshToken: "" };
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Refresh token is required",
        });
        expect(mockVerifyRefreshToken).not.toHaveBeenCalled();
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 401 if refreshToken is invalid", async () => {
        mockVerifyRefreshToken.mockReturnValue({ tokenStatus: TokenStatus.Invalid });
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Invalid refresh token",
        });
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 401 if refreshToken is expired", async () => {
        mockVerifyRefreshToken.mockReturnValue({ tokenStatus: TokenStatus.Expired });
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        // Assert
        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Refresh token expired",
        });
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 500 if refreshToken is valid but email is missing", async () => {
        mockVerifyRefreshToken.mockReturnValue({ tokenStatus: TokenStatus.Valid });
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error: Invalid refresh token payload",
        });
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 200 with new accessToken if refreshToken is valid with email", async () => {
        mockVerifyRefreshToken.mockReturnValue({
            tokenStatus: TokenStatus.Valid,
            email: "test@example.com",
        });
        mockGenerateAccessToken.mockReturnValue("new-access-token");
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockGenerateAccessToken).toHaveBeenCalledWith({
            email: "test@example.com",
        });
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({
            accessToken: "new-access-token",
        });
    });

    it("should return 500 for unknown token status", async () => {
        mockVerifyRefreshToken.mockReturnValue({ tokenStatus: "unknown" as any });
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Unknown token status",
        });
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Token verification failed");
        mockVerifyRefreshToken.mockImplementation(() => {
            throw error;
        });
        await refreshToken(
            mockRequest as AuthRequest<{ refreshToken: string }>,
            mockResponse as Response
        );

        expect(mockVerifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});
