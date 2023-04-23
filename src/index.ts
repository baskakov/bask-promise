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

export function delayBefore<T>(promiseFun: () => Promise<T>, milliseconds: number): Promise<T> {
    return delay(milliseconds).then(promiseFun);
}

export async function delayAfter<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
    const result = await promise;
    await delay(milliseconds);
    return result;
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
    delay,
    delayAfter,
    delayBefore,
    sequence,
    keySequence,
    deferred,
    random,
    randomBefore,
    randomAfter,
};
