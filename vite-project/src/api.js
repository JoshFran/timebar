import {
	getFirestore,
	collection,
	getDocs,
	onSnapshot,
	orderBy,
	limit,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	arrayRemove,
	arrayUnion,
	deleteField,
	query,
	where,
	documentId,
} from "firebase/firestore";

import { formatTime, formatSeconds } from "./time.js";

const MAX_WALK_BACK_CHUNKS = 3;
let db = null;
let user = null;
let chunks = {};

function refreshConnection() {
	if (!db || !user) {
		db = window.timebar.fapp ? getFirestore(window.timebar.fapp) : null;
		user = window.timebar.auth.currentUser;
	} else {
		// Recheck
	}
}

function formatToDDMMMYYYY(date) {
	return format(date, "dd MMM yyyy");
}

const chunkIntervalSeconds = 60 * 60 * 24 * 14;

function dateToChunkId(date) {
	let n = date.getTime();
	return (
		Math.floor(n / (1000 * chunkIntervalSeconds)) * chunkIntervalSeconds
	).toString();
}

function getChunkRef(chunkId) {
	refreshConnection();
	return doc(db, "users", user.uid, "chunks", chunkId);
}

function convertRealToLogTimeRelativeToChunk(chunkId, time) {
	let chunkMs = parseInt(chunkId) * 1000;
	let diff = time.getTime() - chunkMs;
	return Math.floor(diff / 1000);
}

function convertRealToLogTime(time) {
	let chunkId = dateToChunkId(time);
	return {
		chunk: chunkId,
		log: convertRealToLogTimeRelativeToChunk(chunkId, time),
	};
}

async function getLogItemInChunk(chunkId, logTime) {
	let chunk = await getOrAwaitChunkData(chunkId);
	if (!chunk) {
		return null;
	}

	let sortedKeys = Object.keys(chunk.log)
		.map((x) => parseInt(x))
		.sort((a, b) => a - b);
	let lastKey = null;

	for (let i of sortedKeys.keys()) {
		let k = sortedKeys[i];
		if (k > logTime) {
			if (!lastKey) {
				return null;
			} else {
				return [...lastKey, chunkAndLogToDate(chunkId, k)];
			}
		}

		lastKey = [chunk.log[k.toString()], chunkAndLogToDate(chunkId, k)];
	}

	if (lastKey) {
		let forward = await forwardToFirstLogItem(
			new Date(lastKey[1].getTime() + 1000)
		);

		if (forward) {
			return [...lastKey, forward[1]];
		} else {
			return [...lastKey, new Date()];
		}
	} else {
		return null;
	}
}

async function forwardToFirstLogItem(date) {
	let startChunk = dateToChunkId(date);

	for (let i = 0; i <= MAX_WALK_BACK_CHUNKS; i++) {
		let chunkId = startChunk;
		if (startChunk) {
			let chunk = await getOrAwaitChunkData(chunkId);
			if (chunk) {
				for (let k of Object.keys(chunk.log)) {
					let d = chunkAndLogToDate(chunkId, parseInt(k));
					if (d.getTime() >= date.getTime()) {
						return [chunk.log[k], d];
					}
				}
			}
			startChunk = await getClosestAhead(startChunk);
		}
	}

	return null;
}

function prevChunkId(chunkId, count = 1) {
	return (parseInt(chunkId) - chunkIntervalSeconds * count).toString();
}
function nextChunkId(chunkId, count = 1) {
	return (parseInt(chunkId) + chunkIntervalSeconds * count).toString();
}

function chunkAndLogToDate(chunkId, logTime) {
	let chunkMs = parseInt(chunkId) * 1000;
	return new Date(chunkMs + logTime * 1000);
}

async function getLastLogItemInChunk(chunkId) {
	let chunk = await getOrAwaitChunkData(chunkId);
	if (!chunk) {
		return null;
	}

	let sortedKeys = Object.keys(chunk.log)
		.map((x) => parseInt(x))
		.sort((a, b) => a - b);
	if (sortedKeys.length == 0) {
		return null;
	} else {
		let latestDate = chunkAndLogToDate(
			chunkId,
			sortedKeys[sortedKeys.length - 1]
		);
		let nextForwardDate = await forwardToFirstLogItem(
			new Date(latestDate.getTime() + 1000)
		);
		return [
			chunk.log[sortedKeys[sortedKeys.length - 1].toString()],
			latestDate,
			nextForwardDate ? nextForwardDate[1] : new Date(),
		];
	}
}
async function getFirstLogItemInChunk(chunkId) {
	let chunk = await getOrAwaitChunkData(chunkId);
	if (!chunk) {
		return null;
	}

	let sortedKeys = Object.keys(chunk.log)
		.map((x) => parseInt(x))
		.sort((a, b) => a - b);
	if (sortedKeys.length == 0) {
		return null;
	} else {
		let latestDate = chunkAndLogToDate(chunkId, sortedKeys[0]);
		let nextForwardDate = await forwardToFirstLogItem(
			new Date(latestDate.getTime() + 1000)
		);
		return [
			chunk.log[sortedKeys[0].toString()],
			latestDate,
			nextForwardDate ? nextForwardDate[1] : new Date(),
		];
	}
}

/**
 * Returns the log item active at the given time along with the exact start and end date of the item.
 *
 * @param {Date} time
 * @returns {Promise<[string, Date, Date]>}
 */
async function getLogItemAt(time) {
	let location = convertRealToLogTime(time);

	let startChunk = location.chunk;
	let inThisChunk = await getLogItemInChunk(startChunk, location.log);
	if (inThisChunk) {
		return inThisChunk;
	} else {
		for (let i = 1; i <= MAX_WALK_BACK_CHUNKS; i++) {
			if (startChunk) {
				startChunk = await getClosestBehind(startChunk);
				if (startChunk) {
					let lastItem = await getLastLogItemInChunk(startChunk);
					if (lastItem) {
						return lastItem;
					}
				}
			}
		}

		// Check for the first item in this chunk
		let firstItem = await getFirstLogItemInChunk(location.chunk);
		if (firstItem) {
			return firstItem;
		} else {
			startChunk = await getClosestAhead(location.chunk);
			if (startChunk) {
				let firstItem = await getFirstLogItemInChunk(startChunk);
				if (firstItem) {
					return firstItem;
				} else {
					return null;
				}
			} else {
				return null;
			}
		}
	}
}

let behindQueryCache = {};
let aheadQueryCache = {};

export async function getClosestBehind(chunkId) {
	if (behindQueryCache[chunkId]) {
		return behindQueryCache[chunkId];
	}

	let q = query(
		collection(db, "users", user.uid, "chunks"),
		orderBy(documentId(), "asc"),
		where(documentId(), "<", chunkId),
		limit(1)
	);

	let docs = await getDocs(q);
	if (docs.size == 0) {
		behindQueryCache[chunkId] = null;
		return null;
	} else {
		behindQueryCache[chunkId] = docs.docs[0].id;
		return docs.docs[0].id;
	}
}

export async function getClosestAhead(chunkId) {
	if (aheadQueryCache[chunkId]) {
		return aheadQueryCache[chunkId];
	}

	let q = query(
		collection(db, "users", user.uid, "chunks"),
		orderBy(documentId(), "asc"),
		where(documentId(), ">", chunkId),
		limit(1)
	);

	let docs = await getDocs(q);
	if (docs.size == 0) {
		aheadQueryCache[chunkId] = null;
		return null;
	} else {
		aheadQueryCache[chunkId] = docs.docs[0].id;
		return docs.docs[0].id;
	}
}

export async function getLogItemsInRange(start, end) {
	let items = [];
	let startItem = await getLogItemAt(start);
	let endItem = await getLogItemAt(end);
	if (startItem && endItem) {
		let currentKey = startItem[0];
		let currentStart = startItem[1];
		console.log(startItem[1]);

		let startChunk = convertRealToLogTime(startItem[1]).chunk;
		let endChunk = convertRealToLogTime(endItem[2]).chunk;

		for (
			let i = parseInt(startChunk);
			i <= parseInt(endChunk);
			i += chunkIntervalSeconds
		) {
			let chunk = await getOrAwaitChunkData(i.toString());
			if (chunk) {
				let sortedKeys = Object.keys(chunk.log)
					.map((x) => parseInt(x))
					.sort((a, b) => a - b);
				for (let key of sortedKeys) {
					let item = chunk.log[key.toString()];
					let itemDate = chunkAndLogToDate(i.toString(), key);
					if (itemDate.getTime() > startItem[1].getTime()) {
						items.push([currentKey, currentStart, itemDate]);
						currentKey = item;
						currentStart = itemDate;
					}
				}
			}
		}

		items.push([currentKey, currentStart, new Date()]);
	}

	return items.filter(
		(x) => (x[1] >= start && x[1] <= end) || (x[2] >= start && x[2] <= end)
	);
}

async function getOrAwaitChunkData(chunkId) {
	if (chunks[chunkId]) {
		return chunks[chunkId].data;
	}

	chunks[chunkId] = {
		unsubscribe: null,
		data: null,
	};

	let doc = await getDoc(getChunkRef(chunkId));
	if (doc.exists()) {
		let d = doc.data();
		if (d) {
			chunks[chunkId].data = d;
			return d;
		}
	}

	return null;
}
