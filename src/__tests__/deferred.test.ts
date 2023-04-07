import { deferred } from '../deferred';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test('Resolve deferred', async () => {
    const spy = jest.fn();

    const { promise, resolve } = deferred();

    promise.then(spy);

    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();

    resolve(42);

    await Promise.resolve();

    expect(spy).toHaveBeenCalledWith(42);
});

test('Reject deferred', async () => {
    const spy = jest.fn();

    const { promise, reject } = deferred();

    promise.catch(spy);

    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();

    reject('foobar');

    await Promise.resolve();

    expect(spy).toHaveBeenCalledWith('foobar');
});
