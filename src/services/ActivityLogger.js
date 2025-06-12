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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogger = void 0;
var supabase_1 = require("./supabase");
var logger_1 = require("../config/logger");
/**
 * Simple activity logger that appends actions to agent_tracking table
 */
var ActivityLogger = /** @class */ (function () {
    function ActivityLogger() {
    }
    /**
     * Log a single activity for an agent
     */
    ActivityLogger.logActivity = function (agentId_1, action_1, success_1) {
        return __awaiter(this, arguments, void 0, function (agentId, action, success, metadata) {
            var activityEntry, existing, currentLog, updatedLog, error_1;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        activityEntry = {
                            action: action,
                            success: success,
                            timestamp: new Date().toISOString(),
                            metadata: metadata
                        };
                        return [4 /*yield*/, supabase_1.supabaseService.select('agent_tracking', {
                                filters: { agent_id: agentId },
                                limit: 1
                            })];
                    case 1:
                        existing = _a.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 3];
                        currentLog = existing[0].activity_log || [];
                        updatedLog = __spreadArray(__spreadArray([], currentLog, true), [activityEntry], false);
                        // Update with new activity log
                        return [4 /*yield*/, supabase_1.supabaseService.update('agent_tracking', {
                                activity_log: updatedLog,
                                total_actions: (existing[0].total_actions || 0) + 1,
                                updated_at: new Date().toISOString()
                            }, { agent_id: agentId })];
                    case 2:
                        // Update with new activity log
                        _a.sent();
                        logger_1.default.info("Activity logged for agent ".concat(agentId, ": ").concat(action, " - ").concat(success ? 'SUCCESS' : 'FAILED'));
                        return [3 /*break*/, 4];
                    case 3:
                        logger_1.default.warn("No agent tracking record found for agent ".concat(agentId));
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        logger_1.default.error("Failed to log activity for agent ".concat(agentId, ":"), error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize agent tracking record
     */
    ActivityLogger.initializeAgent = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, supabase_1.supabaseService.select('agent_tracking', {
                                filters: { agent_id: agentId },
                                limit: 1
                            })];
                    case 1:
                        existing = _a.sent();
                        if (!(existing.length === 0)) return [3 /*break*/, 3];
                        // Create new record
                        return [4 /*yield*/, supabase_1.supabaseService.insert('agent_tracking', {
                                agent_id: agentId,
                                status: 'active',
                                started_at: new Date().toISOString(),
                                activity_log: [],
                                total_actions: 0
                            })];
                    case 2:
                        // Create new record
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // Update existing record
                    return [4 /*yield*/, supabase_1.supabaseService.update('agent_tracking', {
                            status: 'active',
                            started_at: new Date().toISOString()
                        }, { agent_id: agentId })];
                    case 4:
                        // Update existing record
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        logger_1.default.info("Agent tracking initialized for agent ".concat(agentId));
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        logger_1.default.error("Failed to initialize agent tracking for ".concat(agentId, ":"), error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop agent tracking
     */
    ActivityLogger.stopAgent = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabaseService.update('agent_tracking', {
                                status: 'stopped',
                                stopped_at: new Date().toISOString()
                            }, { agent_id: agentId })];
                    case 1:
                        _a.sent();
                        logger_1.default.info("Agent tracking stopped for agent ".concat(agentId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.default.error("Failed to stop agent tracking for ".concat(agentId, ":"), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get agent status
     */
    ActivityLogger.getAgentStatus = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var filters, tracking, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        filters = agentId ? { agent_id: agentId } : {};
                        return [4 /*yield*/, supabase_1.supabaseService.select('agent_tracking', {
                                filters: filters,
                                limit: 1,
                                orderBy: { column: 'updated_at', ascending: false }
                            })];
                    case 1:
                        tracking = _a.sent();
                        return [2 /*return*/, tracking[0] || { status: 'stopped', total_actions: 0 }];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.default.error("Failed to get agent status:", error_4);
                        return [2 /*return*/, { status: 'error', total_actions: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityLogger;
}());
exports.ActivityLogger = ActivityLogger;
