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

test('isPending is true initially and false after resolve', async () => {
    const d = deferred();
    expect(d.isPending).toBe(true);
    expect(d.isResolved).toBe(false);
    expect(d.isFailed).toBe(false);

    d.resolve(1);

    expect(d.isPending).toBe(false);
    expect(d.isResolved).toBe(true);
    expect(d.isFailed).toBe(false);
});

test('isPending is true initially and false after reject', async () => {
    const d = deferred();
    d.promise.catch(() => {});
    expect(d.isPending).toBe(true);

    d.reject(new Error('fail'));

    expect(d.isPending).toBe(false);
    expect(d.isResolved).toBe(false);
    expect(d.isFailed).toBe(true);
});

test('value is undefined before resolution and holds the value after', async () => {
    const d = deferred<number>();
    expect(d.value).toBeUndefined();

    d.resolve(42);
    await Promise.resolve();

    expect(d.value).toBe(42);
});

test('error is undefined before rejection and holds the error after', async () => {
    const d = deferred<number>();
    d.promise.catch(() => {});
    expect(d.error).toBeUndefined();

    const err = new Error('boom');
    d.reject(err);

    expect(d.error).toBe(err);
});
