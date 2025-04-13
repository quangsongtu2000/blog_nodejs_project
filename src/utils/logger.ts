import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { LOG } from "../config/config";
import { LogSystem } from "./types";

const { combine, timestamp, printf } = winston.format;

const formatMessage = (message: any): string => {
    return JSON.stringify(message)
        .replace(/\s{2,}/g, " ")
        .replace(/\\/g, "")
        .replace(/n(?=\s+-)|n(?=\s+-\s+parameters)|n(?=\s+-\s+description)/g, "")
        .slice(1, -1); // Remove outer quotes
};

const logFormatSystem = printf(({ timestamp, level, message }) => {
    return `time="${timestamp}" - level=${level.toUpperCase()} - ${formatMessage(message)}`;
});

const transport: DailyRotateFile = new DailyRotateFile({
    filename: LOG.FILE_PATHS,
    level: LOG.LEVEL,
    datePattern: "YYYY-MM-DD",
    utc: true,
    zippedArchive: true,
    maxSize: LOG.MAX_SIZE,
    maxFiles: LOG.MAX_FILE,
});

class Logger {
    private systemLogger: winston.Logger;

    public system: Required<LogSystem>;

    constructor() {
        this.systemLogger = winston.createLogger({
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                logFormatSystem
            ),
            transports: [
                new winston.transports.Console({ level: LOG.LEVEL }),
                transport,
            ],
        });

        this.system = {
            info: this.log("info"),
            error: this.log("error"),
            warn: this.log("warn"),
            debug: this.log("debug"),
        };
    }

    private log(level: "info" | "error" | "warn" | "debug") {
        return (event: string, parameters: object = {}, description: string = "") => {
            this.systemLogger.log({
                level,
                message: `logType="SystemLog" - event="${event}" - parameters=${JSON.stringify(parameters)} - description="${description}"`,
            });
        };
    }
}

export default new Logger();
