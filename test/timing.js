var test = require('tape')
var createMutex = require('../')

test('check timing', function(t) {
	t.plan(6)
	var mutex = createMutex()
	var start = new Date().getTime()
	
	function approx(ms, prefix) {
		var elapsed = new Date().getTime() - start
		var max = ms + 20
		var msg = (prefix || '') + ' ' + ms + ' <= (' + elapsed + ') < ' + max
		t.ok(ms <= elapsed && elapsed < max, msg)
	}

	mutex.writeLock(function(release) {
		approx(0, 'first write')
		setTimeout(release, 500)
	})

	mutex.readLock(function(release) {
		approx(500, 'read after write')
		setTimeout(release, 300)
	})

	mutex.readLock(function(release) {
		approx(500, 'consecutive read')
		setTimeout(release, 200)
	})

	mutex.writeLock(function(release) {
		approx(800, 'mid write')
		release()
	})

	mutex.readLock(function(release) {
		approx(500, 'late read')
		setTimeout(release, 100)

		mutex.writeLock(function(release) {
			approx(800, 'last write')
			release()
			t.end()
		})
	})
})
