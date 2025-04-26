import { format, transports } from "winston";
import WinstonDaily from "winston-daily-rotate-file";
import path from "path";

const logFormat = format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

export const LogConfig = {
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.label({ label: "daggle" }),
        logFormat
    ),
    level: process.env.NODE_ENV === "prod" ? "info" : "debug",
    transports: [
        new WinstonDaily({
            level: "warn",
            datePattern: "YYYY-MM-DD",
            dirname: path.join(process.cwd(), "logs", "error"),
            filename: "%DATE%.error.log",
            maxFiles: "14d",
            zippedArchive: true
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, label, message }) => `[${label}] ${level}: ${message}`)
            )
        })
    ]
};
