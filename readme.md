# read-write-lock

[![Build Status](https://travis-ci.org/TehShrike/read-write-lock.svg)](https://travis-ci.org/TehShrike/read-write-lock)

- a write lock prevents all other writes or reads
- a read lock only prevents writes

Based on [mutexify](https://github.com/mafintosh/mutexify)!

## Algorithm

Write lock requests get put on the queue and handed out in order.

Read lock requests get put on the queue too - but when one read lock is given, all read requests in the queue go at once - once they all come back, it's on to the next lock request in the queue.

## Usage

```js
var createMutex = require('read-write-lock')

var mutex = createMutex()

mutex.writeLock(function(release) {
	// lol I've got a write lock which means that nobody else can do anything

	setTimeout(release, 200)
})

mutex.readLock(function(release) {
	// I've got a read lock at the same time as the function below!
	setTimeout(release, 100)
})

mutex.readLock(function(release) {
	// I've got a read lock at the same time as the function above!
	setTimeout(release, 200)
})
```

## License

[WTFPL](http://wtfpl2.com)
