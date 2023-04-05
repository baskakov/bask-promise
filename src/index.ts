const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

export async function ls (path: string): Promise<string[]> {
    let response: string[] = [];

    if(path) {
        const { stdout } = await exec(`ls ${path}`).catch((e: { message: string | string[]; }) => {
            return {};
        });

        if(stdout) response = stdout.split('\n').filter((x: string) => x !== '');
    }

    return response;
}

export async function cat (path: string): Promise<string> {
    let response: string = '';

    if(path) {
        const { stdout } = await exec(`cat ${path}`).catch((e: { message: string | string[]; }) => {
            return {};
        });

        if(stdout) response = stdout;
    }

    return response;
}

export default {
    repeat,
    delay,
    delayAfter,
    delayBefore,
    sequence,
    keySequence,
    ls,
    cat
};
