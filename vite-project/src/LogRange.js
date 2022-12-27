class LogRange {
	constructor(start, end, chunks) {
		this.start = start;
		this.end = end;
		this.chunks = chunks;
	}

	/**
	 * @param {function} callback
	 *
	 * Walks through the range and calls the callback for each log entry
	 */
	walk(callback) {
		return this.start;
	}
}

export default LogRange;
