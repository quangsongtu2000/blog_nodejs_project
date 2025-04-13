import { Response } from "express";

import { createComment } from "../../../controllers/comment";
import { CommentRequest } from "../../../controllers/comment/types";
import db from "../../../models";
import { logger, modelCrud } from "../../../utils";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("createComment controller", () => {
    let mockRequest: Partial<CommentRequest<{ content: string }>>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockPostsFindByPk: jest.Mock;
    let mockInsertData: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };
    const createdAt = new Date();
    const updatedAt = new Date();

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            params: { id: "1" },
            body: { content: "Great post!" },
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

        // Mock db.posts.findByPk
        mockPostsFindByPk = jest.fn();
        (db.posts.findByPk as jest.Mock) = mockPostsFindByPk;

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
        await createComment(
            mockRequest as CommentRequest<{ content: string }>,
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
        expect(mockPostsFindByPk).not.toHaveBeenCalled();
        expect(mockInsertData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 404 if post is not found", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindByPk.mockResolvedValue(null);
        await createComment(
            mockRequest as CommentRequest<{ content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindByPk).toHaveBeenCalledWith("1");
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Post not found",
        });
        expect(mockInsertData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 201 if comment is created successfully", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindByPk.mockResolvedValue({ id: 1 });
        mockInsertData.mockResolvedValue({
            id: 1,
            content: "Great post!",
            user_id: 1,
            post_id: 1,
            created_at: createdAt,
            updated_at: updatedAt
        });
        await createComment(
            mockRequest as CommentRequest<{ content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindByPk).toHaveBeenCalledWith("1");
        expect(mockInsertData).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        const error = new Error("Database error");
        mockPostsFindByPk.mockRejectedValue(error);
        await createComment(
            mockRequest as CommentRequest<{ content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindByPk).toHaveBeenCalledWith("1");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});
