import { Response } from "express";

import { PostRequest } from "../../../controllers/post/types";
import db from "../../../models";
import { logger } from "../../../utils";
import { getOnePost } from "../../../controllers/post";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("getOnePost controller", () => {
    let mockRequest: Partial<PostRequest>;
    let mockResponse: Partial<Response>;
    let mockPostsFindOne: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            params: { id: "1" },
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock db.posts.findOne
        mockPostsFindOne = jest.fn();
        (db.posts.findOne as jest.Mock) = mockPostsFindOne;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 200 with post details", async () => {
        mockPostsFindOne.mockResolvedValue({
            id: 1,
            title: "Test Post",
            content: "This is a test post",
            user_id: 1,
            "post_owner.email": "test@example.com",
            created_at: new Date("2025-04-13T14:00:00.000Z"),
            updated_at: new Date("2025-04-13T14:00:00.000Z")
        });
        await getOnePost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", is_deleted: 0 },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
            include: [
                {
                    model: db.users,
                    as: "post_owner",
                    attributes: ["email"],
                    required: true,
                },
            ],
            raw: true,
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: 1,
            title: "Test Post",
            content: "This is a test post",
            user_id: 1,
            email: "test@example.com",
            created_at: new Date("2025-04-13T14:00:00.000Z"),
            updated_at: new Date("2025-04-13T14:00:00.000Z")
        });
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 404 if post is not found", async () => {
        mockPostsFindOne.mockResolvedValue(null);
        await getOnePost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", is_deleted: 0 },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
            include: [
                {
                    model: db.users,
                    as: "post_owner",
                    attributes: ["email"],
                    required: true,
                },
            ],
            raw: true,
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Post not found",
        });
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Database error");
        mockPostsFindOne.mockRejectedValue(error);
        await getOnePost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", is_deleted: 0 },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
            include: [
                {
                    model: db.users,
                    as: "post_owner",
                    attributes: ["email"],
                    required: true,
                },
            ],
            raw: true,
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});
