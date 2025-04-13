import { Response } from "express";

import { deletePost } from "../../../controllers/post";
import { PostRequest } from "../../../controllers/post/types";
import db from "../../../models";
import { logger, modelCrud } from "../../../utils";

// Mock dependencies
jest.mock("../../../models");
jest.mock("../../../utils");

describe("deletePost controller", () => {
    let mockRequest: Partial<PostRequest>;
    let mockResponse: Partial<Response>;
    let mockUsersFindOne: jest.Mock;
    let mockPostsFindByPk: jest.Mock;
    let mockDeleteData: jest.Mock;
    let mockLoggerSystem: { info: jest.Mock; error: jest.Mock };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            params: { id: "1" },
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

        // Mock modelCrud.deleteData
        mockDeleteData = jest.fn();
        (modelCrud.deleteData as jest.Mock) = mockDeleteData;

        // Mock logger.system
        mockLoggerSystem = {
            info: jest.fn(),
            error: jest.fn(),
        };
        (logger.system as any) = mockLoggerSystem;
    });

    it("should return 401 if user is not found", async () => {
        mockUsersFindOne.mockResolvedValue(null);
        await deletePost(
            mockRequest as PostRequest,
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
        expect(mockDeleteData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 404 if post is not found", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindByPk.mockResolvedValue(null);
        await deletePost(
            mockRequest as PostRequest,
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
        expect(mockDeleteData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not the post owner", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindByPk.mockResolvedValue({ id: 1, user_id: 2 });
        await deletePost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindByPk).toHaveBeenCalledWith("1");
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Forbidden: You can only delete your own posts",
        });
        expect(mockDeleteData).not.toHaveBeenCalled();
        expect(mockLoggerSystem.info).not.toHaveBeenCalled();
        expect(mockLoggerSystem.error).not.toHaveBeenCalled();
    });

    it("should return 200 if post and comments are deleted successfully", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        mockPostsFindByPk.mockResolvedValue({ id: 1, user_id: 1 });
        mockDeleteData.mockResolvedValue(undefined);
        await deletePost(
            mockRequest as PostRequest,
            mockResponse as Response
        );

        expect(mockUsersFindOne).toHaveBeenCalledWith({
            attributes: [["id", "userId"]],
            where: { email: "test@example.com", is_deleted: 0 },
            raw: true,
            logging: false,
        });
        expect(mockPostsFindByPk).toHaveBeenCalledWith("1");
        expect(mockDeleteData).toHaveBeenCalledTimes(2);
        expect(mockDeleteData).toHaveBeenCalledWith(db.comments, { post_id: "1" });
        expect(mockDeleteData).toHaveBeenCalledWith(db.posts, { id: "1" });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Post and related comments deleted",
        });
    });

    it("should return 500 if an error occurs", async () => {
        mockUsersFindOne.mockResolvedValue({ userId: 1 });
        const error = new Error("Database error");
        mockPostsFindByPk.mockRejectedValue(error);
        await deletePost(
            mockRequest as PostRequest,
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
