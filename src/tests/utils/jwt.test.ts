import tokenHandler from "../../utils/jwt";
import { TokenStatus } from "../../utils/types";

describe("generateJWTAccessToken", () => {
    const mockEmail = "mailto:bob@gmail.com";

    it("generate JWT access token successfully", () => {
        const accessToken = tokenHandler.generateJWTAccessToken({ email: mockEmail });
        expect(accessToken.length).toBeGreaterThan(0);
        expect(accessToken.split(".").length).toBe(3);
        expect(typeof accessToken).toBe("string");
    });
});

describe("generateJWTRefreshToken", () => {
    const mockEmail = "mailto:bob@gmail.com";

    it("generate JWT refresh token successfully", () => {
        const refreshToken = tokenHandler.generateJWTRefreshToken(
            { email: mockEmail });
        expect(refreshToken.split(".").length).toBe(3);
        expect(typeof refreshToken).toBe("string");
    });
});

describe("verifyAccessToken", () => {
    const mockEmail = "bob@gmail.com";
    // Use generateJWTAccessToken function to generate token
    const accessToken = tokenHandler.generateJWTAccessToken({ email: mockEmail });
    const expiredAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiUEQ4MkFXMVV1bGF2dFVOb2ZYcnBCdCt0MG5mZEpXL0FJZlB2TFNEWWVoST0iLCJpYXQiOjE3MjQ5MDM0NzEsImV4cCI6MTcyNDkwMzUzMX0.whyewn0_bZgqiqsJd5H73rbBXYyQid7ezOMUfekoHY4";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should verify access token failed if accessToken is in invalid", () => {
        const invalidAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiUEQ4MkFXMVV1bGF2dFVOb2ZYcnBCdCt0MG5mZEpXL0FJZlB2TFNEWWVoST0iLCJpYXQiOjE3MjQ4OTk4NjIsImV4cCI6MTcyNDg5OTkyMn0.tsJ432if-cvrCGGNzz0kNYvQ3w8hA23V_rqRcySfVZ8";
        const result = tokenHandler.verifyAccessToken(invalidAccessToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Invalid,
            email: null
        });
    });

    it("should verify access token failed if access token is expired", () => {
        const result = tokenHandler.verifyAccessToken(expiredAccessToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Expired,
            email: null
        });
    });

    it("should verify access token successfully", () => {
        const result = tokenHandler.verifyAccessToken(accessToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Valid,
            email: mockEmail
        });
    });
});

describe("verifyRefreshToken", () => {
    const mockEmail = "bob@gmail.com";
    // Use generateJWTRefreshToken function to generate token
    const refreshToken = tokenHandler.generateJWTRefreshToken({ email: mockEmail });
    const expiredRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiUEQ4MkFXMVV1bGF2dFVOb2ZYcnBCaGdhNUw0dmNJR2VVb1VVQkJLSmgyTWN0V2w4Z1FOc3JHRExXakE1dkRtUXRVdzBzY21ubG9wa3BjN2xjTDRJNGc9PSIsImlhdCI6MTcyNTU5MzIwMSwiZXhwIjoxNzI1NTkzMjYxfQ.59-DYlAZCq5o5dTrgfdrsiBDkfVVsE5Qer-ioTdLEbY";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should verify refresh token failed if refreshToken is in invalid", () => {
        const invalidRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiUEQ4MkFXMVV1bGF2dFVOb2ZYcnBCdCt0MG5mZEpXL0FJZlB2TFNEWWVoST0iLCJpYXQiOjE3MjQ4OTk4NjIsImV4cCI6MTcyNDg5OTkyMn0.tsJ432if-cvrCGGNzz0kNYvQ3w8hA23V_rqRcySfVZ8";
        const result = tokenHandler.verifyRefreshToken(invalidRefreshToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Invalid,
            email: null
        });
    });

    it("should verify refresh token failed if refresh token is expired", () => {
        const result = tokenHandler.verifyRefreshToken(expiredRefreshToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Expired,
            email: null
        });
    });

    it("should verify refresh token successfully", () => {
        const result = tokenHandler.verifyRefreshToken(refreshToken);

        expect(result).toStrictEqual({
            tokenStatus: TokenStatus.Valid,
            email: mockEmail
        });
    });
});
