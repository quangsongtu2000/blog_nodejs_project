import { Response } from "express";

import { getPost } from "../../../controllers/post";
import { PostRequest } from "../../../controllers/post/types";
import db from "../../../models";
import { logger } from "../../../utils";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("getPost controller", () => {
    let mockRequest: Partial<PostRequest>;
    let mockResponse: Partial<Response>;
    let mockPostsFindAll: jest.Mock;
    let mockLoggerSystem: { error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {};

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock db.posts.findAll
        mockPostsFindAll = jest.fn();
        (db.posts.findAll as jest.Mock) = mockPostsFindAll;

        // Mock logger.system
        mockLoggerSystem = {
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 200 with posts and user emails", async () => {
        mockPostsFindAll.mockResolvedValue([
            {
                id: 1,
                title: "Test Post",
                content: "This is a test post",
                user_id: 1,
                "post_owner.email": "test@example.com",
            },
        ]);
        await getPost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindAll).toHaveBeenCalledWith({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id"],
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
        expect(mockResponse.json).toHaveBeenCalledWith([
            {
                id: 1,
                title: "Test Post",
                content: "This is a test post",
                user_id: 1,
                email: "test@example.com",
            },
        ]);
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 200 with empty array if no posts are found", async () => {
        mockPostsFindAll.mockResolvedValue([]);
        await getPost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindAll).toHaveBeenCalledWith({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id"],
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
        expect(mockResponse.json).toHaveBeenCalledWith([]);
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Database error");
        mockPostsFindAll.mockRejectedValue(error);
        await getPost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockPostsFindAll).toHaveBeenCalledWith({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id"],
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