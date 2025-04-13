import { Response } from "express";

import { PostRequest, PostRequestQuery } from "../../../controllers/post/types";
import db from "../../../models";
import { logger } from "../../../utils";
import { getPost } from "../../../controllers/post";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("getPost controller", () => {
    let mockRequest: Partial<PostRequest<object, PostRequestQuery>>;
    let mockResponse: Partial<Response>;
    let mockPostsFindAndCountAll: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; warn: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            query: {
                pageSize: "10",
                pageNum: "1",
            },
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Mock db.posts.findAndCountAll
        mockPostsFindAndCountAll = jest.fn();
        (db.posts.findAndCountAll as jest.Mock) = mockPostsFindAndCountAll;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 200 with posts and pagination metadata", async () => {
        mockPostsFindAndCountAll.mockResolvedValue({
            count: 50,
            rows: [
                {
                    id: 1,
                    title: "Test Post",
                    content: "This is a test post with more than 1000 characters...".padEnd(1000, "x"),
                    user_id: 1,
                    "post_owner.email": "test@example.com",
                    created_at: new Date("2025-04-13T14:00:00.000Z"),
                    updated_at: new Date("2025-04-13T14:00:00.000Z"),
                },
            ],
        });
        await getPost(
            mockRequest as PostRequest<object, PostRequestQuery>,
            mockResponse as Response
        );

        expect(mockPostsFindAndCountAll).toHaveBeenCalledWith({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
            include: [
                {
                    model: db.users,
                    as: "post_owner",
                    attributes: ["email"],
                    required: true,
                },
            ],
            limit: 10,
            offset: 0,
            order: [["created_at", "DESC"]],
            raw: true,
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            posts: [
                {
                    id: 1,
                    title: "Test Post",
                    content: "This is a test post with more than 1000 characters...".padEnd(1000, "x"),
                    user_id: 1,
                    email: "test@example.com",
                    created_at: new Date("2025-04-13T14:00:00.000Z"),
                    updated_at: new Date("2025-04-13T14:00:00.000Z"),
                },
            ],
            pagination: {
                pageSize: 10,
                pageNum: 1,
                totalPosts: 50,
                totalPages: 5,
            },
        });
    });

    it("should return 400 if pageSize or pageNum is invalid", async () => {
        mockRequest.query = { pageSize: "60", pageNum: "1" }; // Invalid pageSize
        await getPost(
            mockRequest as PostRequest<object, PostRequestQuery>,
            mockResponse as Response
        );

        expect(mockPostsFindAndCountAll).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "pageSize must be between 1 and 50, and pageNum must be positive",
        });
    });

    it("should return 400 if pageSize exceeds maximum limit", async () => {
        mockRequest.query = { pageSize: "100", pageNum: "1" }; // pageSize > 50
        await getPost(
            mockRequest as PostRequest<object, PostRequestQuery>,
            mockResponse as Response
        );

        expect(mockPostsFindAndCountAll).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "pageSize must be between 1 and 50, and pageNum must be positive",
        });
    });

    it("should return 500 if an error occurs", async () => {
        const error = new Error("Database error");
        mockPostsFindAndCountAll.mockRejectedValue(error);
        await getPost(
            mockRequest as PostRequest<object, PostRequestQuery>,
            mockResponse as Response
        );

        expect(mockPostsFindAndCountAll).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});