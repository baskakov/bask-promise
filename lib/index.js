'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.');
            while (_)
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.randomAfter =
    exports.randomBefore =
    exports.random =
    exports.keySequence =
    exports.sequence =
    exports.delayFun =
    exports.delayAfter =
    exports.delayBefore =
    exports.delay =
    exports.repeat =
        void 0;
var deferred_1 = require('./deferred');
function repeat(promiseFun, times, onError) {
    var _this = this;
    if (times === void 0) {
        times = 1;
    }
    return promiseFun().catch(function (error) {
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!onError) return [3 /*break*/, 2];
                        return [4 /*yield*/, onError(error)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (times === 0) throw error;
                        else if (times < 0) return [2 /*return*/, repeat(promiseFun, times, onError)];
                        else return [2 /*return*/, repeat(promiseFun, times - 1, onError)];
                        return [2 /*return*/];
                }
            });
        });
    });
}
exports.repeat = repeat;
function delay(milliseconds) {
    if (milliseconds > 0)
        return new Promise(function (resolve) {
            return setTimeout(resolve, milliseconds);
        });
    else return Promise.resolve();
}
exports.delay = delay;
function delayBefore(promiseFun, milliseconds) {
    return delay(milliseconds).then(promiseFun);
}
exports.delayBefore = delayBefore;
function delayAfter(promise, milliseconds) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, promise];
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
exports.delayAfter = delayAfter;
function delayFun(milliseconds) {
    return function (x) {
        return delay(milliseconds).then(function () {
            return x;
        });
    };
}
exports.delayFun = delayFun;
function sequence(promiseFuns) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [
                2 /*return*/,
                promiseFuns.reduce(function (acc, promiseFun) {
                    return acc.then(function (result) {
                        return promiseFun().then(function (y) {
                            return result.concat([y]);
                        });
                    });
                }, Promise.resolve([])),
            ];
        });
    });
}
exports.sequence = sequence;
function keySequence(array, promiseFun) {
    return sequence(
        array.map(function (key) {
            return function () {
                return promiseFun(key);
            };
        }),
    );
}
exports.keySequence = keySequence;
function randomTime(millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) {
        millisecondsFrom = 0;
    }
    return millisecondsFrom + (millisecondsTo - millisecondsFrom) * Math.random();
}
/**
 * Random time period delay
 * @param millisecondsTo - upper bound
 * @param [millisecondsFrom=0] - lower bound
 */
function random(millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) {
        millisecondsFrom = 0;
    }
    return delay(randomTime(millisecondsTo, millisecondsFrom));
}
exports.random = random;
function randomBefore(promiseFun, millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) {
        millisecondsFrom = 0;
    }
    return delayBefore(promiseFun, randomTime(millisecondsTo, millisecondsFrom));
}
exports.randomBefore = randomBefore;
function randomAfter(promise, millisecondsTo, millisecondsFrom) {
    if (millisecondsFrom === void 0) {
        millisecondsFrom = 0;
    }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, delayAfter(promise, randomTime(millisecondsTo, millisecondsFrom))];
        });
    });
}
exports.randomAfter = randomAfter;
exports.default = {
    repeat: repeat,
    delay: delay,
    delayAfter: delayAfter,
    delayBefore: delayBefore,
    delayFun: delayFun,
    sequence: sequence,
    keySequence: keySequence,
    deferred: deferred_1.deferred,
    random: random,
    randomBefore: randomBefore,
    randomAfter: randomAfter,
};
