import { Response } from "express";

import { createPost } from "../../../controllers/post";
import { PostRequest } from "../../../controllers/post/types";
import db from "../../../models";
import { logger, modelCrud } from "../../../utils";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("createPost controller", () => {
    let mockRequest: Partial<PostRequest<{ title: string; content: string }>>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockInsertData: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            body: { title: "Test Post", content: "This is a test post" },
            userInfo: { email: "test@example.com" },
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock db.users.findOne
        mockUsersFindOne = jest.fn();
        (db.users.findOne as jest.Mock) = mockUsersFindOne;

        // Mock modelCrud.insertData
        mockInsertData = jest.fn();
        (modelCrud.insertData as jest.Mock) = mockInsertData;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 401 if user is not found", async () => {
        mockUsersFindOne.mockResolvedValue(null);
        await createPost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Unauthorized",
        });
        expect(mockInsertData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 201 if post is created successfully", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockInsertData.mockResolvedValue({
            id: 1,
            title: "Test Post",
            content: "This is a test post",
            user_id: 1,
            created_at: new Date()
        });
        await createPost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockInsertData).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        const error = new Error("Database error");
        mockInsertData.mockRejectedValue(error);
        await createPost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockInsertData).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});
