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
		var readHandlerIsAlreadyOnQueue = readQueue.length > 0

		readQueue.push(fn)

		if (!readHandlerIsAlreadyOnQueue) {
			queueReadHandler()
		}
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
