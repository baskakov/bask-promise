import controller, {
    delay,
    repeatExponential,
    timeout,
    left,
    timer,
    delayTill,
    delayThrow,
    exponential,
} from '../index';

function waitPromisesFinish() {
    return new Promise(jest.requireActual('timers').setImmediate);
}

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test('sequence', () => {
    return controller
        .sequence([() => Promise.resolve(1), () => Promise.resolve(2)])
        .then((result) => expect(result).toStrictEqual([1, 2]));
});

describe('concurrent', () => {
    it('run with concurrency', async () => {
        const startSpy: number[] = [];
        const finishSpy: number[] = [];
        const spy = jest.fn();

        const deferred = [controller.deferred(), controller.deferred(), controller.deferred(), controller.deferred()];
        const promises = deferred.map((x) => x.promise);

        controller
            .concurrent<number>(
                2,
                promises.map((p, i) => async () => {
                    startSpy.push(i);
                    await promises[i];
                    finishSpy.push(i);
                    return i;
                }),
            )
            .then(spy);

        deferred[1].resolve(1);
        expect(spy).not.toHaveBeenCalled();
        await waitPromisesFinish();
        deferred[0].resolve(0);
        deferred[3].resolve(3);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        deferred[2].resolve(2);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();

        expect(spy).toHaveBeenCalledWith([0, 1, 2, 3]);
        expect(startSpy).toStrictEqual([0, 1, 3, 2]);
        expect(finishSpy).toStrictEqual([1, 0, 3, 2]);
    });

    it('run with first is the longest', async () => {
        const startSpy: number[] = [];
        const finishSpy: number[] = [];
        const spy = jest.fn();

        const deferred = [controller.deferred(), controller.deferred(), controller.deferred(), controller.deferred()];
        const promises = deferred.map((x) => x.promise);

        controller
            .concurrent<number>(
                2,
                promises.map((p, i) => async () => {
                    startSpy.push(i);
                    await promises[i];
                    finishSpy.push(i);
                    return i;
                }),
            )
            .then(spy);

        deferred[1].resolve(1);
        expect(spy).not.toHaveBeenCalled();
        await waitPromisesFinish();
        deferred[3].resolve(0);
        deferred[0].resolve(3);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        deferred[2].resolve(2);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();

        expect(spy).toHaveBeenCalledWith([0, 1, 2, 3]);
        expect(startSpy).toStrictEqual([0, 1, 3, 2]);
        expect(finishSpy).toStrictEqual([1, 3, 0, 2]);
    });

    it('run with single thread', async () => {
        const startSpy: number[] = [];
        const finishSpy: number[] = [];
        const spy = jest.fn();

        const deferred = [controller.deferred(), controller.deferred(), controller.deferred(), controller.deferred()];
        const promises = deferred.map((x) => x.promise);

        controller
            .concurrent<number>(
                1,
                promises.map((p, i) => async () => {
                    startSpy.push(i);
                    await promises[i];
                    finishSpy.push(i);
                    return i;
                }),
            )
            .then(spy);

        deferred[0].resolve(0);
        expect(spy).not.toHaveBeenCalled();
        await waitPromisesFinish();
        deferred[1].resolve(1);
        deferred[2].resolve(2);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        deferred[3].resolve(3);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();

        expect(spy).toHaveBeenCalledWith([0, 1, 2, 3]);
        expect(startSpy).toStrictEqual([0, 1, 2, 3]);
        expect(finishSpy).toStrictEqual([0, 1, 2, 3]);
    });

    it('run with single thread 2', async () => {
        const startSpy: number[] = [];
        const finishSpy: number[] = [];
        const spy = jest.fn();

        const deferred = [controller.deferred(), controller.deferred(), controller.deferred(), controller.deferred()];
        const promises = deferred.map((x) => x.promise);

        controller
            .concurrent<number>(
                1,
                promises.map((p, i) => async () => {
                    startSpy.push(i);
                    await promises[i];
                    finishSpy.push(i);
                    return i;
                }),
            )
            .then(spy);

        deferred[3].resolve(3);
        expect(spy).not.toHaveBeenCalled();
        await waitPromisesFinish();
        deferred[2].resolve(2);
        deferred[1].resolve(1);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        deferred[0].resolve(0);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();

        expect(spy).toHaveBeenCalledWith([0, 1, 2, 3]);
        expect(startSpy).toStrictEqual([0, 1, 2, 3]);
        expect(finishSpy).toStrictEqual([0, 1, 2, 3]);
    });

    it('run with max threads', async () => {
        const startSpy: number[] = [];
        const finishSpy: number[] = [];
        const spy = jest.fn();

        const deferred = [controller.deferred(), controller.deferred(), controller.deferred(), controller.deferred()];
        const promises = deferred.map((x) => x.promise);

        controller
            .concurrent<number>(
                4,
                promises.map((p, i) => async () => {
                    startSpy.push(i);
                    await promises[i];
                    finishSpy.push(i);
                    return i;
                }),
            )
            .then(spy);

        deferred[3].resolve(3);
        expect(spy).not.toHaveBeenCalled();
        await waitPromisesFinish();
        deferred[2].resolve(2);
        deferred[1].resolve(1);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        deferred[0].resolve(0);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();

        expect(spy).toHaveBeenCalledWith([0, 1, 2, 3]);
        expect(startSpy).toStrictEqual([0, 1, 2, 3]);
        expect(finishSpy).toStrictEqual([3, 2, 1, 0]);
    });
});

test('keySequence', () => {
    return controller
        .keySequence([1, 2], (key) => Promise.resolve(key * 10))
        .then((result) => expect(result).toStrictEqual([10, 20]));
});

describe('delay', () => {
    it('delay with specific time', async () => {
        const spy = jest.fn();
        controller.delay(50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
    });

    it('delay after promise', async () => {
        const spy = jest.fn();
        controller.delayAfter(Promise.resolve(42), 50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(42);
    });

    it('delayTill resolves no earlier than the given milliseconds even if promise resolves faster', async () => {
        const spy = jest.fn();
        delayTill(Promise.resolve(42), 1000).then(spy);

        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(999);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(42);
    });

    it('delayTill resolves as soon as the promise resolves when it takes longer than milliseconds', async () => {
        const spy = jest.fn();
        const d = controller.deferred<number>();
        delayTill(d.promise, 100).then(spy);

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        d.resolve(99);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(99);
    });

    it('delayTill rejects if the promise rejects', async () => {
        const error = new Error('fail');
        const resultPromise = delayTill(Promise.reject(error), 1000);
        await expect(resultPromise).rejects.toThrow('fail');
    });

    it('delayTill with delayError=true delays rejection until milliseconds have passed', async () => {
        const spy = jest.fn();
        const error = new Error('fail');
        delayTill(Promise.reject(error), 1000, true).catch(spy);

        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(999);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(error);
    });

    it('delayTill with delayError=false rejects immediately without waiting', async () => {
        const spy = jest.fn();
        const error = new Error('fail');
        delayTill(Promise.reject(error), 1000, false).catch(spy);

        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(error);
    });
});

describe('delayThrow', () => {
    it('returns a function that rejects with the original error after the given delay', async () => {
        const spy = jest.fn();
        const error = new Error('boom');
        Promise.reject(error).catch(delayThrow(1000)).catch(spy);

        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(error);
    });

    it('preserves the original error value', async () => {
        const spy = jest.fn();
        const error = new Error('original');
        Promise.reject(error).catch(delayThrow(100)).catch(spy);

        await waitPromisesFinish();
        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(error);
    });

    it('is accessible via the default export', async () => {
        const spy = jest.fn();
        const error = new Error('test');
        Promise.reject(error).catch(controller.delayThrow(500)).catch(spy);

        await waitPromisesFinish();
        jest.advanceTimersByTime(500);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalledWith(error);
    });
});

describe('delay (before/fun)', () => {
    it('delay before promise fun', async () => {
        const spy = jest.fn();
        const beforeFun = jest.fn(() => Promise.resolve(42));
        controller.delayBefore(beforeFun, 50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        expect(beforeFun).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(beforeFun).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(42);
    });

    it('delay as a callback', async () => {
        const spy = jest.fn();

        Promise.resolve(42).then(controller.delayFun(50)).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(42);
    });
});

describe('repeat', () => {
    it('retries until success with positional arguments (legacy)', async () => {
        let count = 0;
        const spy = jest.fn();
        async function tester() {
            spy();
            if (count === 3) return 42;
            else {
                count += 1;
                throw new Error('fail');
            }
        }
        const result = await controller.repeat(tester, 3);
        expect(spy).toHaveBeenCalledTimes(4);
        expect(result).toBe(42);
    });

    it('retries until success with options object', async () => {
        let count = 0;
        const spy = jest.fn();
        async function tester() {
            spy();
            if (count === 3) return 42;
            else {
                count += 1;
                throw new Error('fail');
            }
        }
        const result = await controller.repeat({ promiseFun: tester, times: 3 });
        expect(spy).toHaveBeenCalledTimes(4);
        expect(result).toBe(42);
    });

    it('calls onError on each failure when using options object', async () => {
        const error = new Error('fail');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 2) throw error;
            return 99;
        });
        const onError = jest.fn();

        const result = await controller.repeat({ promiseFun, times: 5, onError });
        expect(onError).toHaveBeenCalledTimes(2);
        expect(onError).toHaveBeenCalledWith(error);
        expect(result).toBe(99);
    });

    it('rejects after exhausting all retries when using options object', async () => {
        const error = new Error('always fails');
        const promiseFun = jest.fn(() => Promise.reject(error));

        await expect(controller.repeat({ promiseFun, times: 2 })).rejects.toThrow('always fails');
        expect(promiseFun).toHaveBeenCalledTimes(3);
    });

    it('defaults to times=1 when not provided in options object', async () => {
        const error = new Error('fail');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 1) throw error;
            return 7;
        });

        const result = await controller.repeat({ promiseFun });
        expect(promiseFun).toHaveBeenCalledTimes(2);
        expect(result).toBe(7);
    });

    it('retries only when shouldRetry returns true', async () => {
        const retryable = new Error('retryable');
        const fatal = new Error('fatal');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ === 0) throw retryable;
            throw fatal;
        });
        const shouldRetry = jest.fn((error: Error) => error === retryable);

        await expect(controller.repeat({ promiseFun, times: 5, shouldRetry })).rejects.toThrow('fatal');
        expect(promiseFun).toHaveBeenCalledTimes(2);
        expect(shouldRetry).toHaveBeenCalledTimes(2);
        expect(shouldRetry).toHaveBeenNthCalledWith(1, retryable, 0);
        expect(shouldRetry).toHaveBeenNthCalledWith(2, fatal, 1);
    });

    it('rejects immediately without retrying when shouldRetry returns false on first error', async () => {
        const error = new Error('no retry');
        const promiseFun = jest.fn(() => Promise.reject(error));
        const shouldRetry = jest.fn(() => false);

        await expect(controller.repeat({ promiseFun, times: 5, shouldRetry })).rejects.toThrow('no retry');
        expect(promiseFun).toHaveBeenCalledTimes(1);
    });

    it('passes incrementing attempt number to shouldRetry', async () => {
        const error = new Error('fail');
        const attempts: number[] = [];
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 3) throw error;
            return 'done';
        });
        const shouldRetry = jest.fn((e: Error, attempt: number) => {
            attempts.push(attempt);
            return true;
        });

        await controller.repeat({ promiseFun, times: 5, shouldRetry });
        expect(attempts).toStrictEqual([0, 1, 2]);
    });

    it('waits for backoff delay between retries', async () => {
        const error = new Error('fail');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 2) throw error;
            return 'done';
        });
        const backoff = jest.fn((attempt: number) => 100 * (attempt + 1)); // 100ms, 200ms
        const spy = jest.fn();

        controller.repeat({ promiseFun, times: 5, backoff }).then(spy);

        // no backoff yet — first call fails immediately
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(1);
        expect(spy).not.toHaveBeenCalled();

        // advance past first backoff delay (100ms)
        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(2);
        expect(spy).not.toHaveBeenCalled();

        // advance past second backoff delay (200ms)
        jest.advanceTimersByTime(200);
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(3);
        expect(spy).toHaveBeenCalledWith('done');

        expect(backoff).toHaveBeenCalledTimes(2);
        expect(backoff).toHaveBeenNthCalledWith(1, 0);
        expect(backoff).toHaveBeenNthCalledWith(2, 1);
    });

    it('backoff does not fire when shouldRetry rejects the error', async () => {
        const error = new Error('fatal');
        const promiseFun = jest.fn(() => Promise.reject(error));
        const backoff = jest.fn(() => 1000);
        const shouldRetry = jest.fn(() => false);

        await expect(controller.repeat({ promiseFun, times: 5, backoff, shouldRetry })).rejects.toThrow('fatal');
        expect(backoff).not.toHaveBeenCalled();
    });

    it('supports exponential backoff pattern', async () => {
        const error = new Error('fail');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 3) throw error;
            return 'ok';
        });
        const spy = jest.fn();

        controller
            .repeat({
                promiseFun,
                times: 5,
                backoff: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
            })
            .then(spy);

        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000); // attempt 0 → 1000ms
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(2);

        jest.advanceTimersByTime(2000); // attempt 1 → 2000ms
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(3);

        jest.advanceTimersByTime(4000); // attempt 2 → 4000ms
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(4);
        expect(spy).toHaveBeenCalledWith('ok');
    });

    describe('exponential()', () => {
        it('doubles the delay with each attempt', () => {
            const backoff = exponential(1000);
            expect(backoff(0)).toBe(1000);
            expect(backoff(1)).toBe(2000);
            expect(backoff(2)).toBe(4000);
            expect(backoff(3)).toBe(8000);
        });

        it('caps the delay at maxDelay', () => {
            const backoff = exponential(1000, 5000);
            expect(backoff(0)).toBe(1000);
            expect(backoff(2)).toBe(4000);
            expect(backoff(3)).toBe(5000); // 8000 capped to 5000
            expect(backoff(10)).toBe(5000);
        });

        it('uses defaults: baseDelay=1000, maxDelay=30000', () => {
            const backoff = exponential();
            expect(backoff(0)).toBe(1000);
            expect(backoff(4)).toBe(16000);
            expect(backoff(5)).toBe(30000); // 32000 capped to 30000
        });

        it('works as a backoff in repeat()', async () => {
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 2) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller.repeat({ promiseFun, times: 5, backoff: exponential(500, 10_000) }).then(spy);

            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(500); // attempt 0 → 500ms
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(2);

            jest.advanceTimersByTime(1000); // attempt 1 → 1000ms
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(3);
            expect(spy).toHaveBeenCalledWith('ok');
        });

        it('is accessible via the default export', () => {
            const backoff = controller.exponential(200, 3000);
            expect(backoff(0)).toBe(200);
            expect(backoff(4)).toBe(3000); // 3200 capped
        });
    });

    describe('jitter', () => {
        afterEach(() => {
            jest.spyOn(Math, 'random').mockRestore();
        });

        it('full jitter: delays between 0 and the full backoff value', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            // backoff(0) = 1000, full jitter with random=0.5 → delay = 0.5 * 1000 = 500ms
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 1) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller.repeat({ promiseFun, times: 3, backoff: () => 1000, jitter: 'full' }).then(spy);

            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(1);
            expect(spy).not.toHaveBeenCalled();

            // full backoff (1000ms) without jitter should NOT resolve yet
            jest.advanceTimersByTime(499);
            await waitPromisesFinish();
            expect(spy).not.toHaveBeenCalled();

            // advance to 500ms — jittered delay elapses
            jest.advanceTimersByTime(1);
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith('ok');
        });

        it('full jitter: delays 0ms when random returns 0', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 1) throw error;
                return 'ok';
            });

            // random=0 → delay = 0 * 1000 = 0ms, so next retry fires immediately
            const result = await controller.repeat({ promiseFun, times: 3, backoff: () => 1000, jitter: 'full' });
            expect(result).toBe('ok');
            expect(promiseFun).toHaveBeenCalledTimes(2);
        });

        it('equal jitter: delays between backoff/2 and the full backoff value', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            // backoff(0) = 1000, equal jitter with random=0.5 → delay = 500 + 0.5 * 500 = 750ms
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 1) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller.repeat({ promiseFun, times: 3, backoff: () => 1000, jitter: 'equal' }).then(spy);

            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(749);
            await waitPromisesFinish();
            expect(spy).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1);
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith('ok');
        });

        it('equal jitter: minimum delay is always at least backoff/2', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            // backoff(0) = 1000, equal jitter with random=0 → delay = 500 + 0 * 500 = 500ms
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 1) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller.repeat({ promiseFun, times: 3, backoff: () => 1000, jitter: 'equal' }).then(spy);

            await waitPromisesFinish();
            jest.advanceTimersByTime(499);
            await waitPromisesFinish();
            expect(spy).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1);
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith('ok');
        });

        it('false jitter: uses exact backoff value with no randomness', async () => {
            const randomSpy = jest.spyOn(Math, 'random');
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 1) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller.repeat({ promiseFun, times: 3, backoff: () => 1000, jitter: false }).then(spy);

            await waitPromisesFinish();
            jest.advanceTimersByTime(999);
            await waitPromisesFinish();
            expect(spy).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1);
            await waitPromisesFinish();
            expect(spy).toHaveBeenCalledWith('ok');
            expect(randomSpy).not.toHaveBeenCalled();
        });
    });

    describe('signal', () => {
        it('rejects immediately if signal is already aborted before repeat starts', async () => {
            const abortController = new AbortController();
            abortController.abort(new Error('aborted early'));
            const promiseFun = jest.fn(() => Promise.reject(new Error('fail')));

            await expect(controller.repeat({ promiseFun, times: 5, signal: abortController.signal })).rejects.toThrow(
                'aborted early',
            );
            expect(promiseFun).not.toHaveBeenCalled();
        });

        it('aborts during backoff delay and rejects with abort reason', async () => {
            const abortController = new AbortController();
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 3) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller
                .repeat({
                    promiseFun,
                    times: 10,
                    backoff: () => 1000,
                    signal: abortController.signal,
                })
                .then(spy)
                .catch(spy);

            // first call fails, backoff delay starts
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(1);

            // abort while the backoff delay is in progress
            abortController.abort(new Error('cancelled'));

            await waitPromisesFinish();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0][0]).toMatchObject({ message: 'cancelled' });
            // promiseFun was not retried after abort
            expect(promiseFun).toHaveBeenCalledTimes(1);
        });

        it('aborts after backoff delay elapses but before next retry', async () => {
            const abortController = new AbortController();
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 3) throw error;
                return 'ok';
            });
            const spy = jest.fn();

            controller
                .repeat({
                    promiseFun,
                    times: 10,
                    backoff: () => 1000,
                    signal: abortController.signal,
                })
                .then(spy)
                .catch(spy);

            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(1);

            // let the backoff delay expire
            jest.advanceTimersByTime(1000);
            await waitPromisesFinish();
            expect(promiseFun).toHaveBeenCalledTimes(2);

            // abort while the second backoff delay is running
            abortController.abort(new Error('stop now'));
            await waitPromisesFinish();

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0][0]).toMatchObject({ message: 'stop now' });
            expect(promiseFun).toHaveBeenCalledTimes(2);
        });

        it('resolves normally when signal is never aborted', async () => {
            const abortController = new AbortController();
            const error = new Error('fail');
            let count = 0;
            const promiseFun = jest.fn(async () => {
                if (count++ < 2) throw error;
                return 'done';
            });

            const result = await controller.repeat({ promiseFun, times: 5, signal: abortController.signal });
            expect(result).toBe('done');
            expect(promiseFun).toHaveBeenCalledTimes(3);
        });
    });
});

describe('random', () => {
    it('delays with random value', async () => {
        const spy = jest.fn();
        controller.random(50).then(spy);

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
    });

    it('delays randomly with lower bound', async () => {
        const spy = jest.fn();
        controller.random(60, 50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
    });

    test('delays randomly after promise', async () => {
        const spy = jest.fn();
        controller.randomAfter(Promise.resolve(42), 60, 50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(42);
    });

    test('delays randomly before promise fun', async () => {
        const spy = jest.fn();
        const beforeFun = jest.fn(() => Promise.resolve(42));
        controller.randomBefore(beforeFun, 60, 50).then(spy);

        jest.advanceTimersByTime(10);
        await waitPromisesFinish();
        expect(spy).not.toHaveBeenCalled();
        expect(beforeFun).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(beforeFun).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(42);
    });
});

describe('repeatExponential', () => {
    it('resolves immediately when promiseFun succeeds on first try', async () => {
        const promiseFun = jest.fn(() => Promise.resolve(42));
        const resultPromise = repeatExponential({ promiseFun, baseDelay: 100 });

        // first call has 0ms delay (100 * 2^0 = 100, but attempt=0 so 100*1=100)
        jest.advanceTimersByTime(100);
        await waitPromisesFinish();

        expect(promiseFun).toHaveBeenCalledTimes(1);
        await expect(resultPromise).resolves.toBe(42);
    });

    it('retries with exponential delay and resolves on success', async () => {
        const spy = jest.fn();
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 2) throw new Error('fail');
            return 42;
        });

        repeatExponential({ promiseFun, times: 3, baseDelay: 100 }).then(spy);

        // attempt 0: delay = 100 * 2^0 = 100ms
        jest.advanceTimersByTime(100);
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(1);

        // attempt 1: delay = 100 * 2^1 = 200ms
        jest.advanceTimersByTime(200);
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(2);

        // attempt 2: delay = 100 * 2^2 = 400ms
        jest.advanceTimersByTime(400);
        await waitPromisesFinish();
        expect(promiseFun).toHaveBeenCalledTimes(3);

        expect(spy).toHaveBeenCalledWith(42);
    });

    it('rejects after exhausting all retries', async () => {
        const error = new Error('fail');
        const promiseFun = jest.fn(() => Promise.reject(error));

        const resultPromise = repeatExponential({ promiseFun, times: 2, baseDelay: 100 });
        resultPromise.catch(() => null); // prevent unhandled rejection

        await jest.runAllTimersAsync();

        expect(promiseFun).toHaveBeenCalledTimes(3);
        await expect(resultPromise).rejects.toThrow('fail');
    });

    it('calls onError on each failure', async () => {
        const error = new Error('fail');
        let count = 0;
        const promiseFun = jest.fn(async () => {
            if (count++ < 1) throw error;
            return 42;
        });
        const onError = jest.fn();

        const resultPromise = repeatExponential({ promiseFun, times: 2, baseDelay: 100, onError });

        await jest.runAllTimersAsync();

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
        await expect(resultPromise).resolves.toBe(42);
    });
});

describe('timeout', () => {
    it('resolves with the promise value when resolved before timeout', async () => {
        const resultPromise = timeout(Promise.resolve(42), 1000);
        jest.advanceTimersByTime(500);
        await expect(resultPromise).resolves.toBe(42);
    });

    it('rejects with a timeout error when promise does not resolve in time', async () => {
        const never = new Promise<number>(() => {});
        const resultPromise = timeout(never, 1000);
        jest.advanceTimersByTime(1000);
        await expect(resultPromise).rejects.toThrow('Timeout exceeded: 1000ms');
    });

    it('rejects with the original error when promise rejects before timeout', async () => {
        const error = new Error('original error');
        const resultPromise = timeout(Promise.reject(error), 1000);
        await expect(resultPromise).rejects.toThrow('original error');
    });

    it('is accessible via the default export', async () => {
        const resultPromise = controller.timeout(Promise.resolve('hello'), 1000);
        await expect(resultPromise).resolves.toBe('hello');
    });
});

describe('timer', () => {
    it('rejects with the default message after the given delay', async () => {
        const resultPromise = timer(1000);
        jest.advanceTimersByTime(1000);
        await expect(resultPromise).rejects.toThrow('Timeout exceeded: 1000ms');
    });

    it('rejects with a custom message when provided', async () => {
        const resultPromise = timer(500, 'custom timeout message');
        jest.advanceTimersByTime(500);
        await expect(resultPromise).rejects.toThrow('custom timeout message');
    });

    it('does not reject before the delay elapses', async () => {
        const spy = jest.fn();
        timer(1000).catch(spy);
        jest.advanceTimersByTime(999);
        await Promise.resolve();
        expect(spy).not.toHaveBeenCalled();
    });

    it('is accessible via the default export', async () => {
        const resultPromise = controller.timer(1000);
        jest.advanceTimersByTime(1000);
        await expect(resultPromise).rejects.toThrow('Timeout exceeded: 1000ms');
    });
});

describe('left', () => {
    it('resolves with the value of the primary promise', async () => {
        await expect(left(Promise.resolve(42), Promise.resolve('ignored'))).resolves.toBe(42);
    });

    it('rejects when the primary promise rejects', async () => {
        const error = new Error('primary error');
        await expect(left(Promise.reject(error), Promise.resolve('ignored'))).rejects.toThrow('primary error');
    });

    it('rejects when the guard promise rejects', async () => {
        const error = new Error('guard error');
        const never = new Promise<number>(() => {});
        await expect(left(never, Promise.reject(error))).rejects.toThrow('guard error');
    });

    it('resolves with the primary value even if the guard resolves later', async () => {
        const { promise: guardPromise, resolve: resolveGuard } = controller.deferred<void>();
        const resultPromise = left(Promise.resolve(99), guardPromise);
        resolveGuard(undefined);
        await expect(resultPromise).resolves.toBe(99);
    });

    it('is accessible via the default export', async () => {
        await expect(controller.left(Promise.resolve('ok'), Promise.resolve(undefined))).resolves.toBe('ok');
    });
});
