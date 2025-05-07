import { format, transports } from "winston";
import WinstonDaily from "winston-daily-rotate-file";
import path from "path";

const kstTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9);

    const pad = (value: number) => value.toString().padStart(2, "0");

    const year = now.getUTCFullYear();
    const month = pad(now.getUTCMonth() + 1);
    const day = pad(now.getUTCDate());
    const hour = pad(now.getUTCHours());
    const minute = pad(now.getUTCMinutes());
    const second = pad(now.getUTCSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}+09:00`;
};
const logFormat = format.combine(
    format.timestamp({ format: kstTime }),
    format.label({ label: "daggle" }),
    format.printf((info) => {
        return `${info.timestamp} [${info.label}] ${info.level} ${info.message}`;
    }),
);
const changeLevelToUpperCase = format(info => {
    info.level = info.level.toUpperCase();
    return info;
});

export const LogConfig = {
    level: process.env.NODE_ENV === "prod" ? "info" : "debug",
    transports: [
        new WinstonDaily({
            level: "warn",
            datePattern: "YYYY-MM-DD",
            dirname: path.join(process.cwd(), "logs"),
            filename: "%DATE%.error.log",
            maxFiles: "14d",
            zippedArchive: true,
            format: format.combine(
                changeLevelToUpperCase(),
                logFormat
            )
        }),
        new transports.Console({
            format: format.combine(
                changeLevelToUpperCase(),
                format.colorize({ level: true }),
                logFormat
            )
        })
    ]
};
