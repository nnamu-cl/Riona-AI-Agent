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
exports.supabaseAdminClient = exports.supabaseClient = exports.SupabaseService = exports.supabaseService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var secret_1 = require("../secret");
var logger_1 = require("../config/logger");
// Supabase Clients
var SupabaseService = /** @class */ (function () {
    function SupabaseService() {
        if (!secret_1.SUPABASE_URL) {
            throw new Error('SUPABASE_URL is required');
        }
        if (!secret_1.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_ANON_KEY is required');
        }
        // Anonymous client for public operations
        this.anonClient = (0, supabase_js_1.createClient)(secret_1.SUPABASE_URL, secret_1.SUPABASE_ANON_KEY);
        // Service role client for admin operations (if service role key is provided)
        if (secret_1.SUPABASE_SERVICE_ROLE_KEY) {
            this.serviceClient = (0, supabase_js_1.createClient)(secret_1.SUPABASE_URL, secret_1.SUPABASE_SERVICE_ROLE_KEY);
        }
        else {
            this.serviceClient = this.anonClient;
            logger_1.default.warn('SUPABASE_SERVICE_ROLE_KEY not provided. Using anon client for all operations.');
        }
    }
    // Get the appropriate client
    SupabaseService.prototype.getClient = function (useServiceRole) {
        if (useServiceRole === void 0) { useServiceRole = false; }
        return useServiceRole ? this.serviceClient : this.anonClient;
    };
    // Generic CRUD Operations
    /**
     * Insert a single record or multiple records
     */
    SupabaseService.prototype.insert = function (table_1, data_1) {
        return __awaiter(this, arguments, void 0, function (table, data, options, useServiceRole) {
            var client, _a, result, error, error_1;
            if (options === void 0) { options = {}; }
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        return [4 /*yield*/, client
                                .from(table)
                                .insert(data)
                                .select(options.returning || '*')];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error inserting into ".concat(table, ":"), error);
                            throw new Error("Insert failed: ".concat(error.message));
                        }
                        logger_1.default.info("Successfully inserted ".concat(Array.isArray(data) ? data.length : 1, " record(s) into ").concat(table));
                        return [2 /*return*/, result || []];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.default.error("Insert operation failed for table ".concat(table, ":"), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Select records with optional filtering, ordering, and pagination
     */
    SupabaseService.prototype.select = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options, useServiceRole) {
            var client, query_1, _a, data, error, error_2;
            var _b;
            if (options === void 0) { options = {}; }
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        query_1 = client.from(table).select(options.select || '*');
                        // Apply filters
                        if (options.filters) {
                            Object.entries(options.filters).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                if (value !== undefined && value !== null) {
                                    query_1 = query_1.eq(key, value);
                                }
                            });
                        }
                        // Apply ordering
                        if (options.orderBy) {
                            query_1 = query_1.order(options.orderBy.column, { ascending: (_b = options.orderBy.ascending) !== null && _b !== void 0 ? _b : true });
                        }
                        // Apply pagination
                        if (options.limit) {
                            query_1 = query_1.limit(options.limit);
                        }
                        if (options.offset) {
                            query_1 = query_1.range(options.offset, options.offset + (options.limit || 1000) - 1);
                        }
                        return [4 /*yield*/, query_1];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error selecting from ".concat(table, ":"), error);
                            throw new Error("Select failed: ".concat(error.message));
                        }
                        logger_1.default.info("Successfully selected ".concat((data === null || data === void 0 ? void 0 : data.length) || 0, " record(s) from ").concat(table));
                        return [2 /*return*/, data || []];
                    case 2:
                        error_2 = _c.sent();
                        logger_1.default.error("Select operation failed for table ".concat(table, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update records
     */
    SupabaseService.prototype.update = function (table_1, updates_1, filters_1) {
        return __awaiter(this, arguments, void 0, function (table, updates, filters, options, useServiceRole) {
            var client, query_2, _a, data, error, error_3;
            if (options === void 0) { options = {}; }
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        query_2 = client.from(table).update(updates);
                        // Apply filters
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined && value !== null) {
                                query_2 = query_2.eq(key, value);
                            }
                        });
                        return [4 /*yield*/, query_2.select(options.returning || '*')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error updating ".concat(table, ":"), error);
                            throw new Error("Update failed: ".concat(error.message));
                        }
                        logger_1.default.info("Successfully updated record(s) in ".concat(table));
                        return [2 /*return*/, data || []];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.default.error("Update operation failed for table ".concat(table, ":"), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete records
     */
    SupabaseService.prototype.delete = function (table_1, filters_1) {
        return __awaiter(this, arguments, void 0, function (table, filters, useServiceRole) {
            var client, query_3, _a, data, error, error_4;
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        query_3 = client.from(table).delete();
                        // Apply filters
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined && value !== null) {
                                query_3 = query_3.eq(key, value);
                            }
                        });
                        return [4 /*yield*/, query_3];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error deleting from ".concat(table, ":"), error);
                            throw new Error("Delete failed: ".concat(error.message));
                        }
                        logger_1.default.info("Successfully deleted record(s) from ".concat(table));
                        return [2 /*return*/, data || []];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.default.error("Delete operation failed for table ".concat(table, ":"), error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upsert (insert or update) records
     */
    SupabaseService.prototype.upsert = function (table_1, data_1) {
        return __awaiter(this, arguments, void 0, function (table, data, useServiceRole) {
            var client, query, _a, result, error, error_5;
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        query = client.from(table).upsert(data);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error upserting into ".concat(table, ":"), error);
                            throw new Error("Upsert failed: ".concat(error.message));
                        }
                        logger_1.default.info("Successfully upserted ".concat(Array.isArray(data) ? data.length : 1, " record(s) into ").concat(table));
                        return [2 /*return*/, result || []];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.default.error("Upsert operation failed for table ".concat(table, ":"), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a custom SQL query (requires service role)
     */
    SupabaseService.prototype.executeQuery = function (query_4) {
        return __awaiter(this, arguments, void 0, function (query, params) {
            var _a, data, error, error_6;
            if (params === void 0) { params = []; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.serviceClient.rpc('execute_sql', {
                                query_text: query,
                                query_params: params
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.default.error('Error executing custom query:', error);
                            throw new Error("Query execution failed: ".concat(error.message));
                        }
                        logger_1.default.info('Successfully executed custom query');
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        logger_1.default.error('Custom query execution failed:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a single record by ID
     */
    SupabaseService.prototype.findById = function (table_1, id_1, select_1) {
        return __awaiter(this, arguments, void 0, function (table, id, select, useServiceRole) {
            var records, error_7;
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.select(table, {
                                select: select,
                                filters: { id: id },
                                limit: 1
                            }, useServiceRole)];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.length > 0 ? records[0] : null];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.default.error("Error finding record by ID in ".concat(table, ":"), error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Count records in a table
     */
    SupabaseService.prototype.count = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, filters, useServiceRole) {
            var client, query_4, _a, count, error, error_8;
            if (filters === void 0) { filters = {}; }
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        client = this.getClient(useServiceRole);
                        query_4 = client.from(table).select('*', { count: 'exact', head: true });
                        // Apply filters
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined && value !== null) {
                                query_4 = query_4.eq(key, value);
                            }
                        });
                        return [4 /*yield*/, query_4];
                    case 1:
                        _a = _b.sent(), count = _a.count, error = _a.error;
                        if (error) {
                            logger_1.default.error("Error counting records in ".concat(table, ":"), error);
                            throw new Error("Count failed: ".concat(error.message));
                        }
                        return [2 /*return*/, count || 0];
                    case 2:
                        error_8 = _b.sent();
                        logger_1.default.error("Count operation failed for table ".concat(table, ":"), error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if a record exists
     */
    SupabaseService.prototype.exists = function (table_1, filters_1) {
        return __awaiter(this, arguments, void 0, function (table, filters, useServiceRole) {
            var count, error_9;
            if (useServiceRole === void 0) { useServiceRole = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.count(table, filters, useServiceRole)];
                    case 1:
                        count = _a.sent();
                        return [2 /*return*/, count > 0];
                    case 2:
                        error_9 = _a.sent();
                        logger_1.default.error("Error checking existence in ".concat(table, ":"), error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Batch operations with transaction-like behavior
     */
    SupabaseService.prototype.batch = function (operations) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.default.info("Executing batch of ".concat(operations.length, " operations"));
                        return [4 /*yield*/, Promise.all(operations.map(function (op) { return op(); }))];
                    case 1:
                        results = _a.sent();
                        logger_1.default.info('Batch operations completed successfully');
                        return [2 /*return*/, results];
                    case 2:
                        error_10 = _a.sent();
                        logger_1.default.error('Batch operations failed:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Health check - test database connection
     */
    SupabaseService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.anonClient.from('_health_check').select('*').limit(1)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
                            logger_1.default.error('Database health check failed:', error);
                            return [2 /*return*/, false];
                        }
                        logger_1.default.info('Database connection is healthy');
                        return [2 /*return*/, true];
                    case 2:
                        error_11 = _b.sent();
                        logger_1.default.error('Database health check error:', error_11);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SupabaseService;
}());
exports.SupabaseService = SupabaseService;
// Create and export a singleton instance
exports.supabaseService = new SupabaseService();
// Convenience exports for direct client access
exports.supabaseClient = exports.supabaseService.getClient(false);
exports.supabaseAdminClient = exports.supabaseService.getClient(true);
