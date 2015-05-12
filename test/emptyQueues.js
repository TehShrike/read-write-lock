var test = require('tape')
var createMutex = require('../')

// Regression test for #1

test('empty queues are ok - readLock', function (t) {
	setTimeout(t.end.bind(t), 5)
	createMutex().readLock(function (release) { release() })
})

test('empty queues are ok - writeLock', function (t) {
	setTimeout(t.end.bind(t), 5)
	createMutex().writeLock(function (release) { release() })
})
