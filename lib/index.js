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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.keySequence = exports.sequence = exports.delayAfter = exports.delayBefore = exports.delay = exports.repeat = void 0;
function repeat(promiseFun, times, logger) {
    if (times === void 0) { times = 1; }
    return promiseFun().catch(function (error) {
        if (logger)
            logger(error);
        if (times === 0)
            throw error;
        else if (times < 0)
            return repeat(promiseFun, times, logger);
        else
            return repeat(promiseFun, times - 1, logger);
    });
}
exports.repeat = repeat;
function delay(milliseconds) {
    if (milliseconds === void 0) { milliseconds = 0; }
    if (milliseconds > 0)
        return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
    else
        return Promise.resolve();
}
exports.delay = delay;
function delayBefore(promiseFun, milliseconds) {
    if (milliseconds === void 0) { milliseconds = 0; }
    return delay(milliseconds).then(promiseFun);
}
exports.delayBefore = delayBefore;
function delayAfter(promiseFun, milliseconds) {
    if (milliseconds === void 0) { milliseconds = 0; }
    return promiseFun().then(function (x) { return delay(milliseconds).then(function () { return x; }); });
}
exports.delayAfter = delayAfter;
function sequence(promiseFuns) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, promiseFuns.reduce(function (acc, promiseFun) { return acc.then(function (result) { return promiseFun().then(function (y) { return result.concat([y]); }); }); }, Promise.resolve([]))];
        });
    });
}
exports.sequence = sequence;
function keySequence(array, promiseFun) {
    return sequence(array.map(function (key) { return function () { return promiseFun(key); }; }));
}
exports.keySequence = keySequence;
exports.default = {
    repeat: repeat,
    delay: delay,
    delayAfter: delayAfter,
    delayBefore: delayBefore,
    sequence: sequence,
    keySequence: keySequence
};
