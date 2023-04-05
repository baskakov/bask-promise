export declare function repeat<T>(promiseFun: () => Promise<T>, times?: number, onError?: (error: Error) => void): Promise<T>;
export declare function delay(milliseconds: number): Promise<void>;
export declare function delayBefore<T>(promiseFun: () => Promise<T>, milliseconds: number): Promise<T>;
export declare function delayAfter<T>(promise: Promise<T>, milliseconds: number): Promise<T>;
export declare function sequence<T>(promiseFuns: (() => Promise<T>)[]): Promise<T[]>;
export declare function keySequence<K, T>(array: K[], promiseFun: (key: K) => Promise<T>): Promise<T[]>;
export declare function ls(path: string): Promise<string[]>;
export declare function cat(path: string): Promise<string>;
declare const _default: {
    repeat: typeof repeat;
    delay: typeof delay;
    delayAfter: typeof delayAfter;
    delayBefore: typeof delayBefore;
    sequence: typeof sequence;
    keySequence: typeof keySequence;
    ls: typeof ls;
    cat: typeof cat;
};
export default _default;
