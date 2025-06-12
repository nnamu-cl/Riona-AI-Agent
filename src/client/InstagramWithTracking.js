"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.runInstagramWithTracking = runInstagramWithTracking;
var puppeteer_1 = require("puppeteer");
var puppeteer_extra_1 = require("puppeteer-extra");
var puppeteer_extra_plugin_stealth_1 = require("puppeteer-extra-plugin-stealth");
var puppeteer_extra_plugin_adblocker_1 = require("puppeteer-extra-plugin-adblocker");
var proxy_chain_1 = require("proxy-chain");
var secret_1 = require("../secret");
var logger_1 = require("../config/logger");
var utils_1 = require("../utils");
var Agent_1 = require("../Agent");
var schema_1 = require("../Agent/schema");
var ActivityLogger_1 = require("../services/ActivityLogger");
var app_1 = require("../app");
// Add stealth plugin to puppeteer
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_adblocker_1.default)({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: puppeteer_1.DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
}));
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
function runInstagramWithTracking(agentId_1) {
    return __awaiter(this, arguments, void 0, function (agentId, config) {
        var defaultConfig, finalConfig, proxyPort, server, proxyUrl, browser, page, cookiesPath, checkCookies, cookies, isLoggedIn, error_1;
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultConfig = {
                        max_posts: 50,
                        delay_ms: 5000,
                        comment_enabled: true,
                        like_enabled: true
                    };
                    finalConfig = __assign(__assign({}, defaultConfig), config);
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'session_started', true, {
                            config: finalConfig,
                            timestamp: new Date().toISOString()
                        })];
                case 1:
                    _a.sent();
                    proxyPort = 8000 + Math.floor(Math.random() * 1000);
                    server = new proxy_chain_1.Server({ port: proxyPort });
                    return [4 /*yield*/, server.listen()];
                case 2:
                    _a.sent();
                    proxyUrl = "http://localhost:".concat(proxyPort);
                    return [4 /*yield*/, puppeteer_extra_1.default.launch({
                            headless: false,
                            args: ["--proxy-server=".concat(proxyUrl)],
                        })];
                case 3:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 4:
                    page = _a.sent();
                    cookiesPath = "./cookies/Instagramcookies.json";
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 21, 23, 27]);
                    return [4 /*yield*/, (0, utils_1.Instagram_cookiesExist)()];
                case 6:
                    checkCookies = _a.sent();
                    logger_1.default.info("Checking cookies existence: ".concat(checkCookies));
                    if (!checkCookies) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, utils_1.loadCookies)(cookiesPath)];
                case 7:
                    cookies = _a.sent();
                    return [4 /*yield*/, page.setCookie.apply(page, cookies)];
                case 8:
                    _a.sent();
                    logger_1.default.info('Cookies loaded and set on the page.');
                    // Navigate to Instagram to verify if cookies are valid
                    return [4 /*yield*/, page.goto("https://www.instagram.com/", { waitUntil: 'networkidle2' })];
                case 9:
                    // Navigate to Instagram to verify if cookies are valid
                    _a.sent();
                    return [4 /*yield*/, page.$("a[href='/direct/inbox/']")];
                case 10:
                    isLoggedIn = _a.sent();
                    if (!isLoggedIn) return [3 /*break*/, 12];
                    logger_1.default.info("Login verified with cookies.");
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'login_verified', true, {
                            method: 'cookies'
                        })];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 12:
                    logger_1.default.warn("Cookies invalid or expired. Logging in again...");
                    return [4 /*yield*/, loginWithCredentials(page, browser, agentId)];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [3 /*break*/, 17];
                case 15: 
                // If no cookies are available, perform login with credentials
                return [4 /*yield*/, loginWithCredentials(page, browser, agentId)];
                case 16:
                    // If no cookies are available, perform login with credentials
                    _a.sent();
                    _a.label = 17;
                case 17: 
                // Optionally take a screenshot after loading the page
                return [4 /*yield*/, page.screenshot({ path: "logged_in.png" })];
                case 18:
                    // Optionally take a screenshot after loading the page
                    _a.sent();
                    // Navigate to the Instagram homepage
                    return [4 /*yield*/, page.goto("https://www.instagram.com/")];
                case 19:
                    // Navigate to the Instagram homepage
                    _a.sent();
                    // Interact with posts based on config
                    return [4 /*yield*/, interactWithPostsTracked(page, agentId, finalConfig)];
                case 20:
                    // Interact with posts based on config
                    _a.sent();
                    return [3 /*break*/, 27];
                case 21:
                    error_1 = _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'session_error', false, {
                            error_message: error_1.message
                        })];
                case 22:
                    _a.sent();
                    logger_1.default.error('Instagram agent error:', error_1);
                    return [3 /*break*/, 27];
                case 23: return [4 /*yield*/, browser.close()];
                case 24:
                    _a.sent();
                    return [4 /*yield*/, server.close(true)];
                case 25:
                    _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'session_ended', true, {
                            timestamp: new Date().toISOString()
                        })];
                case 26:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 27: return [2 /*return*/];
            }
        });
    });
}
var loginWithCredentials = function (page, browser, agentId) { return __awaiter(void 0, void 0, void 0, function () {
    var cookies, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 12]);
                return [4 /*yield*/, page.goto("https://www.instagram.com/accounts/login/")];
            case 1:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('input[name="username"]')];
            case 2:
                _a.sent();
                // Fill out the login form
                return [4 /*yield*/, page.type('input[name="username"]', secret_1.IGusername)];
            case 3:
                // Fill out the login form
                _a.sent();
                return [4 /*yield*/, page.type('input[name="password"]', secret_1.IGpassword)];
            case 4:
                _a.sent();
                return [4 /*yield*/, page.click('button[type="submit"]')];
            case 5:
                _a.sent();
                // Wait for navigation after login
                return [4 /*yield*/, page.waitForNavigation()];
            case 6:
                // Wait for navigation after login
                _a.sent();
                return [4 /*yield*/, browser.cookies()];
            case 7:
                cookies = _a.sent();
                return [4 /*yield*/, (0, utils_1.saveCookies)("./cookies/Instagramcookies.json", cookies)];
            case 8:
                _a.sent();
                return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'login_success', true, {
                        method: 'credentials'
                    })];
            case 9:
                _a.sent();
                return [3 /*break*/, 12];
            case 10:
                error_2 = _a.sent();
                return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'login_failed', false, {
                        method: 'credentials',
                        error_message: error_2.message
                    })];
            case 11:
                _a.sent();
                logger_1.default.error("Error logging in with credentials:", error_2);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); };
function interactWithPostsTracked(page, agentId, config) {
    return __awaiter(this, void 0, void 0, function () {
        var postIndex, maxPosts, postSelector, caption, waitTime, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    postIndex = 1;
                    maxPosts = config.max_posts || 50;
                    _a.label = 1;
                case 1:
                    if (!(postIndex <= maxPosts && !(0, app_1.shouldStop)())) return [3 /*break*/, 18];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 15, , 17]);
                    postSelector = "article:nth-of-type(".concat(postIndex, ")");
                    return [4 /*yield*/, page.$(postSelector)];
                case 3:
                    if (!!(_a.sent())) return [3 /*break*/, 5];
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'no_more_posts', true, {
                            posts_processed: postIndex - 1
                        })];
                case 4:
                    _a.sent();
                    console.log("No more posts found. Ending iteration...");
                    return [2 /*return*/];
                case 5: return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'post_discovered', true, {
                        post_index: postIndex
                    })];
                case 6:
                    _a.sent();
                    if (!config.like_enabled) return [3 /*break*/, 8];
                    return [4 /*yield*/, handleLikeAction(page, postSelector, postIndex, agentId)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, extractCaption(page, postSelector, postIndex, agentId)];
                case 9:
                    caption = _a.sent();
                    if (!(config.comment_enabled && caption)) return [3 /*break*/, 11];
                    return [4 /*yield*/, handleCommentAction(page, postSelector, postIndex, caption, agentId)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    waitTime = config.delay_ms || 5000;
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'waiting', true, {
                            wait_time_ms: waitTime,
                            post_index: postIndex
                        })];
                case 12:
                    _a.sent();
                    console.log("Waiting ".concat(waitTime / 1000, " seconds before moving to the next post..."));
                    return [4 /*yield*/, delay(waitTime)];
                case 13:
                    _a.sent();
                    // Scroll to the next post
                    return [4 /*yield*/, page.evaluate(function () {
                            window.scrollBy(0, window.innerHeight);
                        })];
                case 14:
                    // Scroll to the next post
                    _a.sent();
                    postIndex++;
                    return [3 /*break*/, 17];
                case 15:
                    error_3 = _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'post_interaction_error', false, {
                            post_index: postIndex,
                            error_message: error_3.message
                        })];
                case 16:
                    _a.sent();
                    console.error("Error interacting with post ".concat(postIndex, ":"), error_3);
                    return [3 /*break*/, 18];
                case 17: return [3 /*break*/, 1];
                case 18:
                    if (!(0, app_1.shouldStop)()) return [3 /*break*/, 20];
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'session_stopped_by_user', true, {
                            posts_processed: postIndex - 1
                        })];
                case 19:
                    _a.sent();
                    _a.label = 20;
                case 20: return [2 /*return*/];
            }
        });
    });
}
function handleLikeAction(page, postSelector, postIndex, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var likeButtonSelector, likeButton, ariaLabel, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 13]);
                    likeButtonSelector = "".concat(postSelector, " svg[aria-label=\"Like\"]");
                    return [4 /*yield*/, page.$(likeButtonSelector)];
                case 1:
                    likeButton = _a.sent();
                    return [4 /*yield*/, (likeButton === null || likeButton === void 0 ? void 0 : likeButton.evaluate(function (el) {
                            return el.getAttribute("aria-label");
                        }))];
                case 2:
                    ariaLabel = _a.sent();
                    if (!(ariaLabel === "Like")) return [3 /*break*/, 6];
                    console.log("Liking post ".concat(postIndex, "..."));
                    return [4 /*yield*/, likeButton.click()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.press("Enter")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'like_post', true, {
                            post_index: postIndex,
                            already_liked: false
                        })];
                case 5:
                    _a.sent();
                    console.log("Post ".concat(postIndex, " liked."));
                    return [3 /*break*/, 10];
                case 6:
                    if (!(ariaLabel === "Unlike")) return [3 /*break*/, 8];
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'like_post', true, {
                            post_index: postIndex,
                            already_liked: true
                        })];
                case 7:
                    _a.sent();
                    console.log("Post ".concat(postIndex, " is already liked."));
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'like_post', false, {
                        post_index: postIndex,
                        error_message: 'Like button not found'
                    })];
                case 9:
                    _a.sent();
                    console.log("Like button not found for post ".concat(postIndex, "."));
                    _a.label = 10;
                case 10: return [3 /*break*/, 13];
                case 11:
                    error_4 = _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'like_post', false, {
                            post_index: postIndex,
                            error_message: error_4.message
                        })];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function extractCaption(page, postSelector, postIndex, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var captionSelector, captionElement, caption, moreLinkSelector, moreLink, expandedCaption, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 12]);
                    captionSelector = "".concat(postSelector, " div.x9f619 span._ap3a div span._ap3a");
                    return [4 /*yield*/, page.$(captionSelector)];
                case 1:
                    captionElement = _a.sent();
                    caption = "";
                    if (!captionElement) return [3 /*break*/, 3];
                    return [4 /*yield*/, captionElement.evaluate(function (el) { return el.innerText; })];
                case 2:
                    caption = _a.sent();
                    console.log("Caption for post ".concat(postIndex, ": ").concat(caption));
                    return [3 /*break*/, 4];
                case 3:
                    console.log("No caption found for post ".concat(postIndex, "."));
                    _a.label = 4;
                case 4:
                    moreLinkSelector = "".concat(postSelector, " div.x9f619 span._ap3a span div span.x1lliihq");
                    return [4 /*yield*/, page.$(moreLinkSelector)];
                case 5:
                    moreLink = _a.sent();
                    if (!moreLink) return [3 /*break*/, 8];
                    console.log("Expanding caption for post ".concat(postIndex, "..."));
                    return [4 /*yield*/, moreLink.click()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, captionElement.evaluate(function (el) { return el.innerText; })];
                case 7:
                    expandedCaption = _a.sent();
                    console.log("Expanded Caption for post ".concat(postIndex, ": ").concat(expandedCaption));
                    caption = expandedCaption;
                    _a.label = 8;
                case 8: return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'caption_extracted', true, {
                        post_index: postIndex,
                        caption_preview: caption.substring(0, 100),
                        caption_length: caption.length
                    })];
                case 9:
                    _a.sent();
                    return [2 /*return*/, caption];
                case 10:
                    error_5 = _a.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'caption_extracted', false, {
                            post_index: postIndex,
                            error_message: error_5.message
                        })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, ""];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function handleCommentAction(page, postSelector, postIndex, caption, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var commentBoxSelector, commentBox, prompt_1, schema, startTime, result, generationTime, comment, viralRate, postButton, error_6;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 14, , 16]);
                    commentBoxSelector = "".concat(postSelector, " textarea");
                    return [4 /*yield*/, page.$(commentBoxSelector)];
                case 1:
                    commentBox = _c.sent();
                    if (!commentBox) return [3 /*break*/, 11];
                    console.log("Commenting on post ".concat(postIndex, "..."));
                    prompt_1 = "Craft a thoughtful, engaging, and mature reply to the following post: \"".concat(caption, "\". Ensure the reply is relevant, insightful, and adds value to the conversation. It should reflect empathy and professionalism, and avoid sounding too casual or superficial. also it should be 300 characters or less. and it should not go against instagram Community Standards on spam. so you will have to try your best to humanize the reply");
                    schema = (0, schema_1.getInstagramCommentSchema)();
                    startTime = Date.now();
                    return [4 /*yield*/, (0, Agent_1.runAgent)(schema, prompt_1)];
                case 2:
                    result = _c.sent();
                    generationTime = Date.now() - startTime;
                    comment = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.comment;
                    viralRate = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.viralRate;
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'comment_generated', true, {
                            post_index: postIndex,
                            comment: comment,
                            viral_rate: viralRate,
                            generation_time_ms: generationTime,
                            caption_preview: caption.substring(0, 50)
                        })];
                case 3:
                    _c.sent();
                    // Type the comment
                    return [4 /*yield*/, commentBox.type(comment)];
                case 4:
                    // Type the comment
                    _c.sent();
                    return [4 /*yield*/, page.evaluateHandle(function () {
                            var buttons = Array.from(document.querySelectorAll('div[role="button"]'));
                            return buttons.find(function (button) { return button.textContent === 'Post' && !button.hasAttribute('disabled'); });
                        })];
                case 5:
                    postButton = _c.sent();
                    if (!postButton) return [3 /*break*/, 8];
                    console.log("Posting comment on post ".concat(postIndex, "..."));
                    return [4 /*yield*/, postButton.click()];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'comment_posted', true, {
                            post_index: postIndex,
                            comment: comment
                        })];
                case 7:
                    _c.sent();
                    console.log("Comment posted on post ".concat(postIndex, "."));
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'comment_posted', false, {
                        post_index: postIndex,
                        error_message: 'Post button not found'
                    })];
                case 9:
                    _c.sent();
                    console.log("Post button not found.");
                    _c.label = 10;
                case 10: return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'comment_posted', false, {
                        post_index: postIndex,
                        error_message: 'Comment box not found'
                    })];
                case 12:
                    _c.sent();
                    console.log("Comment box not found.");
                    _c.label = 13;
                case 13: return [3 /*break*/, 16];
                case 14:
                    error_6 = _c.sent();
                    return [4 /*yield*/, ActivityLogger_1.ActivityLogger.logActivity(agentId, 'comment_action_error', false, {
                            post_index: postIndex,
                            error_message: error_6.message
                        })];
                case 15:
                    _c.sent();
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
