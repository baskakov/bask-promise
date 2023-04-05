import controller, { delay } from '../index';

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

beforeEach(() => {
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});

test('delay', async () => {
    const spy = jest.fn();
    controller.delay(100).then(spy);

    jest.advanceTimersByTime(20);
    await Promise.resolve();
    expect(spy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(120);
    await Promise.resolve();
    expect(spy).toHaveBeenCalled();
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

test('ls', async () => {
    const result1 = await controller.ls('./');
    const result2 = await controller.ls('./test');

    expect(result1.length).toBeGreaterThan(0);
    expect(result2.length).toEqual(0)
})

test('cat', async () => {
    const result1 = await controller.cat('./README.md');
    const result2 = await controller.cat('./test.ts');

    expect(result1).not.toEqual('');
    expect(result2).toEqual('')
})
