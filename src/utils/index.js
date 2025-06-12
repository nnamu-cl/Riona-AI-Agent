"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveScrapedData = exports.canSendTweet = exports.checkAndDeleteOldTweetData = exports.saveTweetData = void 0;
exports.Instagram_cookiesExist = Instagram_cookiesExist;
exports.saveCookies = saveCookies;
exports.loadCookies = loadCookies;
exports.setup_HandleError = setup_HandleError;
var fs_1 = require("fs");
var path_1 = require("path");
// import { geminiApiKeys } from "../secret"; // No longer needed here
var logger_1 = require("../config/logger");
function Instagram_cookiesExist() {
    return __awaiter(this, void 0, void 0, function () {
        var cookiesPath, cookiesData, cookies, primaryCookie, fallbackCookie, currentTimestamp, error_1, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cookiesPath = "./cookies/Instagramcookies.json";
                    return [4 /*yield*/, fs_1.promises.access(cookiesPath)];
                case 1:
                    _a.sent(); // Check if file exists
                    return [4 /*yield*/, fs_1.promises.readFile(cookiesPath, "utf-8")];
                case 2:
                    cookiesData = _a.sent();
                    cookies = JSON.parse(cookiesData);
                    primaryCookie = cookies.find(function (cookie) { return cookie.name === 'sessionid'; });
                    fallbackCookie = cookies.find(function (cookie) { return cookie.name === 'csrftoken'; });
                    currentTimestamp = Math.floor(Date.now() / 1000);
                    // Validate primary cookie (sessionid)
                    if (primaryCookie && primaryCookie.expires > currentTimestamp) {
                        return [2 /*return*/, true];
                    }
                    // Fallback to csrftoken if sessionid is missing or expired
                    if (fallbackCookie && fallbackCookie.expires > currentTimestamp) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 3:
                    error_1 = _a.sent();
                    err = error_1;
                    if (err.code === 'ENOENT') {
                        logger_1.default.warn("Cookies file does not exist.");
                        return [2 /*return*/, false];
                    }
                    else {
                        logger_1.default.error("Error checking cookies:", error_1);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function saveCookies(cookiesPath, cookies) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    dir = path_1.default.dirname(cookiesPath);
                    return [4 /*yield*/, fs_1.promises.mkdir(dir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(cookiesPath, JSON.stringify(cookies, null, 2))];
                case 2:
                    _a.sent();
                    logger_1.default.info("Cookies saved successfully.");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    logger_1.default.error("Error saving cookies:", error_2);
                    throw new Error("Failed to save cookies.");
                case 4: return [2 /*return*/];
            }
        });
    });
}
function loadCookies(cookiesPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cookiesData, cookies, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Check if the file exists
                    return [4 /*yield*/, fs_1.promises.access(cookiesPath)];
                case 1:
                    // Check if the file exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(cookiesPath, "utf-8")];
                case 2:
                    cookiesData = _a.sent();
                    cookies = JSON.parse(cookiesData);
                    return [2 /*return*/, cookies];
                case 3:
                    error_3 = _a.sent();
                    logger_1.default.error("Cookies file does not exist or cannot be read.", error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Removed getNextApiKey function as OpenRouter uses a single key and handles its own retries/fallbacks.
// The old handleError was tightly coupled with Gemini API key rotation and the old runAgent structure.
// OpenRouterService.ts now has its own error handling for API calls.
// If a more generic error handler is needed for other parts of the application,
// this function could be repurposed or a new one created.
// For now, I'm commenting it out as its previous functionality is largely obsolete
// in the context of AI calls now going through OpenRouterService.
/*
export async function handleError(error: unknown, ...args: any[]): Promise<string> {
    // Basic error logging
    if (error instanceof Error) {
        logger.error(`An error occurred: ${error.message}`);
        return `An error occurred: ${error.message}`;
    } else {
        logger.error("An unknown error occurred:", error);
        return "An unknown error occurred.";
    }
}
*/
function setup_HandleError(error, context) {
    if (error instanceof Error) {
        if (error.message.includes("net::ERR_ABORTED")) {
            logger_1.default.error("ABORTION error occurred in ".concat(context, ": ").concat(error.message));
        }
        else {
            logger_1.default.error("Error in ".concat(context, ": ").concat(error.message));
        }
    }
    else {
        logger_1.default.error("An unknown error occurred in ".concat(context, ": ").concat(error));
    }
}
// Function to save tweet data to tweetData.json
var saveTweetData = function (tweetContent, imageUrl, timeTweeted) {
    return __awaiter(this, void 0, void 0, function () {
        var tweetDataPath, tweetData, data, json, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tweetDataPath = path_1.default.join(__dirname, '../data/tweetData.json');
                    tweetData = {
                        tweetContent: tweetContent,
                        imageUrl: imageUrl || null,
                        timeTweeted: timeTweeted,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 9]);
                    // Check if the file exists
                    return [4 /*yield*/, fs_1.promises.access(tweetDataPath)];
                case 2:
                    // Check if the file exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(tweetDataPath, 'utf-8')];
                case 3:
                    data = _a.sent();
                    json = JSON.parse(data);
                    // Append the new tweet data
                    json.push(tweetData);
                    // Write the updated data back to the file
                    return [4 /*yield*/, fs_1.promises.writeFile(tweetDataPath, JSON.stringify(json, null, 2))];
                case 4:
                    // Write the updated data back to the file
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5:
                    error_4 = _a.sent();
                    if (!(error_4.code === 'ENOENT')) return [3 /*break*/, 7];
                    // File does not exist, create it with the new tweet data
                    return [4 /*yield*/, fs_1.promises.writeFile(tweetDataPath, JSON.stringify([tweetData], null, 2))];
                case 6:
                    // File does not exist, create it with the new tweet data
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    logger_1.default.error('Error saving tweet data:', error_4);
                    throw error_4;
                case 8: return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
};
exports.saveTweetData = saveTweetData;
// Function to check if the first object's time in tweetData.json is more than 24 hours old and delete the file if necessary
var checkAndDeleteOldTweetData = function () {
    return __awaiter(this, void 0, void 0, function () {
        var tweetDataPath, data, json, firstTweetTime, currentTime, timeDifference, error_5, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tweetDataPath = path_1.default.join(__dirname, '../data/tweetData.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Check if the file exists
                    return [4 /*yield*/, fs_1.promises.access(tweetDataPath)];
                case 2:
                    // Check if the file exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(tweetDataPath, 'utf-8')];
                case 3:
                    data = _a.sent();
                    json = JSON.parse(data);
                    if (!(json.length > 0)) return [3 /*break*/, 5];
                    firstTweetTime = new Date(json[0].timeTweeted).getTime();
                    currentTime = Date.now();
                    timeDifference = currentTime - firstTweetTime;
                    if (!(timeDifference > 86400000)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs_1.promises.unlink(tweetDataPath)];
                case 4:
                    _a.sent();
                    logger_1.default.info('tweetData.json file deleted because the first tweet is more than 24 hours old.');
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    err = error_5;
                    if (err.code !== 'ENOENT') {
                        logger_1.default.error('Error checking tweet data:', err);
                        throw err;
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.checkAndDeleteOldTweetData = checkAndDeleteOldTweetData;
// Function to check if the tweetData.json file has 17 or more objects
var canSendTweet = function () {
    return __awaiter(this, void 0, void 0, function () {
        var tweetDataPath, data, json, error_6, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tweetDataPath = path_1.default.join(__dirname, '../data/tweetData.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Check if the file exists
                    return [4 /*yield*/, fs_1.promises.access(tweetDataPath)];
                case 2:
                    // Check if the file exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(tweetDataPath, 'utf-8')];
                case 3:
                    data = _a.sent();
                    json = JSON.parse(data);
                    // Check if the file has 17 or more objects
                    if (json.length >= 17) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                case 4:
                    error_6 = _a.sent();
                    err = error_6;
                    if (err.code === 'ENOENT') {
                        // File does not exist, so it's safe to send a tweet
                        return [2 /*return*/, true];
                    }
                    else {
                        logger_1.default.error('Error checking tweet data:', err);
                        throw err;
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.canSendTweet = canSendTweet;
/// Function to save scraped data to scrapedData.json
var saveScrapedData = function (link, content) {
    return __awaiter(this, void 0, void 0, function () {
        var scrapedDataPath, scrapedDataDir, scrapedData, data, json, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scrapedDataPath = path_1.default.join(__dirname, '../data/scrapedData.json');
                    scrapedDataDir = path_1.default.dirname(scrapedDataPath);
                    scrapedData = {
                        link: link,
                        content: content,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 10]);
                    // Ensure the directory exists
                    return [4 /*yield*/, fs_1.promises.mkdir(scrapedDataDir, { recursive: true })];
                case 2:
                    // Ensure the directory exists
                    _a.sent();
                    // Check if the file exists
                    return [4 /*yield*/, fs_1.promises.access(scrapedDataPath)];
                case 3:
                    // Check if the file exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(scrapedDataPath, 'utf-8')];
                case 4:
                    data = _a.sent();
                    json = JSON.parse(data);
                    // Append the new scraped data
                    json.push(scrapedData);
                    // Write the updated data back to the file
                    return [4 /*yield*/, fs_1.promises.writeFile(scrapedDataPath, JSON.stringify(json, null, 2))];
                case 5:
                    // Write the updated data back to the file
                    _a.sent();
                    return [3 /*break*/, 10];
                case 6:
                    error_7 = _a.sent();
                    if (!(error_7.code === 'ENOENT')) return [3 /*break*/, 8];
                    // File does not exist, create it with the new scraped data
                    return [4 /*yield*/, fs_1.promises.writeFile(scrapedDataPath, JSON.stringify([scrapedData], null, 2))];
                case 7:
                    // File does not exist, create it with the new scraped data
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    logger_1.default.error('Error saving scraped data:', error_7);
                    throw error_7;
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
};
exports.saveScrapedData = saveScrapedData;
