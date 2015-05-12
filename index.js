var mutexify = require('mutexify')
var each = require('async-each')

module.exports = function createMutex() {
	var lock = mutexify()

	var readQueue = null

	function queueReadHandler() {
		lock(function readLockTiemz(release) {
			each(readQueue, function(fn, cb) {
				fn(cb)
			}, release)
			readQueue = null
		})
	}

	function readLock(fn) {
		if (!readQueue) {
			readQueue = []
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
