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
exports.setCurrentAgentId = exports.getCurrentAgentId = exports.shouldStop = void 0;
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var dotenv_1 = require("dotenv");
var helmet_1 = require("helmet"); // For securing HTTP headers
var logger_1 = require("./config/logger");
var ActivityLogger_1 = require("./services/ActivityLogger");
// Set up process-level error handlers
(0, logger_1.setupErrorHandlers)();
// Initialize environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
// Middleware setup
app.use((0, helmet_1.default)({ xssFilter: true, noSniff: true })); // Security headers
app.use(express_1.default.json()); // JSON body parsing
app.use(express_1.default.urlencoded({ extended: true, limit: '1kb' })); // URL-encoded data
app.use((0, cookie_parser_1.default)()); // Cookie parsing
// Global variable to track running agent
var currentAgentId = null;
var shouldStopAgent = false;
var InstagramWithTracking_1 = require("./client/InstagramWithTracking");
// API Routes
/**
 * Start an agent
 * POST /api/agent/start
 * Body: { agent_id: "uuid", config: {...} }
 */
app.post('/api/agent/start', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, agent_id_1, _b, config, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, agent_id_1 = _a.agent_id, _b = _a.config, config = _b === void 0 ? {} : _b;
                if (!agent_id_1) {
                    res.status(400).json({
                        success: false,
                        error: 'agent_id is required'
                    });
                    return [2 /*return*/];
                }
                // Check if an agent is already running
                if (currentAgentId) {
                    res.status(409).json({
                        success: false,
                        error: 'Another agent is already running',
                        current_agent_id: currentAgentId
                    });
                    return [2 /*return*/];
                }
                // Initialize agent tracking
                return [4 /*yield*/, ActivityLogger_1.ActivityLogger.initializeAgent(agent_id_1)];
            case 1:
                // Initialize agent tracking
                _c.sent();
                // Set current agent
                currentAgentId = agent_id_1;
                shouldStopAgent = false;
                // Start the Instagram agent in background
                (0, InstagramWithTracking_1.runInstagramWithTracking)(agent_id_1, config).catch(function (error) {
                    logger_1.default.error("Instagram agent error for ".concat(agent_id_1, ":"), error);
                    currentAgentId = null;
                    ActivityLogger_1.ActivityLogger.stopAgent(agent_id_1);
                });
                logger_1.default.info("Agent ".concat(agent_id_1, " started with config:"), config);
                res.json({
                    success: true,
                    agent_id: agent_id_1,
                    status: 'active',
                    config: config
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                logger_1.default.error('Error starting agent:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to start agent'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get agent status
 * GET /api/agent/status
 */
app.get('/api/agent/status', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ActivityLogger_1.ActivityLogger.getAgentStatus(currentAgentId || undefined)];
            case 1:
                status_1 = _a.sent();
                res.json(__assign(__assign({ agent_id: currentAgentId }, status_1), { is_running: currentAgentId !== null }));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                logger_1.default.error('Error getting agent status:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agent status'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Stop the current agent
 * POST /api/agent/stop
 */
app.post('/api/agent/stop', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stoppedAgentId, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!currentAgentId) {
                    res.status(400).json({
                        success: false,
                        error: 'No agent is currently running'
                    });
                    return [2 /*return*/];
                }
                // Set stop flag
                shouldStopAgent = true;
                // Update database
                return [4 /*yield*/, ActivityLogger_1.ActivityLogger.stopAgent(currentAgentId)];
            case 1:
                // Update database
                _a.sent();
                stoppedAgentId = currentAgentId;
                currentAgentId = null;
                logger_1.default.info("Agent ".concat(stoppedAgentId, " stop requested"));
                res.json({
                    success: true,
                    agent_id: stoppedAgentId,
                    stopped_at: new Date().toISOString()
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                logger_1.default.error('Error stopping agent:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to stop agent'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Export the stop flag checker
var shouldStop = function () { return shouldStopAgent; };
exports.shouldStop = shouldStop;
var getCurrentAgentId = function () { return currentAgentId; };
exports.getCurrentAgentId = getCurrentAgentId;
var setCurrentAgentId = function (agentId) { currentAgentId = agentId; };
exports.setCurrentAgentId = setCurrentAgentId;
// Start server if this file is run directly
if (require.main === module) {
    var PORT_1 = process.env.PORT || 3000;
    app.listen(PORT_1, function () {
        logger_1.default.info("\uD83D\uDE80 RIONA Agent API Server running on port ".concat(PORT_1));
        logger_1.default.info("\uD83D\uDCCA Agent endpoints available at:");
        logger_1.default.info("   POST http://localhost:".concat(PORT_1, "/api/agent/start"));
        logger_1.default.info("   GET  http://localhost:".concat(PORT_1, "/api/agent/status"));
        logger_1.default.info("   POST http://localhost:".concat(PORT_1, "/api/agent/stop"));
    });
}
exports.default = app;
