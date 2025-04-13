import { Response, NextFunction } from "express";

import tokenHandler from "../../utils/jwt";
import { TokenStatus } from "../../utils/types";
import { CustomRequest } from "../../middleware/types";
import { verifyAccessToken } from "../../middleware";

// Mock tokenHandler
jest.mock("../../utils/jwt");

describe("verifyAccessToken middleware", () => {
    let mockRequest: Partial<CustomRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockRequest = {
            headers: {},
        };

        // Setup mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        // Setup mock next
        mockNext = jest.fn();
    });

    it("should return 401 if no authorization header is provided", () => {
        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "No token provided",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if Bearer prefix is provided without token", () => {
        mockRequest.headers = { authorization: "Bearer " };

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Malformed token: Bearer prefix missing",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is empty without Bearer prefix", () => {
        mockRequest.headers = { authorization: "" };

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "No token provided",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", () => {
        mockRequest.headers = { authorization: "Bearer invalid-token" };
        (tokenHandler.verifyAccessToken as jest.Mock).mockReturnValue({
            tokenStatus: TokenStatus.Invalid,
        });

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(tokenHandler.verifyAccessToken).toHaveBeenCalledWith("invalid-token");
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Invalid token" });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is expired", () => {
        mockRequest.headers = { authorization: "Bearer expired-token" };
        (tokenHandler.verifyAccessToken as jest.Mock).mockReturnValue({
            tokenStatus: TokenStatus.Expired,
        });

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(tokenHandler.verifyAccessToken).toHaveBeenCalledWith("expired-token");
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Token expired" });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 500 if token is valid but email is missing", () => {
        mockRequest.headers = { authorization: "Bearer valid-token" };
        (tokenHandler.verifyAccessToken as jest.Mock).mockReturnValue({
            tokenStatus: TokenStatus.Valid,
        });

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(tokenHandler.verifyAccessToken).toHaveBeenCalledWith("valid-token");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Server error: Email missing in valid token",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should set req.userInfo and call next if token is valid with email", () => {
        mockRequest.headers = { authorization: "Bearer valid-token" };
        (tokenHandler.verifyAccessToken as jest.Mock).mockReturnValue({
            tokenStatus: TokenStatus.Valid,
            email: "test@example.com",
        });

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(tokenHandler.verifyAccessToken).toHaveBeenCalledWith("valid-token");
        expect(mockRequest.userInfo).toEqual({ email: "test@example.com" });
        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 500 for unknown token status", () => {
        mockRequest.headers = { authorization: "Bearer unknown-token" };
        (tokenHandler.verifyAccessToken as jest.Mock).mockReturnValue({
            tokenStatus: "unknown" as any,
        });

        verifyAccessToken(
            mockRequest as CustomRequest,
            mockResponse as Response,
            mockNext
        );

        expect(tokenHandler.verifyAccessToken).toHaveBeenCalledWith("unknown-token");
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Unknown token status",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
});
