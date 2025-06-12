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
exports.generateContent = generateContent;
var axios_1 = require("axios");
var logger_1 = require("../config/logger");
var secret_1 = require("../secret");
var OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
function generateContent(prompt, modelId, options) {
    return __awaiter(this, void 0, void 0, function () {
        var targetModel, messages, requestPayload, response, messageContent, cleanedContent, error_1, axiosError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!secret_1.OPENROUTER_API_KEY) {
                        logger_1.default.error('OpenRouter API key is not configured.');
                        throw new Error('OpenRouter API key is not configured.');
                    }
                    targetModel = modelId || secret_1.OPENROUTER_DEFAULT_MODEL;
                    messages = [{ role: 'user', content: prompt }];
                    // If a schema is provided, we might want to add a system prompt 
                    // or use model-specific features for JSON output if OpenRouter/model supports it.
                    // This part will require more specific handling based on model capabilities.
                    if (options === null || options === void 0 ? void 0 : options.schema) {
                        // Example: Add a system message to guide the model for JSON output
                        // This is a generic approach; specific models might have better ways (e.g. OpenAI's JSON mode)
                        messages.unshift({
                            role: 'system',
                            content: "Please provide the output in a valid JSON format that adheres to the following schema: ".concat(JSON.stringify(options.schema), ". Only output the JSON.")
                        });
                    }
                    requestPayload = {
                        model: targetModel,
                        messages: messages,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    logger_1.default.info("Sending request to OpenRouter with model: ".concat(targetModel));
                    return [4 /*yield*/, axios_1.default.post(OPENROUTER_CHAT_COMPLETIONS_URL, requestPayload, {
                            headers: {
                                'Authorization': "Bearer ".concat(secret_1.OPENROUTER_API_KEY),
                                'HTTP-Referer': secret_1.OPENROUTER_SITE_URL,
                                'X-Title': secret_1.OPENROUTER_APP_NAME,
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (response.data && response.data.choices && response.data.choices.length > 0) {
                        messageContent = response.data.choices[0].message.content;
                        if (messageContent) {
                            if (options === null || options === void 0 ? void 0 : options.schema) {
                                try {
                                    cleanedContent = messageContent.trim();
                                    // Remove markdown code block markers if present
                                    if (cleanedContent.startsWith('```json')) {
                                        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                                    }
                                    else if (cleanedContent.startsWith('```')) {
                                        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                                    }
                                    // Attempt to parse the cleaned JSON
                                    return [2 /*return*/, JSON.parse(cleanedContent)];
                                }
                                catch (parseError) {
                                    logger_1.default.error('Failed to parse OpenRouter response as JSON:', parseError);
                                    logger_1.default.warn('Raw response from OpenRouter:', messageContent);
                                    // Fallback to returning raw text if JSON parsing fails but schema was expected
                                    // Or throw a more specific error
                                    throw new Error('Failed to parse model response into expected JSON schema.');
                                }
                            }
                            return [2 /*return*/, messageContent]; // Return raw text if no schema
                        }
                    }
                    logger_1.default.warn('OpenRouter response did not contain expected content.', response.data);
                    throw new Error('No content received from OpenRouter model.');
                case 3:
                    error_1 = _a.sent();
                    axiosError = error_1;
                    if (axiosError.isAxiosError && axiosError.response) {
                        logger_1.default.error('Error response from OpenRouter API:', {
                            status: axiosError.response.status,
                            data: axiosError.response.data,
                        });
                        throw new Error("OpenRouter API error: ".concat(axiosError.response.status, " - ").concat(JSON.stringify(axiosError.response.data)));
                    }
                    else {
                        logger_1.default.error('Error calling OpenRouter API:', error_1);
                        throw new Error("Failed to communicate with OpenRouter: ".concat(error_1.message));
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
