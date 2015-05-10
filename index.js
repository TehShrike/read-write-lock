var mutexify = require('mutexify')

module.exports = function createMutex() {
	var lock = mutexify()

	var locked = false
	var mutexQueue = []
	var readQueue = null

	function processQueue() {
		if (!locked && mutexQueue.length > 0) {
			locked = true
			var next = mutexQueue.shift()
			var releaseCalledOnceAlready = false
			process.nextTick(next, function() {
				if (!releaseCalledOnceAlready) {
					locked = false
					releaseCalledOnceAlready = true
					processQueue()
				}
			})
		}
	}

	function writeLock(fn) {
		mutexQueue.push(fn)
		processQueue()
	}

	function queueReadHandler() {
		mutexQueue.push(function readLockTiemz(release) {
			var thisBatchOfQueuedReads = readQueue
			readQueue = null
			var finishedReads = 0

			thisBatchOfQueuedReads.forEach(function grantSingleReadLock(fn) {
				var releaseCalledOnceAlready = false
				try {
					fn(function singleReadRelease() {
						if (!releaseCalledOnceAlready) {
							finishedReads++
							releaseCalledOnceAlready = true
							if (finishedReads >= thisBatchOfQueuedReads.length) {
								release()
							}
						}
					})
				} catch (e) {
					process.nextTick(function() {
						throw e
					})
				}
			})
		})
	}

	function readLock(fn) {
		if (!readQueue) {
			readQueue = []
			queueReadHandler()
		}

		readQueue.push(fn)
		processQueue()
	}

	return {
		writeLock: writeLock,
		readLock: readLock
	}
}
