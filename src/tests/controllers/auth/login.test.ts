import bcryptjs from "bcryptjs";
import { Response } from "express";

import { login } from "../../../controllers/auth";
import { AuthRequest } from "../../../controllers/auth/types";
import db from "../../../models";
import { logger } from "../../../utils";
import tokenHandler from "../../../utils/jwt";

// Mock dependencies
jest.mock("../../../models");
jest.mock("bcryptjs");
jest.mock("../../../utils/jwt");
jest.mock("../../../utils/logger");

describe("login controller", () => {
    let mockRequest: Partial<AuthRequest<{ email: string; password: string }>>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockBcryptCompare: jest.Mock;
    let mockGenerateAccessToken: jest.Mock;
    let mockGenerateRefreshToken: jest.Mock;
    let mockLoggerSystem: { warn: jest.Mock; info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            body: { email: "test@example.com", password: "password123" },
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock db.users.findOne
        mockUsersFindOne = jest.fn();
        (db.users.findOne as jest.Mock) = mockUsersFindOne;

        // Mock bcryptjs.compare
        mockBcryptCompare = jest.fn();
        (bcryptjs.compare as jest.Mock) = mockBcryptCompare;

        // Mock tokenHandler
        mockGenerateAccessToken = jest.fn();
        mockGenerateRefreshToken = jest.fn();
        (tokenHandler.generateJWTAccessToken as jest.Mock) = mockGenerateAccessToken;
        (tokenHandler.generateJWTRefreshToken as jest.Mock) = mockGenerateRefreshToken;

        // Mock logger.system
        mockLoggerSystem = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 401 if user is not found", async () => {
        mockUsersFindOne.mockResolvedValue(null);
        await login(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Invalid credentials",
        });
    });

    it("should return 401 if password is invalid", async () => {
        mockUsersFindOne.mockResolvedValue({
            email: "test@example.com",
            password: "hashedPassword",
        });
        mockBcryptCompare.mockResolvedValue(false);
        await login(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockBcryptCompare).toHaveBeenCalledWith(
            "password123",
            "hashedPassword"
        );
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Invalid credentials",
        });
    });

    it("should return 200 with token and refreshToken if login is successful", async () => {
        mockUsersFindOne.mockResolvedValue({
            email: "test@example.com",
            password: "hashedPassword",
        });
        mockBcryptCompare.mockResolvedValue(true);
        mockGenerateAccessToken.mockReturnValue("access-token");
        mockGenerateRefreshToken.mockReturnValue("refresh-token");
        await login(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockBcryptCompare).toHaveBeenCalledWith(
            "password123",
            "hashedPassword"
        );
        expect(mockGenerateAccessToken).toHaveBeenCalledWith({
            email: "test@example.com",
        });
        expect(mockGenerateRefreshToken).toHaveBeenCalledWith({
            email: "test@example.com",
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            token: "access-token",
            refreshToken: "refresh-token",
        });
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Database error");
        mockUsersFindOne.mockRejectedValue(error);
        await login(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Server error" });
        expect(mockBcryptCompare).not.toHaveBeenCalled();
        expect(mockGenerateAccessToken).not.toHaveBeenCalled();
        expect(mockGenerateRefreshToken).not.toHaveBeenCalled();
    });
});
