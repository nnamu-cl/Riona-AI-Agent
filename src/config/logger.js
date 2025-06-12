"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandlers = setupErrorHandlers;
var winston_1 = require("winston");
require("winston-daily-rotate-file");
var path_1 = require("path");
var fs_1 = require("fs");
var utils_1 = require("../utils");
// Ensure the logs directory exists
var logDir = path_1.default.join(__dirname, '../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Define log levels and their corresponding colors
var logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
    },
};
// Custom function to format the timestamp
var customTimestamp = function () {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var formattedTime = "".concat(hours % 12 || 12, ":").concat(minutes < 10 ? '0' + minutes : minutes, ":").concat(seconds < 10 ? '0' + seconds : seconds, " ").concat(ampm);
    return formattedTime;
};
// Function to get emojis based on log level
var getEmojiForLevel = function (level) {
    switch (level) {
        case 'info':
            return '💡'; // Light bulb for info
        case 'error':
            return '🚨'; // Emergency for errors
        case 'warn':
            return '⚠️'; // Warning for warnings
        case 'debug':
            return '🐞'; // Bug for debug
        default:
            return '🔔'; // Default bell emoji
    }
};
var logger = (0, winston_1.createLogger)({
    levels: logLevels.levels,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: customTimestamp }), winston_1.format.colorize(), winston_1.format.printf(function (_a) {
        var timestamp = _a.timestamp, level = _a.level, message = _a.message;
        var emoji = getEmojiForLevel(level);
        return "".concat(timestamp, " ").concat(emoji, " [").concat(level, "]: ").concat(message);
    })),
    transports: [
        new winston_1.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-combined.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating log file for general info
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-error.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating error log
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-debug.log",
            datePattern: "YYYY-MM-DD",
            level: "debug",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating debug log
    ],
});
// Catch unhandled promise rejections
function setupErrorHandlers() {
    // Catch unhandled promise rejections
    process.on("unhandledRejection", function (error) {
        (0, utils_1.setup_HandleError)(error, "Unhandled Rejection");
        process.exit(1);
    });
    // Catch uncaught exceptions
    process.on("uncaughtException", function (error) {
        (0, utils_1.setup_HandleError)(error, "Uncaught Exception");
        process.exit(1);
    });
    // Catch process warnings
    process.on("warning", function (warning) {
        logger.warn("Warning: ".concat(warning.message || warning));
    });
}
exports.default = logger;
