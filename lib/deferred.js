"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deferred = deferred;
function deferred() {
    var localResolve;
    var localReject;
    var promise = new Promise(function (resolve, reject) {
        localResolve = resolve;
        localReject = reject;
    });
    return {
        promise: promise,
        get resolve() {
            return localResolve;
        },
        get reject() {
            return localReject;
        },
    };
}
