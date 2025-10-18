import controller, { delay } from '../index';

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

test('repeat', async () => {
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
