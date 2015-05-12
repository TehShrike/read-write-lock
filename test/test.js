var test = require('tape')
var createMutex = require('../')

test('first basic test that occurs to me', function(t) {
	var mutex = createMutex()

	var writes = 0
	var readsStarted = 0
	var readsFinished = 0

	function finishRead(release, interval) {
		setTimeout(function() {
			readsFinished++
			release()
		}, interval)
	}

	mutex.writeLock(function(release) {
		writes++
		setTimeout(function() {
			t.equal(readsStarted, 0, 'no reads started yet')
			release()
		}, 500)
	})

	mutex.readLock(function(release) {
		t.equal(writes, 1, 'one write lock so far')
		t.equal(readsStarted, 0, 'no reads started yet')
		readsStarted++
		finishRead(release, 300)
	})

	mutex.readLock(function(release) {
		t.equal(writes, 1, 'one write lock so far')
		t.equal(readsStarted, 1, 'one read started before now')
		readsStarted++
		finishRead(release, 200)
	})

	mutex.writeLock(function(release) {
		t.equal(writes, 1, 'one write lock so far')
		writes++
		t.equal(readsFinished, 3, 'three read locks finished so far')
		release()
	})

	mutex.readLock(function(release) {
		t.equal(writes, 1, 'one write lock so far')
		t.equal(readsStarted, 2, 'two reads started already')
		readsStarted++
		finishRead(release, 100)

		mutex.writeLock(function(release) {
			t.equal(writes, 2, 'two writes so far')
			t.equal(readsFinished, 3, 'three read locks finished')
			release()
			t.end()
		})
	})

})

test('empty queues are ok - readLock', function (t) {
	setTimeout(t.end.bind(t), 5)
	createMutex().readLock(function (release) { release() })
})

test('empty queues are ok - writeLock', function (t) {
	setTimeout(t.end.bind(t), 5)
	createMutex().writeLock(function (release) { release() })
})
