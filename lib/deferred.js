"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deferred = deferred;
function deferred() {
    var localResolve;
    var localReject;
    var localIsPending = true;
    var localIsResolved = false;
    var localIsFailed = false;
    var localValue;
    var localError;
    var promise = new Promise(function (resolve, reject) {
        localResolve = function (value) {
            localIsPending = false;
            localIsResolved = true;
            Promise.resolve(value).then(function (v) {
                localValue = v;
            });
            resolve(value);
        };
        localReject = function (e) {
            localIsPending = false;
            localIsFailed = true;
            localError = e;
            reject(e);
        };
    });
    return {
        promise: promise,
        get resolve() {
            return localResolve;
        },
        get reject() {
            return localReject;
        },
        get isPending() {
            return localIsPending;
        },
        get isResolved() {
            return localIsResolved;
        },
        get isFailed() {
            return localIsFailed;
        },
        get value() {
            return localValue;
        },
        get error() {
            return localError;
        },
    };
}
