import { format, transports } from "winston";

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
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, label, message }) => `[${label}] ${level}: ${message}`)
            )
        })
    ]
};
