export function deferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (e: any) => void;
} {
    let localResolve: (value: T | PromiseLike<T>) => void;
    let localReject: (e: any) => void;

    const promise = new Promise<T>((resolve: (value: T | PromiseLike<T>) => void, reject: (e: any) => void) => {
        localResolve = resolve;
        localReject = reject;
    });

    return {
        promise,
        get resolve() {
            return localResolve;
        },
        get reject() {
            return localReject;
        },
    };
}
