var mutexify = require('mutexify')

module.exports = function createMutex() {
	var lock = mutexify()

	var readQueue = null

	function writeLock(fn) {
		lock(fn)
	}

	function queueReadHandler() {
		lock(function readLockTiemz(release) {
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
	}

	return {
		writeLock: writeLock,
		readLock: readLock
	}
}
