var mutexify = require('mutexify')
var each = require('async-each')

module.exports = function createMutex() {
	var lock = mutexify()

	var readQueue = []

	function queueReadHandler() {
		lock(function readLockTiemz(release) {
			each(readQueue, function(fn, cb) {
				fn(cb)
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

	return {
		writeLock: lock,
		readLock: readLock
	}
}
