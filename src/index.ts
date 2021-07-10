export function repeat<T>(promiseFun: () => Promise<T>, times: number = 1, logger: (error: Error) => void): Promise<T> {
    return promiseFun().catch((error) => {
        if(logger) logger(error);
        if (times === 0) throw error;
        else if (times < 0) return repeat(promiseFun, times, logger);
        else return repeat(promiseFun, times - 1, logger);
    });
}

export function delay(milliseconds: number = 0): Promise<void> {
    if (milliseconds > 0) return new Promise((resolve) => setTimeout(resolve, milliseconds));
    else return Promise.resolve();
}

export function delayBefore<T>(promiseFun: () => Promise<T>, milliseconds: number = 0): Promise<T> {
    return delay(milliseconds).then(promiseFun);
}

export function delayAfter<T>(promiseFun: () => Promise<T>, milliseconds: number = 0): Promise<T> {
    return promiseFun().then((x) => delay(milliseconds).then(() => x));
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

export default {
    repeat,
    delay,
    delayAfter,
    delayBefore,
    sequence,
    keySequence
}