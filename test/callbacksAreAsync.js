var test = require('tape')
var createMutex = require('../')

// Regression test for #3

test('callbacks are async - readLock', function (t) {
	t.plan(3)
	var n = 0

	t.equal(++n, 1, 'first: ' + n)
	createMutex().readLock(function (release) {
		release()
		t.equal(++n, 3, 'third: ' + n)
	})
	t.equal(++n, 2, 'second: ' + n)

	setTimeout(t.end.bind(t), 50)
})

test('callbacks are async - writeLock', function (t) {
	t.plan(3)
	var n = 0

	t.equal(++n, 1, 'first: ' + n)
	createMutex().writeLock(function (release) {
		release()
		t.equal(++n, 3, 'third: ' + n)
	})
	t.equal(++n, 2, 'second: ' + n)

	setTimeout(t.end.bind(t), 50)
})
