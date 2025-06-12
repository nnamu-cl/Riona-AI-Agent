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
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getAllItems = void 0;
var supabaseClient_1 = require("./supabaseClient");
/**
 * Fetches all items from a specified table.
 * @param tableName - The name of the table to fetch from.
 * @returns A promise that resolves with the data or an error.
 */
var getAllItems = function (tableName) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabaseClient_1.supabase.from(tableName).select('*')];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error("Error fetching all items from ".concat(tableName, ":"), error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.getAllItems = getAllItems;
/**
 * Fetches a single item by its ID from a specified table.
 * @param tableName - The name of the table to fetch from.
 * @param id - The ID of the item to fetch.
 * @returns A promise that resolves with the data or an error.
 */
var getItemById = function (tableName, id) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabaseClient_1.supabase.from(tableName).select('*').eq('id', id).single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error("Error fetching item with id ".concat(id, " from ").concat(tableName, ":"), error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.getItemById = getItemById;
/**
 * Creates a new item in a specified table.
 * @param tableName - The name of the table to create the item in.
 * @param item - The item data to insert.
 * @returns A promise that resolves with the created data or an error.
 */
var createItem = function (tableName, item) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabaseClient_1.supabase.from(tableName).insert([item]).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error("Error creating item in ".concat(tableName, ":"), error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.createItem = createItem;
/**
 * Updates an existing item by its ID in a specified table.
 * @param tableName - The name of the table to update the item in.
 * @param id - The ID of the item to update.
 * @param updates - The updates to apply to the item.
 * @returns A promise that resolves with the updated data or an error.
 */
var updateItem = function (tableName, id, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabaseClient_1.supabase.from(tableName).update(updates).eq('id', id).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error("Error updating item with id ".concat(id, " in ").concat(tableName, ":"), error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.updateItem = updateItem;
/**
 * Deletes an item by its ID from a specified table.
 * @param tableName - The name of the table to delete the item from.
 * @param id - The ID of the item to delete.
 * @returns A promise that resolves with the deleted data or an error.
 */
var deleteItem = function (tableName, id) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabaseClient_1.supabase.from(tableName).delete().eq('id', id).select()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error("Error deleting item with id ".concat(id, " from ").concat(tableName, ":"), error);
                    throw error;
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.deleteItem = deleteItem;
