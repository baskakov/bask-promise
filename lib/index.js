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
exports.repeat = repeat;
exports.delay = delay;
exports.exponential = exponential;
exports.repeatExponential = repeatExponential;
exports.delayBefore = delayBefore;
exports.delayAfter = delayAfter;
exports.delayThrow = delayThrow;
exports.delayTill = delayTill;
exports.delayFun = delayFun;
exports.sequence = sequence;
exports.keySequence = keySequence;
exports.concurrent = concurrent;
exports.random = random;
exports.randomBefore = randomBefore;
exports.randomAfter = randomAfter;
exports.left = left;
exports.timer = timer;
exports.timeout = timeout;
var deferred_1 = require("./deferred");
function applyJitter(ms, jitter) {
    if (jitter === 'full')
        return Math.random() * ms;
    if (jitter === 'equal')
        return ms / 2 + Math.random() * (ms / 2);
    return ms;
}
function repeat(optionsOrFun, times, onError) {
    var _this = this;
    var _a, _b;
    if (times === void 0) { times = 1; }
    var promiseFun;
    var shouldRetry;
    var backoff;
    var jitter = false;
    var signal;
    if (typeof optionsOrFun === 'function') {
        promiseFun = optionsOrFun;
    }
    else {
        promiseFun = optionsOrFun.promiseFun;
        times = (_a = optionsOrFun.times) !== null && _a !== void 0 ? _a : 1;
        onError = optionsOrFun.onError;
        shouldRetry = optionsOrFun.shouldRetry;
        backoff = optionsOrFun.backoff;
        jitter = (_b = optionsOrFun.jitter) !== null && _b !== void 0 ? _b : false;
        signal = optionsOrFun.signal;
    }
    var attempt = 0;
    var run = function () {
        return promiseFun().catch(function (error) { return __awaiter(_this, void 0, void 0, function () {
            var currentAttempt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentAttempt = attempt++;
                        if (shouldRetry && !shouldRetry(error, currentAttempt))
                            throw error;
                        if (!onError) return [3 /*break*/, 2];
                        return [4 /*yield*/, onError(error)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!backoff) return [3 /*break*/, 4];
                        return [4 /*yield*/, delayAbortable(applyJitter(backoff(currentAttempt), jitter), signal)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (signal === null || signal === void 0 ? void 0 : signal.aborted)
                            throw signal.reason;
                        if (times === 0)
                            throw error;
                        else if (times < 0)
                            return [2 /*return*/, run()];
                        else {
                            times--;
                            return [2 /*return*/, run()];
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    if (signal === null || signal === void 0 ? void 0 : signal.aborted)
        return Promise.reject(signal.reason);
    return run();
}
function delay(milliseconds) {
    if (milliseconds > 0)
        return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
    else
        return Promise.resolve();
}
function delayAbortable(milliseconds, signal) {
    if (!signal)
        return delay(milliseconds);
    if (signal.aborted)
        return Promise.reject(signal.reason);
    return new Promise(function (resolve, reject) {
        var timeoutId = setTimeout(resolve, milliseconds);
        signal.addEventListener('abort', function () {
            clearTimeout(timeoutId);
            reject(signal.reason);
        }, { once: true });
    });
}
function exponential(baseDelay, maxDelay) {
    if (baseDelay === void 0) { baseDelay = 1000; }
    if (maxDelay === void 0) { maxDelay = 30000; }
    return function (attempt) { return Math.min(baseDelay * Math.pow(2, attempt), maxDelay); };
}
function repeatExponential(_a) {
    var promiseFun = _a.promiseFun, _b = _a.times, times = _b === void 0 ? 10 : _b, _c = _a.baseDelay, baseDelay = _c === void 0 ? 100 : _c, onError = _a.onError;
    var attempt = 0;
    var withDelay = function () { return delay(baseDelay * Math.pow(2, attempt++)).then(promiseFun); };
    return repeat(withDelay, times, onError);
}
function delayBefore(promiseFun, milliseconds) {
    return delay(milliseconds).then(promiseFun);
}
function delayAfter(promise, milliseconds) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promise];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, delay(milliseconds)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function delayThrow(milliseconds) {
    return function (e) { return delay(milliseconds).then(function () { return Promise.reject(e); }); };
}
function delayTill(promise_1, milliseconds_1) {
    return __awaiter(this, arguments, void 0, function (promise, milliseconds, delayError) {
        if (delayError === void 0) { delayError = false; }
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all([delayError ? promise.catch(delayThrow(milliseconds)) : promise, delay(milliseconds)]).then(function (_a) {
                    var result = _a[0];
                    return result;
                })];
        });
    });
}
function delayFun(milliseconds) {
    return function (x) { return delay(milliseconds).then(function () { return x; }); };
}
function sequence(promiseFuns) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, promiseFuns.reduce(function (acc, promiseFun) { return acc.then(function (result) { return promiseFun().then(function (y) { return result.concat([y]); }); }); }, Promise.resolve([]))];
        });
    });
}
function keySequence(array, promiseFun) {
    return sequence(array.map(function (key) { return function () { return promiseFun(key); }; }));
}
function concurrent(concurrency, promiseFuns) {
    if (concurrency <= 1)
        return sequence(promiseFuns);
    if (concurrency >= promiseFuns.length)
        return Promise.all(promiseFuns.map(function (fun) { return fun(); }));
    return Promise.all(Array.from(new Array(concurrency), function (_, i) { return sequence(promiseFuns.filter(function (x, j) { return j % concurrency === i; })); })).then(function (arrayOfArrays) {
        return Array.from(new Array(promiseFuns.length), function (_, i) { return arrayOfArrays[i % concurrency][(i - (i % concurrency)) / concurrency]; });
    });
}
function randomTime(millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) { millisecondsFrom = 0; }
    return millisecondsFrom + (millisecondsTo - millisecondsFrom) * Math.random();
}
/**
 * Random time period delay
 * @param millisecondsTo - upper bound
 * @param [millisecondsFrom=0] - lower bound
 */
function random(millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) { millisecondsFrom = 0; }
    return delay(randomTime(millisecondsTo, millisecondsFrom));
}
function randomBefore(promiseFun, millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) { millisecondsFrom = 0; }
    return delayBefore(promiseFun, randomTime(millisecondsTo, millisecondsFrom));
}
function randomAfter(promise_1, millisecondsTo_1) {
    return __awaiter(this, arguments, void 0, function (promise, millisecondsTo, millisecondsFrom) {
        if (millisecondsFrom === void 0) { millisecondsFrom = 0; }
        return __generator(this, function (_a) {
            return [2 /*return*/, delayAfter(promise, randomTime(millisecondsTo, millisecondsFrom))];
        });
    });
}
function left(primary, guard) {
    return new Promise(function (resolve, reject) {
        primary.then(resolve, reject);
        guard.catch(reject);
    });
}
function timer(milliseconds_1) {
    return __awaiter(this, arguments, void 0, function (milliseconds, message) {
        if (message === void 0) { message = "Timeout exceeded: ".concat(milliseconds, "ms"); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, delay(milliseconds)];
                case 1:
                    _a.sent();
                    throw new Error(message);
            }
        });
    });
}
function timeout(promise, milliseconds) {
    return left(promise, timer(milliseconds));
}
exports.default = {
    repeat: repeat,
    repeatExponential: repeatExponential,
    exponential: exponential,
    delay: delay,
    delayAfter: delayAfter,
    delayBefore: delayBefore,
    delayTill: delayTill,
    delayThrow: delayThrow,
    delayFun: delayFun,
    sequence: sequence,
    keySequence: keySequence,
    deferred: deferred_1.deferred,
    random: random,
    randomBefore: randomBefore,
    randomAfter: randomAfter,
    concurrent: concurrent,
    timeout: timeout,
    timer: timer,
    left: left,
};
