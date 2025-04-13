import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

const LOG_DIRECTORY = join("/var/log");
const LOG = Object.freeze({
    LEVEL: process.env.LOG_LEVEL,
    // Defining the size for file log(‘k’ = KB , ‘m’ = MB, or ‘g’ = GB)
    MAX_SIZE: "20m",
    // Defining Number of days to keep backup log files. Default: null
    MAX_FILE: "7d",
    FILE_PATHS: join(LOG_DIRECTORY, "BLOG-%DATE%.log")
});
// Defining the port for Rest-API server
const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

const BODY_SIZE_LIMIT = "5mb";

const CORS_OPTIONS = {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
};

// Defining the configurations for Database
const DATABASE_CONFIG = Object.freeze({
    NAME: process.env.DB_NAME,
    USERNAME: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    DBMS: "mysql",
    RETRY: {
        MAX_RETRY_TIMES: 3, // Maximum rety 3 times
        BACKOFF_BASE: 500, // Initial backoff duration in ms
        BACKOFF_EXPONENT: 1.5 // Exponent to increase backoff each try
    }
});

// Defining the JWT configuration
const JWT = Object.freeze({
    // Secret should at least be 32 characters long, but the longer the better.
    ACCESS_TOKEN_KEY: process.env.JWT_ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY: process.env.JWT_REFRESH_TOKEN_KEY,
    // Secret key is used to encrypt or decrypt payload data
    PAYLOAD_KEY: process.env.JWT_PAYLOAD_KEY,
    // HMAC-SHA256 provides a good balance between security and performance.
    ALGORITHM: "HS256",
    ACCESS_TOKEN_EXPIRES_IN: "30m", // 30 minutes
    REFRESH_TOKEN_EXPIRES_IN: "30d"
});

const DEFAULT_KEY = process.env.DEFAULT_KEY;

const RATE_LIMIT = Object.freeze({
    WINDOWMS: 900000, // 15 minutes
    MAX: 100, // limit 100 request/IP
    MESSAGE: "Too many requests from this IP, please try again later"
});

// The number of salt rounds determines the "heaviness" of the hashing algorithm (higher is more secure, but slower).
const SALT_ROUNDS = 10;

const API_PREFIX = "/api";

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_PAGE_NUM = 1;

const MAX_PAGE_SIZE = 50;

const PREVIEW_LENGTH = 1000;
export {
    SERVER_PORT,
    BODY_SIZE_LIMIT,
    CORS_OPTIONS,
    DATABASE_CONFIG,
    JWT,
    DEFAULT_KEY,
    LOG,
    RATE_LIMIT,
    SALT_ROUNDS,
    API_PREFIX,
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_NUM,
    MAX_PAGE_SIZE,
    PREVIEW_LENGTH
};
