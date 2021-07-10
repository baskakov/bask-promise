export declare function repeat<T>(promiseFun: () => Promise<T>, times: number | undefined, logger: (error: Error) => void): Promise<T>;
export declare function delay(milliseconds?: number): Promise<void>;
export declare function delayBefore<T>(promiseFun: () => Promise<T>, milliseconds?: number): Promise<T>;
export declare function delayAfter<T>(promiseFun: () => Promise<T>, milliseconds?: number): Promise<T>;
export declare function sequence<T>(promiseFuns: (() => Promise<T>)[]): Promise<T[]>;
export declare function keySequence<K, T>(array: K[], promiseFun: (key: K) => Promise<T>): Promise<T[]>;
declare const _default: {
    repeat: typeof repeat;
    delay: typeof delay;
    delayAfter: typeof delayAfter;
    delayBefore: typeof delayBefore;
    sequence: typeof sequence;
    keySequence: typeof keySequence;
};
export default _default;
