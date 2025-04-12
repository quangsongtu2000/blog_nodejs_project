const enum TokenStatus {
    Expired = "TOKENEXPIRED",
    Invalid = "TOKENINVALID",
    Valid = "TOKENVALID",
};

type PayloadAccessToken = {
    email: string
};

type PayloadRefreshToken = {
    email: string
};

type JWTPayload = {
    data: string
};

type AccessTokenVerification = {
    tokenStatus: TokenStatus,
    email: string | null
};

type RefreshTokenVerification = {
    tokenStatus: TokenStatus,
    email: string | null
};

type LogParameter = [string, object, string];

type LogSystem = {
    info: (...args: LogParameter) => void;
    warn: (...args: LogParameter) => void;
    error: (...args: LogParameter) => void;
    debug: (...args: LogParameter) => void;
};

export {
    TokenStatus,
    PayloadAccessToken,
    PayloadRefreshToken,
    AccessTokenVerification,
    JWTPayload,
    RefreshTokenVerification,
    LogSystem
};
