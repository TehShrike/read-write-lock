var mutexify = require('mutexify')
var each = require('async-each')

module.exports = function createMutex() {
	var lock = mutexify()

	var readQueue = []

	function queueReadHandler() {
		lock(function readLockTiemz(release) {
			each(readQueue, function(fn, cb) {
				process.nextTick(function() {
					fn(cb)
				})
			}, release)
			readQueue = []
		})
	}

	function readLock(fn) {
		if (readQueue.length === 0) {
			queueReadHandler()
		}

		readQueue.push(fn)
	}

	function writeLock(fn) {
		lock(function(release) {
			process.nextTick(function() {
				fn(release)
			})
		})
	}

	return {
		writeLock: writeLock,
		readLock: readLock
	}
}
