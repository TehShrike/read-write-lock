var mutexify = require('mutexify')

module.exports = function createMutex() {
	var lock = mutexify()

	var readQueue = null

	function queueReadHandler() {
		lock(function readLockTiemz(release) {
			asyncForEach(readQueue, release)
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

function asyncForEach(arrayOfFunctions, cb) {
	var callbacksCalled = 0

	arrayOfFunctions.forEach(function(fn) {
		var callbackCalledAlready = false
		try {
			fn(function singleReadRelease() {
				if (!callbackCalledAlready) {
					callbacksCalled++
					callbackCalledAlready = true
					if (callbacksCalled >= arrayOfFunctions.length) {
						process.nextTick(cb)
					}
				}
			})
		} catch (e) {
			process.nextTick(function() {
				throw e
			})
		}
	})
}
