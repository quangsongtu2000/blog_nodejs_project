const enum TokenStatus {
    Expired = "TOKENEXPIRED",
    Invalid = "TOKENINVALID",
    Valid = "TOKENVALID",
};

type CheckAccessTokenExists = {
    tokenExpireTime: string
};

type PayloadAccessToken = {
    email: string
};

type PayloadRefreshToken = {
    email: string,
    uuid: string
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
    email: string | null,
    uuid: string | null
};

type LogParameter = [string, object, string];

type LogSystem = {
    info: (...args: LogParameter) => void;
    warn: (...args: LogParameter) => void;
    error: (...args: LogParameter) => void;
    debug: (...args: LogParameter) => void;
}

type DataConvertedToXML = { [key: string]: unknown };

type CheckListForEncryption = {
    httpUserAgent?: string,
    httpPostmanToken?: string
};

type HoursAndMinutes = {
    hours: number,
    minutes: number
};

export {
    TokenStatus,
    CheckAccessTokenExists,
    PayloadAccessToken,
    PayloadRefreshToken,
    AccessTokenVerification,
    JWTPayload,
    RefreshTokenVerification,
    LogSystem,
    DataConvertedToXML,
    CheckListForEncryption,
    HoursAndMinutes
};
