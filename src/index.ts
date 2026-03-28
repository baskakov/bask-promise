import { deferred } from './deferred';

export function repeat<T>(
    promiseFun: () => Promise<T>,
    times: number = 1,
    onError?: (error: Error) => void,
): Promise<T> {
    return promiseFun().catch(async (error) => {
        if (onError) await onError(error);
        if (times === 0) throw error;
        else if (times < 0) return repeat(promiseFun, times, onError);
        else return repeat(promiseFun, times - 1, onError);
    });
}

export function delay(milliseconds: number): Promise<void> {
    if (milliseconds > 0) return new Promise((resolve) => setTimeout(resolve, milliseconds));
    else return Promise.resolve();
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

export default {
    repeat,
    repeatExponential,
    delay,
    delayAfter,
    delayBefore,
    delayFun,
    sequence,
    keySequence,
    deferred,
    random,
    randomBefore,
    randomAfter,
    concurrent,
};
