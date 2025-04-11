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
    FILE_PATHS: join(LOG_DIRECTORY, "REBUILD-%DATE%.log")
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
    ACCESS_TOKEN_EXPIRES_IN: "30d", // 30 days
    REFRESH_TOKEN_EXPIRES_IN: "60d"
});
const DEFAULTKEY = process.env.DEFAULTKEY;

export {
    SERVER_PORT,
    BODY_SIZE_LIMIT,
    CORS_OPTIONS,
    DATABASE_CONFIG,
    JWT,
    DEFAULTKEY,
    LOG
}
