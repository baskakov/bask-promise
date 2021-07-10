# BASK Promise

Set of common promise utilities, not available in basic node.js features
* Delay promise
* Delay before or after promise
* Run promises in sequence, e.g. requests to database
* Repeated failed promises

## Install

```sh
npm i bask-promises --save
```

Then import module in code:

```js
const promises = require('bask-promises');
promises.delay(100);
```

Or
```js
const {delay} = require('bask-promises');
delay(100);
```


## Delay

Simple delay
```js
const {delay} = require('bask-promises');
delay(1000).then(() => console.log('Run after 1 second'));
```

Delay after promise
```js
const {delayAfter} = require('bask-promises');
delayAfter(Promose.resolve('1 second delay after'), 1000);
```

Delay before promise
```js
const {delayBefore} = require('bask-promises');
delayBefore(() => Promose.resolve('1 second delay before'), 1000);
```

## Sequence

Node.js have basic Promise.all function to run promises in parallel, but to run sequence you have to implement it yourself. This is a typical task for example when quering database or external services.
```js
const {sequence} = require('bask-promises');
sequence([
        () => Promise.resolve('Query database 1'),
        () => Promise.resolve('Query database 2'),
    ])
```

If you have the same query function, but different arguments - use keySequence:

```js
const {keySequence} = require('bask-promises');
keySequence([1,2,3,4,5], key => queryDatabasePromise(key));
```

## Repeat

Sometimes you need to ensure request that is properly executed. But due to network connections, 
requests can fail. In that case you may want to repeat failed requests automatically.

Repeat up to 3 times (4 calls total):
```js
const {repeat} = require('bask-promises');
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