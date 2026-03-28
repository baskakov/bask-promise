# BASK Promise

Set of common promise utilities, not available in basic node.js features
* Delay promise
* Delay before or after promise
* Wait until a minimum time has elapsed
* Delay a rejection
* Run promises in sequence, e.g. requests to database
* Repeated failed promises
* Repeated failed promises with exponential backoff
* Timeout a promise
* Race a promise against a guard promise
* Deferred promise with state inspection

## Install

```sh
npm i bask-promise --save
```

Then import module in code:

```js
import * as promises from 'bask-promise';
promises.delay(100);
```

Or
```js
import { delay } from 'bask-promise';
delay(100);
```


## Delay

Simple delay
```js
import { delay } from 'bask-promise';
delay(1000).then(() => console.log('Run after 1 second'));
```

Delay after promise
```js
import { delayAfter } from 'bask-promise';
delayAfter(Promise.resolve('1 second delay after'), 1000);
```

Delay before promise
```js
import { delayBefore } from 'bask-promise';
delayBefore(() => Promise.resolve('1 second delay before'), 1000);
```

## Random delay
Random time period delay
```js
import { random } from 'bask-promise';
random(1000).then(() => console.log('Run after 0...1 second'));
```

Specify lower bound
```js
import { random } from 'bask-promise';
random(2000, 1000).then(() => console.log('Run after 1...2 seconds'));
```

Random delay after promise
```js
import { randomAfter } from 'bask-promise';
randomAfter(Promise.resolve('0...1 second delay after'), 1000);
randomAfter(Promise.resolve('0...2 second delay after'), 2000, 1000);
```

Random delay before promise
```js
import { randomBefore } from 'bask-promise';
randomBefore(() => Promise.resolve('0...1 second delay before'), 1000);
randomBefore(() => Promise.resolve('1...2 second delay before'), 2000, 1000);
```

## Delay callback

If you want to use delay as a callback inside then, you can use `delayFun(ms)`
```js
import { delayFun } from 'bask-promise';
Promise.resolve("Delay for 1s in then after promise").then(delayFun(1000));
```

## Delay till

Waits until both the promise resolves **and** the minimum time has elapsed. Useful for avoiding UI flicker on fast operations — e.g. keeping a spinner visible for at least 500ms.

```js
import { delayTill } from 'bask-promise';

// Resolves after at least 5000ms, even if fetchData() finishes in 1000ms
delayTill(fetchData(), 5000);
```

If the promise takes longer than `milliseconds`, it resolves as soon as the promise does:
```js
// fetchData() takes 6000ms, milliseconds is 5000ms → resolves after 6000ms
delayTill(fetchData(), 5000);
```

By default, errors are propagated immediately. Set `delayError: true` to also delay rejection:
```js
// If fetchData() fails early, the rejection is still held until 5000ms have passed
delayTill(fetchData(), 5000, true);
```

## Delay throw

Returns a `.catch`-compatible callback that delays a rejection by the given number of milliseconds before re-throwing. Useful as a building block or as an inline callback.

```js
import { delayThrow } from 'bask-promise';

// Delays the rejection by 1 second before propagating it
fetchData().catch(delayThrow(1000));
```

Combined with `delayTill`:
```js
import { delayTill, delayThrow } from 'bask-promise';

// Equivalent to delayTill(fetchData(), 5000, true)
delayTill(fetchData().catch(delayThrow(5000)), 5000);
```

## Sequence

Node.js have basic Promise.all function to run promises in parallel, but to run sequence you have to implement it yourself. This is a typical task for example when quering database or external services.
```js
import { sequence } from 'bask-promise';
sequence([
        () => Promise.resolve('Query database 1'),
        () => Promise.resolve('Query database 2'),
    ])
```

If you have the same query function, but different arguments - use keySequence:

```js
import { keySequence } from 'bask-promise';
keySequence([1,2,3,4,5], key => queryDatabasePromise(key));
```

If you want to mix sequence and parallel mode and define concurrency number - use concurrent.
For concurrent <= 1 - this is sequence()
For concurrent >= array length - this is Promise.all()
```js
import { concurrent } from 'bask-promise';
concurrent(2, [
        () => Promise.resolve('Query database 1 (first thread)'),
        () => Promise.resolve('Query database 2 (second thread)'),
        () => Promise.resolve('Query database 3 (first thread)'),
        () => Promise.resolve('Query database 4 (second thread)')
    ])
```

## Repeat

Sometimes you need to ensure request that is properly executed. But due to network connections, 
requests can fail. In that case you may want to repeat failed requests automatically.

Repeat up to 3 times (4 calls total):
```js
import { repeat } from 'bask-promise';
repeat(() => repeatThisPromiseIfFails(), 3);
```

Repeat until success:
```js
repeat(() => repeatThisPromiseIfFails(), -1);
```

Log every error
```js
repeat(() => repeatThisPromiseIfFails(), 3, error => console.error(error));
```
Delay after error
```js
import { repeat, delay } from 'bask-promise';
repeat(() => repeatThisPromiseIfFails(), 3, error => delay(1000));
```

## Repeat with exponential backoff

Like `repeat`, but automatically adds an increasing delay between retries. The delay doubles after each failed attempt: `baseDelay * 2^attempt`.

Repeat up to 3 times with default 100ms base delay (delays: 100ms, 200ms, 400ms):
```js
import { repeatExponential } from 'bask-promise';
repeatExponential({ promiseFun: () => repeatThisIfFails(), times: 3 });
```

Custom base delay:
```js
repeatExponential({ promiseFun: () => repeatThisIfFails(), times: 5, baseDelay: 200 });
```

Repeat until success:
```js
repeatExponential({ promiseFun: () => repeatThisIfFails(), times: -1 });
```

Log every error:
```js
repeatExponential({
    promiseFun: () => repeatThisIfFails(),
    times: 3,
    onError: error => console.error(error),
});
```

## Promise resolve from outside

If you need to create a promise instance, pass it somewhere, and resolve it later from outside, 
you can use `deferred` function

```js
import { deferred } from 'bask-promise';
const d = deferred();

// use or pass promise somewhere
d.promise.then(() => null).catch(() => null);

// then resolve or reject from outside
d.resolve(42);
// or
d.reject(new Error('foo'));
```

### Inspecting deferred state

The deferred object exposes read-only properties to inspect its current state at any time:

| Property | Type | Description |
|---|---|---|
| `isPending` | `boolean` | `true` until resolved or rejected |
| `isResolved` | `boolean` | `true` after `resolve()` is called |
| `isFailed` | `boolean` | `true` after `reject()` is called |
| `value` | `T \| undefined` | The resolved value (available after the next microtask), `undefined` otherwise |
| `error` | `unknown \| undefined` | The rejection reason, `undefined` otherwise |

```js
import { deferred } from 'bask-promise';
const d = deferred();

d.isPending;   // true
d.isResolved;  // false
d.isFailed;    // false
d.value;       // undefined
d.error;       // undefined

d.resolve(42);

d.isPending;   // false
d.isResolved;  // true

await Promise.resolve(); // wait one microtask tick
d.value;       // 42
```

```js
const d = deferred();
d.reject(new Error('boom'));

d.isPending;   // false
d.isFailed;    // true
d.error;       // Error: boom
```

## Timer

Creates a promise that rejects after a given delay. Useful as a standalone building block or combined with `left`.

```js
import { timer } from 'bask-promise';

// Rejects with default message after 1 second
timer(1000);

// Rejects with a custom message
timer(1000, 'Operation took too long');
```

## Timeout

Races a promise against a timer. Rejects with a timeout error if the promise does not settle within the given milliseconds.

```js
import { timeout } from 'bask-promise';

// Rejects with "Timeout exceeded: 5000ms" if fetchData() takes longer than 5 seconds
timeout(fetchData(), 5000);
```

## Left

Races a promise against a guard promise. Resolves with the value of the primary promise, but rejects if the guard promise rejects — regardless of the primary promise state. The resolved value of the guard is ignored.

```js
import { left } from 'bask-promise';

// Resolves with the result of primary(), but aborts if guard rejects
left(primary(), guard());
```

A practical use case is combining `left` with `timer` to build a custom timeout with a specific error message:

```js
import { left, timer } from 'bask-promise';

left(fetchData(), timer(5000, 'fetchData timed out'));
```
