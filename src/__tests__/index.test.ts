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
