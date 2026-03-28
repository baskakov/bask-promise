export function deferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (e: any) => void;
    readonly isPending: boolean;
    readonly isResolved: boolean;
    readonly isFailed: boolean;
    readonly value: T | undefined;
    readonly error: unknown;
} {
    let localResolve: (value: T | PromiseLike<T>) => void;
    let localReject: (e: any) => void;
    let localIsPending = true;
    let localIsResolved = false;
    let localIsFailed = false;
    let localValue: T | undefined;
    let localError: unknown;

    const promise = new Promise<T>((resolve, reject) => {
        localResolve = (value) => {
            localIsPending = false;
            localIsResolved = true;
            Promise.resolve(value).then((v) => {
                localValue = v;
            });
            resolve(value);
        };
        localReject = (e) => {
            localIsPending = false;
            localIsFailed = true;
            localError = e;
            reject(e);
        };
    });

    return {
        promise,
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
