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
exports.runAgent = runAgent;
exports.chooseCharacter = chooseCharacter;
exports.initAgent = initAgent;
var logger_1 = require("../config/logger");
var fs_1 = require("fs");
var path_1 = require("path");
var readlineSync = require("readline-sync");
var OpenRouterService_1 = require("../services/OpenRouterService");
var secret_1 = require("../secret");
function runAgent(schema, prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var modelId, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    modelId = secret_1.OPENROUTER_DEFAULT_MODEL;
                    return [4 /*yield*/, (0, OpenRouterService_1.generateContent)(prompt, modelId, { schema: schema })];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        logger_1.default.info("No response received from the AI model via OpenRouter. || Service Unavailable");
                        // Consider returning a more specific error or letting the error from generateContentOpenRouter propagate
                        return [2 /*return*/, "Service unavailable or no data!"];
                    }
                    return [2 /*return*/, data];
                case 2:
                    error_1 = _a.sent();
                    logger_1.default.error("Error in runAgent using OpenRouter: ".concat(error_1.message));
                    // Re-throw the error or return a more structured error object
                    // The old handleError was specific to Gemini key rotation, which is not directly applicable here.
                    // For now, we'll let the error propagate or return a generic message.
                    // Depending on requirements, a new error handling strategy for OpenRouter could be implemented.
                    throw error_1; // Or return an error object: return { error: true, message: (error as Error).message };
                case 3: return [2 /*return*/];
            }
        });
    });
}
function chooseCharacter() {
    var charactersDir = (function () {
        var buildPath = path_1.default.join(__dirname, "characters");
        if (fs_1.default.existsSync(buildPath)) {
            return buildPath;
        }
        else {
            // Fallback to source directory
            return path_1.default.join(process.cwd(), "src", "Agent", "characters");
        }
    })();
    var files = fs_1.default.readdirSync(charactersDir);
    var jsonFiles = files.filter(function (file) { return file.endsWith(".json"); });
    if (jsonFiles.length === 0) {
        throw new Error("No character JSON files found");
    }
    console.log("Select a character:");
    jsonFiles.forEach(function (file, index) {
        console.log("".concat(index + 1, ": ").concat(file));
    });
    var answer = readlineSync.question("Enter the number of your choice: ");
    var selection = parseInt(answer);
    if (isNaN(selection) || selection < 1 || selection > jsonFiles.length) {
        throw new Error("Invalid selection");
    }
    var chosenFile = path_1.default.join(charactersDir, jsonFiles[selection - 1]);
    var data = fs_1.default.readFileSync(chosenFile, "utf8");
    var characterConfig = JSON.parse(data);
    return characterConfig;
}
function initAgent() {
    try {
        var character = chooseCharacter();
        console.log("Character selected:", character);
        return character;
    }
    catch (error) {
        console.error("Error selecting character:", error);
        process.exit(1);
    }
}
if (require.main === module) {
    (function () {
        initAgent();
    })();
}
