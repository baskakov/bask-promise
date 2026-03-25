# BASK Promise

Set of common promise utilities, not available in basic node.js features
* Delay promise
* Delay before or after promise
* Run promises in sequence, e.g. requests to database
* Repeated failed promises

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

## Promise resolve from outside

If you need to create a promise instance, pass it somewhere, and resolve it later from outside, 
you can use `deferred` function

```js
import { deferred } from 'bask-promise';
const promise = deferred();

//use or pass promise somewhere
promise.then(() => null).catch(() => null);

//then resolve promise
promise.resolve(42);
//or
promise.reject(new Error("foo"));
```
