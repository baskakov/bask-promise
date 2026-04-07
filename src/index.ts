import { deferred } from './deferred';

export type RepeatJitter = 'full' | 'equal' | false;

function applyJitter(ms: number, jitter: RepeatJitter): number {
    if (jitter === 'full') return Math.random() * ms;
    if (jitter === 'equal') return ms / 2 + Math.random() * (ms / 2);
    return ms;
}

export interface RepeatOptions<T> {
    promiseFun: () => Promise<T>;
    times?: number;
    onError?: (error: Error) => void;
    shouldRetry?: (error: Error, attempt: number) => boolean;
    backoff?: (attempt: number) => number;
    jitter?: RepeatJitter;
    signal?: AbortSignal;
}

export function repeat<T>(options: RepeatOptions<T>): Promise<T>;
export function repeat<T>(promiseFun: () => Promise<T>, times?: number, onError?: (error: Error) => void): Promise<T>;
export function repeat<T>(
    optionsOrFun: RepeatOptions<T> | (() => Promise<T>),
    times: number = 1,
    onError?: (error: Error) => void,
): Promise<T> {
    let promiseFun: () => Promise<T>;
    let shouldRetry: RepeatOptions<T>['shouldRetry'];
    let backoff: RepeatOptions<T>['backoff'];
    let jitter: RepeatJitter = false;
    let signal: AbortSignal | undefined;
    if (typeof optionsOrFun === 'function') {
        promiseFun = optionsOrFun;
    } else {
        promiseFun = optionsOrFun.promiseFun;
        times = optionsOrFun.times ?? 1;
        onError = optionsOrFun.onError;
        shouldRetry = optionsOrFun.shouldRetry;
        backoff = optionsOrFun.backoff;
        jitter = optionsOrFun.jitter ?? false;
        signal = optionsOrFun.signal;
    }

    let attempt = 0;
    const run = (): Promise<T> =>
        promiseFun().catch(async (error) => {
            const currentAttempt = attempt++;
            if (shouldRetry && !shouldRetry(error, currentAttempt)) throw error;
            if (onError) await onError(error);
            if (backoff) await delayAbortable(applyJitter(backoff(currentAttempt), jitter), signal);
            if (signal?.aborted) throw signal.reason;
            if (times === 0) throw error;
            else if (times < 0) return run();
            else {
                times--;
                return run();
            }
        });

    if (signal?.aborted) return Promise.reject(signal.reason);
    return run();
}

export function delay(milliseconds: number): Promise<void> {
    if (milliseconds > 0) return new Promise((resolve) => setTimeout(resolve, milliseconds));
    else return Promise.resolve();
}

function delayAbortable(milliseconds: number, signal?: AbortSignal): Promise<void> {
    if (!signal) return delay(milliseconds);
    if (signal.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, milliseconds);
        signal.addEventListener(
            'abort',
            () => {
                clearTimeout(timeoutId);
                reject(signal.reason);
            },
            { once: true },
        );
    });
}

export function exponential(baseDelay: number = 1000, maxDelay: number = 30_000): (attempt: number) => number {
    return (attempt) => Math.min(baseDelay * 2 ** attempt, maxDelay);
}

export interface RepeatExponentialOptions<T> {
    promiseFun: () => Promise<T>;
    times?: number;
    baseDelay?: number;
    onError?: (error: Error) => void;
}

export function repeatExponential<T>({
    promiseFun,
    times = 10,
    baseDelay = 100,
    onError,
}: RepeatExponentialOptions<T>): Promise<T> {
    let attempt = 0;
    const withDelay = () => delay(baseDelay * Math.pow(2, attempt++)).then(promiseFun);
    return repeat(withDelay, times, onError);
}

export function delayBefore<T>(promiseFun: () => Promise<T>, milliseconds: number): Promise<T> {
    return delay(milliseconds).then(promiseFun);
}

export async function delayAfter<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
    const result = await promise;
    await delay(milliseconds);
    return result;
}

export function delayThrow(milliseconds: number): (e: unknown) => Promise<never> {
    return (e) => delay(milliseconds).then(() => Promise.reject(e));
}

export async function delayTill<T>(promise: Promise<T>, milliseconds: number, delayError: boolean = false): Promise<T> {
    return Promise.all([delayError ? promise.catch(delayThrow(milliseconds)) : promise, delay(milliseconds)]).then(
        ([result]) => result,
    );
}

export function delayFun<T>(milliseconds: number): (argument: T) => Promise<T> {
    return (x: T) => delay(milliseconds).then(() => x);
}

export async function sequence<T>(promiseFuns: (() => Promise<T>)[]): Promise<T[]> {
    return promiseFuns.reduce(
        (acc, promiseFun) => acc.then((result) => promiseFun().then((y) => result.concat([y]))),
        Promise.resolve([] as T[]),
    );
}

export function keySequence<K, T>(array: K[], promiseFun: (key: K) => Promise<T>): Promise<T[]> {
    return sequence(array.map((key) => () => promiseFun(key)));
}

export function concurrent<T>(concurrency: number, promiseFuns: (() => Promise<T>)[]): Promise<T[]> {
    if (concurrency <= 1) return sequence(promiseFuns);
    if (concurrency >= promiseFuns.length) return Promise.all(promiseFuns.map((fun) => fun()));

    return Promise.all(
        Array.from(new Array(concurrency), (_, i) => sequence(promiseFuns.filter((x, j) => j % concurrency === i))),
    ).then((arrayOfArrays) =>
        Array.from(
            new Array(promiseFuns.length),
            (_, i) => arrayOfArrays[i % concurrency][(i - (i % concurrency)) / concurrency],
        ),
    );
}

function randomTime(millisecondsTo: number, millisecondsFrom: number = 0): number {
    return millisecondsFrom + (millisecondsTo - millisecondsFrom) * Math.random();
}

/**
 * Random time period delay
 * @param millisecondsTo - upper bound
 * @param [millisecondsFrom=0] - lower bound
 */
export function random(millisecondsTo: number, millisecondsFrom: number = 0): Promise<void> {
    return delay(randomTime(millisecondsTo, millisecondsFrom));
}

export function randomBefore<T>(
    promiseFun: () => Promise<T>,
    millisecondsTo: number,
    millisecondsFrom: number = 0,
): Promise<T> {
    return delayBefore(promiseFun, randomTime(millisecondsTo, millisecondsFrom));
}

export async function randomAfter<T>(
    promise: Promise<T>,
    millisecondsTo: number,
    millisecondsFrom: number = 0,
): Promise<T> {
    return delayAfter(promise, randomTime(millisecondsTo, millisecondsFrom));
}

export function left<T>(primary: Promise<T>, guard: Promise<unknown>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        primary.then(resolve, reject);
        guard.catch(reject);
    });
}

export async function timer(
    milliseconds: number,
    message: string = `Timeout exceeded: ${milliseconds}ms`,
): Promise<never> {
    await delay(milliseconds);
    throw new Error(message);
}

export function timeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
    return left(promise, timer(milliseconds));
}

export default {
    repeat,
    repeatExponential,
    exponential,
    delay,
    delayAfter,
    delayBefore,
    delayTill,
    delayThrow,
    delayFun,
    sequence,
    keySequence,
    deferred,
    random,
    randomBefore,
    randomAfter,
    concurrent,
    timeout,
    timer,
    left,
};
