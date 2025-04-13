import { Response } from "express";
import bcryptjs from "bcryptjs";

import { signUp } from "../../../controllers/auth";
import { AuthRequest } from "../../../controllers/auth/types";
import db from "../../../models";
import { logger, modelCrud } from "../../../utils";

// Mock dependencies
jest.mock("../../../models");
jest.mock("bcryptjs");
jest.mock("../../../utils");
jest.mock("../../../utils/logger");

describe("signUp controller", () => {
    let mockRequest: Partial<AuthRequest<{ email: string; password: string }>>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockBcryptHash: jest.Mock;
    let mockInsertData: jest.Mock;
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

        // Mock bcryptjs.hash
        mockBcryptHash = jest.fn();
        (bcryptjs.hash as jest.Mock) = mockBcryptHash;

        // Mock modelCrud.insertData
        mockInsertData = jest.fn();
        (modelCrud.insertData as jest.Mock) = mockInsertData;

        // Mock logger.system
        mockLoggerSystem = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 400 if email already exists", async () => {
        mockUsersFindOne.mockResolvedValue({
            email: "test@example.com",
            password: "hashedPassword",
        });
        await signUp(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 if signUp is successful", async () => {
        mockUsersFindOne.mockResolvedValue(null);
        mockBcryptHash.mockResolvedValue("hashedPassword");
        mockInsertData.mockResolvedValue(undefined);
        await signUp(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockBcryptHash).toHaveBeenCalledWith("password123", 10);
        expect(mockInsertData).toHaveBeenCalledWith(db.users, {
            email: "test@example.com",
            password: "hashedPassword",
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "User registered successfully",
        });
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Database error");
        mockUsersFindOne.mockRejectedValue(error);
        await signUp(
            mockRequest as AuthRequest<{ email: string; password: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            where: { email: "test@example.com", is_deleted: 0 },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
});
