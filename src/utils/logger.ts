import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { LOG } from "../config/config";
import { LogSystem } from "./types";

const { combine, timestamp, printf } = winston.format;
const logFormatSystem = printf(({ timestamp, level, message }) => {
    const messageStr = JSON.stringify(message)
                           .replace(/\s{2,}/g, " ")
                           .replace(/\\/g, "")
                           .replace(/n(?=\s+-)|n(?=\s+-\s+parameters)|n(?=\s+-\s+description)/g, "");
    return `time="${timestamp}" - level=${level.toUpperCase()} - ` +
            messageStr.slice(1, messageStr.length - 1);
});
const transport: DailyRotateFile = new DailyRotateFile({
    filename: LOG.FILE_PATHS,
    level: LOG.LEVEL,
    datePattern: "YYYY-MM-DD",
    utc: true,
    zippedArchive: true,
    maxSize: LOG.MAX_SIZE,
    maxFiles: LOG.MAX_FILE
});


class Logger {
    public systemLogger: winston.Logger;
    static system: LogSystem;

    constructor() {
        this.systemLogger = winston.createLogger({
            format: combine(
                timestamp({
                    format: "YYYY-MM-DD HH:mm:ss"
                }),
                logFormatSystem
            ),
            transports: [
                new winston.transports.Console({
                    level: LOG.LEVEL
                }),
                transport
            ]
        });
    }

    public system: Required<LogSystem> = {
        info: (event: string, parameters: object, description: string) => {
            this.systemLogger.info({ level: "info",
            message:(`logType="SystemLog"
                    - event="${event}"
                    - parameters=${JSON.stringify(parameters)}
                    - description="${description}"`)
            })
        },

        error: (event: string, parameters: object, description: string) => {
            this.systemLogger.error({ level: "error",
            message:(`logType="SystemLog"
                    - event="${event}"
                    - parameters=${JSON.stringify(parameters)}
                    - description="${description}"`)
            })
        },

        warn: (event: string, parameters: object, description: string) => {
            this.systemLogger.warn({ level: "warn",
            message:(`logType="SystemLog"
                    - event="${event}"
                    - parameters=${JSON.stringify(parameters)}
                    - description="${description}"`)
            })
        },

        debug: (event: string, parameters: object, description: string) => {
            this.systemLogger.debug({ level: "debug",
            message:(`logType="SystemLog"
                    - event="${event}"
                    - parameters=${JSON.stringify(parameters)}
                    - description="${description}"`)
            })
        },
    };
}

// To use log, just: import logger from "./controllers/commons/logger" and write as below

// Display logging system at level infomation
// logger.system.info("server-service-1", { param1: "value1", param2: "value2" }, "Some infomation for the system")
// Display logging system at level error
// logger.system.error("server-service-2", { param1: "value1", param2: "value2" }, "An error occurred during processing")
// Display logging system at level warn
// logger.system.warn("server-service-3", { param1: "value1", param2: "value2" }, "A warning occurred during processing")
// Display logging system at level debug
// logger.system.debug("server-service-4", { param1: "value1", param2: "value2" }, "A debug is occurring")
export default new Logger();