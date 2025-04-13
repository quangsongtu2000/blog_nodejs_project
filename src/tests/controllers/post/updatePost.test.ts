import { Response } from "express";

import { PostRequest } from "../../../controllers/post/types";
import db from "../../../models";
import { logger, modelCrud } from "../../../utils";
import { updatePost } from "../../../controllers/post";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("updatePost controller", () => {
    let mockRequest: Partial<PostRequest<{ title: string; content: string }>>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockPostsFindOne: jest.Mock;
    let mockUpdateData: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            params: { id: "1" },
            body: { title: "Updated Post", content: "This is an updated post" },
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

        // Mock db.posts.findOne
        mockPostsFindOne = jest.fn();
        (db.posts.findOne as jest.Mock) = mockPostsFindOne;

        // Mock modelCrud.updateData
        mockUpdateData = jest.fn();
        (modelCrud.updateData as jest.Mock) = mockUpdateData;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 401 if user is not found", async () => {
        mockUsersFindOne.mockResolvedValue(null);
        await updatePost(
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
        expect(mockPostsFindOne).not.toHaveBeenCalled();
        expect(mockUpdateData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 404 if post is not found", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindOne.mockResolvedValue(null);
        await updatePost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", user_id: 1, is_deleted: 0 },
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Post not found",
        });
        expect(mockUpdateData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not the post owner", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindOne.mockResolvedValue({ id: 1, user_id: 2, is_deleted: 0 });
        await updatePost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", user_id: 1, is_deleted: 0 },
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Forbidden: You can only edit your own posts",
        });
        expect(mockUpdateData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 200 if post is updated successfully", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindOne.mockResolvedValue({
            id: 1,
            user_id: 1,
            is_deleted: 0,
        });
        mockUpdateData.mockResolvedValue(undefined);
        await updatePost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", user_id: 1, is_deleted: 0 },
            logging: false,
        });
        expect(mockUpdateData).toHaveBeenCalledWith(
            db.posts,
            {
                title: "Updated Post",
                content: "This is an updated post",
                updated_at: expect.any(Date),
            },
            { id: 1 }
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: 1,
            title: "Updated Post",
            content: "This is an updated post",
            user_id: 1,
        });
    });

    it("should return 500 if an error occurs", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        const error = new Error("Database error");
        mockPostsFindOne.mockRejectedValue(error);
        await updatePost(
            mockRequest as PostRequest<{ title: string; content: string }>,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindOne).toHaveBeenCalledWith({
            where: { id: "1", user_id: 1, is_deleted: 0 },
            logging: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error",
        });
    });
});
