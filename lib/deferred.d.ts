export declare function deferred<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (e: any) => void;
    readonly isPending: boolean;
    readonly isResolved: boolean;
    readonly isFailed: boolean;
    readonly value: T | undefined;
    readonly error: unknown;
};
