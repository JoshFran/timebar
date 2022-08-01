<script setup>
import { computed, nextTick, onMounted, reactive, ref, toRef } from "vue";

import "../roundRect.js";

// import { regular, solid } from "font-awesome-icon-chars";

// let charMap = {};
// for (let icon of regular) {
// 	charMap["far fa-" + icon.name] = icon.unicode;
// }
// for (let icon of solid) {
// 	charMap["fas fa-" + icon.name] = icon.unicode;
// }

import interact from "interactjs";

import charMap from "../unicode.js";

import { filterIcon } from "../iconer.js";

import Selector from "./Selector.vue";
import Dialog from "./Dialog.vue";

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
} from "firebase/firestore";

import {
	eachDayOfInterval,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	startOfYear,
	addMonths,
	endOfYear,
	getWeekOfMonth,
	getMonth,
	getDay,
	getWeek,
	addYears,
	addWeeks,
	getDayOfYear,
	subDays,
	startOfDay,
	endOfDay,
	isSameMonth,
	addDays,
	getDaysInMonth,
} from "date-fns";

import { formatTime, formatSeconds } from "../time.js";

const props = defineProps({
	user: Object,
	db: Object,
	blocks: Array,
	active: Boolean,
});

let db = props.db;
let user = props.user;
let blocksMap = computed(() =>
	props.blocks.reduce((acc, block) => {
		acc[block.id] = block;
		return acc;
	}, {})
);

const autoPos = ref({ x: 0, y: 0 });

const tabActive = computed(() => props.active);

let blocks = computed(() => {
	let result = props.blocks.reduce((res, obj) => {
		if (res[obj.color]) res[obj.color].push(obj);
		else res[obj.color] = [obj];
		return res;
	}, {});
	return Object.values(result).flat();
});

let chunks = {};

let mutation = {
	fromChunk: null,
	fromKey: null,
	toChunk: null,
	toKey: null,
};

const selectingType = ref(false);

const chunkIntervalSeconds = 60 * 60 * 24 * 14;

function dateToChunkId(date) {
	let n = date.getTime();
	return (
		Math.floor(n / (1000 * chunkIntervalSeconds)) * chunkIntervalSeconds
	).toString();
}

function getChunkRef(chunkId) {
	return doc(db, "users", user.uid, "chunks", chunkId);
}

let yearRerenderTimeout = null;
let monthRerenderTimeout = null;

function getOrEnqueueChunkData(chunkId) {
	if (chunks[chunkId]) {
		return chunks[chunkId].data;
	}

	chunks[chunkId] = {
		unsubscribe: null,
		data: null,
	};

	const unsubscribe = onSnapshot(getChunkRef(chunkId), (snapshot) => {
		let d = snapshot.data();

		if (d) {
			chunks[chunkId].data = d;

			let year = new Date(parseInt(chunkId) * 1000).getFullYear();
			if (yearCaches.has(year)) {
				if (yearRerenderTimeout) {
					clearTimeout(yearRerenderTimeout);
				}
				yearRerenderTimeout = setTimeout(() => {
					getYearCache(year, true);
				}, 1000);
			}

			let months = [];
			for (let d = 0; d < 14; d++) {
				let mDate = new Date(
					parseInt(chunkId) * 1000 + d * 24 * 60 * 60 * 1000
				);
				let month =
					mDate.getUTCFullYear() + "-" + (mDate.getUTCMonth() + 1);
				if (!months.includes(month)) {
					months.push(month);
				}
			}
			console.log(months);
			for (let month of months) {
				if (monthCaches.has(month)) {
					getMonthCache(month, true);
				}
			}
		}
	});

	return null;
}

function getNormalizedTimes(date) {
	let cid = dateToChunkId(date);
	let targetMs = date.getTime();

	let chunkMs = parseInt(cid) * 1000;

	return [cid, Math.floor((targetMs - chunkMs) / 1000).toString()];
}

function chunkAndKeyToMs(chunk, key) {
	return parseInt(chunk) * 1000 + parseInt(key) * 1000;
}

function getBlockBounds(date) {
	let cid = dateToChunkId(date);
	let chunkData = getOrEnqueueChunkData(cid);

	let min = {
		chunk: null,
		key: null,
	};
	let mid = {
		chunk: null,
		key: null,
	};
	let max = {
		chunk: null,
		key: null,
	};
	let targetMs = date.getTime();

	let chunkBeforeId = (parseInt(cid) - 60 * 60 * 24 * 7 * 2).toString();
	let chunkBeforeData = getOrEnqueueChunkData(chunkBeforeId);
	let chunkBeforeMs = parseInt(chunkBeforeId) * 1000;

	if (chunkBeforeData && chunkBeforeData.log)
		for (let k of Object.keys(chunkBeforeData.log)) {
			let ms = chunkBeforeMs + parseInt(k) * 1000;
			if (ms < targetMs) {
				min.chunk = chunkBeforeId;
				min.key = k;
			} else if (ms > targetMs) {
				max.chunk = chunkBeforeId;
				max.key = k;
				break;
			} else {
				mid.chunk = chunkBeforeId;
				mid.key = k;
			}
		}

	if (mid.chunk && max.chunk) {
		return { min, mid, max };
	}

	let chunkMs = parseInt(cid) * 1000;
	for (let k of Object.keys(chunkData.log)) {
		let ms = chunkMs + parseInt(k) * 1000;
		if (ms < targetMs) {
			min.chunk = cid;
			min.key = k;
		} else if (ms > targetMs) {
			max.chunk = cid;
			max.key = k;
			break;
		} else {
			mid.chunk = cid;
			mid.key = k;
		}
	}

	if (mid.chunk && max.chunk) {
		return { min, mid, max };
	}

	let chunkAfterId = (parseInt(cid) + 60 * 60 * 24 * 7 * 2).toString();
	let chunkAfterData = getOrEnqueueChunkData(chunkAfterId);
	let chunkAfterMs = parseInt(chunkAfterId) * 1000;

	if (chunkAfterData && chunkAfterData.log)
		for (let k of Object.keys(chunkAfterData.log)) {
			let ms = chunkAfterMs + parseInt(k) * 1000;
			if (ms < targetMs) {
				min.chunk = chunkAfterId;
				min.key = k;
			} else if (ms > targetMs) {
				max.chunk = chunkAfterId;
				max.key = k;
				break;
			} else {
				mid.chunk = chunkAfterId;
				mid.key = k;
			}
		}

	if (!max.chunk) {
		let nowDate = new Date();
		max.chunk = dateToChunkId(nowDate);
		max.key = Math.floor(
			(nowDate.getTime() - parseInt(max.chunk) * 1000) / 1000
		).toString();
	}

	return { min, mid, max };
}

async function getBlockAt(date) {
	let cid = dateToChunkId(date);
	let chunkData = getOrEnqueueChunkData(cid);

	let block = null;
	let targetMs = date.getTime();

	let chunkMs = parseInt(cid) * 1000;
	for (let k of Object.keys(chunkData.log)) {
		let ms = chunkMs + parseInt(k) * 1000;
		if (ms > targetMs) {
			break;
		}
		block = chunkData.log[k];
	}

	if (block) {
		return block;
	}

	let chunkBeforeId = (parseInt(cid) - 60 * 60 * 24 * 7 * 2).toString();
	let chunkBeforeData = getOrEnqueueChunkData(chunkBeforeId);
	let chunkBeforeMs = parseInt(chunkBeforeId) * 1000;

	for (let k of Object.keys(chunkBeforeData.log)) {
		let ms = chunkBeforeMs + parseInt(k) * 1000;
		if (ms > targetMs) {
			break;
		}
		block = chunkBeforeData.log[k];
	}

	return block;
}

async function updateTargetType(toBlockId) {
	let time = new Date(targetedAction.typeTime);
	writeLogEntry(time, toBlockId);
}

function writeLogEntry(date, block) {
	if (date.getTime() > Date.now()) {
		// Never write into the future
		return;
	}

	let cid = dateToChunkId(date);
	let cRef = getChunkRef(cid);

	let targetMs = date.getTime();
	let chunkMs = parseInt(cid) * 1000;
	let relativeMs = targetMs - chunkMs;
	let relativeS = Math.floor(relativeMs / 1000);

	return updateDoc(cRef, {
		[["log." + relativeS.toString()]]: block,
	});
}

function getBlockAtExact(chunk, key) {
	let c = getOrEnqueueChunkData(chunk);
	if (c) return c.log[key];
}

function getLogForDay(date) {
	let dayStart = startOfDay(date).getTime();
	let dayEnd = endOfDay(date).getTime();
	let totalMs = dayEnd - dayStart;

	let chunkKey = dateToChunkId(date);
	let chunkBeforeKey = dateToChunkId(new Date(dayStart));

	let chunk = getOrEnqueueChunkData(chunkKey);
	let chunkBefore = getOrEnqueueChunkData(chunkBeforeKey);

	let chunkAfterKey = dateToChunkId(new Date(dayEnd));
	let chunkAfter = null;
	if (chunkAfterKey != chunkKey) {
		chunkAfter = getOrEnqueueChunkData(chunkAfterKey);
	}

	let now = Date.now();

	if (chunk && chunk.log) {
		let chunkBeforeMs = parseInt(chunkBeforeKey) * 1000;
		let chunkMs = parseInt(chunkKey) * 1000;
		let chunkAfterMs = parseInt(chunkAfterKey) * 1000;

		let start = 0;
		let currentBlock = "";
		let log = [];

		while (currentBlock == "") {
			if (chunkBefore && chunkBefore.log) {
				let readBeforeLog = chunkBefore.log;

				if (mutation.toChunk == chunkBeforeKey) {
					readBeforeLog = {
						...chunkBefore.log,
					};
					let currentBlock = getBlockAtExact(
						mutation.fromChunk,
						mutation.fromKey
					);
					readBeforeLog[mutation.toKey] = currentBlock;
				}

				for (let k of Object.keys(readBeforeLog)) {
					if (
						mutation.fromChunk == chunkBeforeKey &&
						mutation.fromKey == k &&
						!(
							mutation.toChunk == chunkBeforeKey &&
							mutation.toKey == k
						)
					) {
						continue;
					}

					let ms = chunkBeforeMs + parseInt(k) * 1000;
					// console.log(currentBlock);

					if (ms > dayStart) {
						break;
					}
					currentBlock = readBeforeLog[k];
				}
			} else {
				let k = Object.keys(chunk.log)[0];

				currentBlock = chunk.log[k];
				start = chunkMs + parseInt(k) * 1000 - dayStart;
			}

			if (chunkBefore) {
				chunkBeforeKey = (
					parseInt(chunkBeforeKey) -
					60 * 60 * 24 * 14
				).toString();
				chunkBeforeMs = parseInt(chunkBeforeKey) * 1000;
				chunkBefore = getOrEnqueueChunkData(chunkBeforeKey);
			}
		}

		let removedMutation = false;

		let readLog = chunk.log;

		if (mutation.toChunk == chunkKey) {
			readLog = {
				...chunk.log,
			};
			let currentBlock = getBlockAtExact(
				mutation.fromChunk,
				mutation.fromKey
			);
			readLog[mutation.toKey] = currentBlock;
		}

		for (let k of Object.keys(readLog)) {
			if (
				mutation.fromChunk == chunkKey &&
				mutation.fromKey == k &&
				!(mutation.toChunk == chunkKey && mutation.toKey == k)
			) {
				continue;
			}

			let ms = chunkMs + parseInt(k) * 1000 - dayStart;
			if (ms >= 0) {
				log.push([
					currentBlock,
					start / totalMs,
					ms / totalMs,
					chunkMs + parseInt(k) * 1000,
				]);
				start = ms;
				currentBlock = readLog[k];
			}

			// if (
			// 	!addedMutation &&
			// 	mutation.toChunk == chunkKey &&
			// 	parseInt(mutation.toKey) > parseInt(k)
			// ) {
			// 	addedMutation = true;
			// 	console.log("added ", currentBlock);
			// 	let mutms =
			// 		chunkMs + parseInt(mutation.toKey) * 1000 - dayStart;
			// 	log.push([
			// 		currentBlock,
			// 		start / totalMs,
			// 		mutms / totalMs,
			// 		chunkMs + parseInt(k) * 1000
			// 	]);
			// 	start = mutms;
			// 	currentBlock = getBlockAtExact(
			// 		mutation.fromChunk,
			// 		mutation.fromKey
			// 	);
			// }
		}

		if (now > dayEnd) {
			if (chunkAfter) {
				// console.log("chunkAfter", chunkAfter);
				let readAfterLog = chunkAfter.log;

				if (mutation.toChunk == chunkAfterKey) {
					readAfterLog = {
						...chunkAfter.log,
					};
					let currentBlock = getBlockAtExact(
						mutation.fromChunk,
						mutation.fromKey
					);
					readAfterLog[mutation.toKey] = currentBlock;
				}
				for (let k of Object.keys(readAfterLog)) {
					if (
						mutation.fromChunk == chunkAfterKey &&
						mutation.fromKey == k &&
						!(
							mutation.toChunk == chunkAfterKey &&
							mutation.toKey == k
						)
					) {
						continue;
					}

					let ms = chunkAfterMs + parseInt(k) * 1000 - dayStart;
					if (ms >= 0) {
						log.push([
							currentBlock,
							start / totalMs,
							ms / totalMs,
							chunkAfterMs + parseInt(k) * 1000,
						]);
						start = ms;
						currentBlock = readAfterLog[k];
					}
				}
			} else {
				log.push([currentBlock, start / totalMs, 1]);
			}
		} else {
			log.push([
				currentBlock,
				start / totalMs,
				(now - dayStart) / totalMs,
			]);
		}

		return log;
	}

	return null;
}

const cnvs = ref(null);
let cnvsSize = {
	x: 0,
	y: 0,
};

const focusDay = ref(new Date());
const currentDay = ref(new Date());

setInterval(() => {
	currentDay.value = new Date();
}, 100000);

const zoomLevel = ref(0);
const moveSlide = ref(0);
const calendarScale = ref(1);
const calendarY = ref(0);
let ctx;

class DaySlot {
	constructor(date) {
		this.date = date;
		this.active = true;
		this.render = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			scale: 0,
			time: 0,
			rendered: false,
		};
	}
}

class TextSlot {
	constructor(key) {
		this.date = key;
		this.active = true;
		this.render = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			scale: 0,
			time: 0,
			rendered: false,
		};
	}
}

class ViewLayout {
	constructor() {
		this.rows = 0;
		this.columns = 0;
		this.slots = [];
		this.texts = [];
		this.rendered = false;
	}

	render() {}

	getTransform(slotIndex) {}
}

let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let monthsOfTheYear = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

class WeekLayout extends ViewLayout {
	constructor(week) {
		super();
		this.week = week;
	}

	render() {
		if (window.innerWidth < 900) {
			this.rows = 1;
			this.columns = 1;
			this.slots.push(new TextSlot(daysOfTheWeek[this.week.getDay()]));
			this.slots.push(new DaySlot(this.week));
			return;
		}

		this.rows = 1;
		this.columns = 7;

		let days = eachDayOfInterval({
			start: startOfWeek(this.week),
			end: endOfWeek(this.week),
		});

		for (let d of days) {
			this.slots.push(new DaySlot(d));
		}

		for (let i = 0; i < 7; i++) {
			this.slots.push(new TextSlot(daysOfTheWeek[i]));
		}
	}

	getTransform(slotIndex) {
		let margin = 20;
		let rowWidth =
			(Math.min(cnvsSize.x - 400) - this.columns * margin) / this.columns;
		let rowHeight = cnvsSize.y - 300;

		if (window.innerWidth < 900) {
			rowWidth = cnvsSize.x - 300;
			if (window.innerWidth < 600) {
				rowWidth = cnvsSize.x - 150;
			}
			let column = 0;
			let row = 0;

			if (slotIndex == 0) {
				return {
					x: column * (rowWidth + margin),
					y: row * rowHeight - 60,
					width: rowWidth,
					height: 40,
					radii: 10,
				};
			} else {
				return {
					x: column * (rowWidth + margin),
					y: 0,
					width: rowWidth,
					height: rowHeight,
					radii: 10,
				};
			}
		}

		let row = 0;
		let column = slotIndex;

		if (slotIndex > 6) {
			column = slotIndex - 7;
			return {
				x: column * (rowWidth + margin),
				y: row * rowHeight - 60,
				width: rowWidth,
				height: 40,
				radii: 10,
			};
		} else {
			return {
				x: column * (rowWidth + margin),
				y: row * rowHeight,
				width: rowWidth,
				height: rowHeight,
				radii: 10,
			};
		}
	}
}

class MonthLayout extends ViewLayout {
	constructor(month) {
		super();
		this.month = month;
	}

	render() {
		this.rows = 6;
		this.columns = 7;

		let days = eachDayOfInterval({
			start: startOfWeek(startOfMonth(this.month)),
			end: endOfWeek(endOfMonth(this.month)),
		});

		for (let i = 0; i < 7; i++) {
			this.slots.push(new TextSlot(daysOfTheWeek[i]));
		}

		for (let d of days) {
			let slot = new DaySlot(d);
			if (!isSameMonth(d, this.month)) {
				slot.active = false;
			}
			this.slots.push(slot);
		}
	}

	getTransform(slotIndex) {
		let isText = slotIndex <= 6;
		if (slotIndex > 6) {
			slotIndex = slotIndex - 7;
		}
		let sideMargin = 400;

		if (window.innerWidth < 1100) {
			sideMargin = 200;
		}
		if (window.innerWidth < 600) {
			sideMargin = 20;
		}

		let margin = 20;
		let rowWidth =
			(Math.min(cnvsSize.x - sideMargin) - this.columns * margin) /
			this.columns;
		let rowHeight =
			(Math.min(cnvsSize.y - 200) - this.rows * margin) / this.rows;
		let row = Math.floor(slotIndex / this.columns);
		let column = slotIndex % this.columns;

		if (isText) {
			return {
				x: column * (rowWidth + margin),
				y: -60,
				width: rowWidth,
				height: 40,
				radii: 10,
			};
		} else {
			return {
				x: column * (rowWidth + margin),
				y: row * (rowHeight + margin),
				width: rowWidth,
				height: rowHeight,
				radii: 10,
			};
		}
	}
}

class YearLayout extends ViewLayout {
	constructor(year) {
		super();
		this.year = year;
	}

	render() {
		this.rows = 4 * 7; // 4 months * 7 days
		this.columns = 3 * 6; // 3 months * 6 days

		for (let i = 0; i < 12; i++) {
			this.slots.push(new TextSlot(monthsOfTheYear[i]));
		}

		for (let i = 0; i < 12; i++) {
			let month = addMonths(startOfYear(this.year), i);
			let days = eachDayOfInterval({
				start: startOfMonth(month),
				end: endOfMonth(month),
			});

			for (let d of days) {
				this.slots.push(new DaySlot(d));
			}
		}
	}

	getTransform(slotIndex) {
		let psize = 40;
		if (window.innerWidth < 1280) {
			psize = 30;
		}
		if (window.innerWidth < 940) {
			psize = 20;
		}
		if (window.innerWidth < 485) {
			psize = 15;
		}

		let isText = slotIndex <= 11;
		if (slotIndex > 11) {
			slotIndex = slotIndex - 12;
		}

		function calcRowCol(index) {
			let row = Math.floor(index / 4);
			let column = index % 4;
			if (window.innerWidth < 640) {
				// 3x4 layout
				row = Math.floor(index / 3);
				column = index % 3;
			}
			if (window.innerWidth < 485) {
				// 2x6 layout
				row = Math.floor(index / 2);
				column = index % 2;
			}

			return { row, column };
		}

		if (isText) {
			let { row, column } = calcRowCol(slotIndex);

			return {
				x: column * psize * 7 + column * psize,
				y: row * psize * 6 + row * psize,
				width: 7 * psize,
				height: psize,
				radii: 30,
			};
		} else {
			let slot = this.slots[12 + slotIndex];
			let month = getMonth(slot.date);
			let dayOfWeek = getDay(slot.date);
			let weekOfMonth = getWeekOfMonth(slot.date);
			let { row, column } = calcRowCol(month);

			return {
				x: column * psize * 7 + column * psize + dayOfWeek * psize,
				y: row * psize * 6 + row * psize + weekOfMonth * psize,
				width: psize - 10,
				height: psize - 10,
				radii: psize - 10,
			};
		}
	}
}

let layoutCache = new Map();

function cacheLayout(key, fn) {
	if (layoutCache.has(key)) {
		return layoutCache.get(key);
	}

	let layout = fn();
	layoutCache.set(key, layout);
	return layout;
}

function getViewLayouts(day, zoom, slide) {
	if (slide != 0) {
		if (zoom == -2) {
			let day2 = addYears(day, slide);
			return {
				from: cacheLayout("y-" + day.getFullYear(), () => {
					return new YearLayout(day);
				}),
				to: cacheLayout("y-" + day2.getFullYear(), () => {
					return new YearLayout(day2);
				}),
			};
		} else if (zoom == -1) {
			let day2 = addMonths(day, slide);
			return {
				from: cacheLayout(
					"ym-" + day.getFullYear() + "-" + day.getMonth(),
					() => {
						return new MonthLayout(day);
					}
				),
				to: cacheLayout(
					"ym-" + day2.getFullYear() + "-" + day2.getMonth(),
					() => {
						return new MonthLayout(day2);
					}
				),
			};
		} else if (zoom >= 0) {
			let day2 = addWeeks(day, slide);
			let k1 = getWeek(day);
			let k2 = getWeek(day2);
			if (window.innerWidth < 900) {
				day2 = addDays(day, slide);
				k1 =
					day.getFullYear() +
					"-" +
					day.getMonth() +
					"-" +
					day.getDate();
				k2 =
					day2.getFullYear() +
					"-" +
					day2.getMonth() +
					"-" +
					day2.getDate();
			}
			return {
				from: cacheLayout("yw-" + day.getFullYear() + "-" + k1, () => {
					return new WeekLayout(day);
				}),
				to: cacheLayout("yw-" + day2.getFullYear() + "-" + k2, () => {
					return new WeekLayout(day2);
				}),
			};
		}

		return;
	}

	if (zoom == -2) {
		return {
			from: cacheLayout("y-" + day.getFullYear(), () => {
				return new YearLayout(day);
			}),
			to: cacheLayout(
				"ym-" + day.getFullYear() + "-" + day.getMonth(),
				() => {
					return new MonthLayout(day);
				}
			),
		};
	} else if (zoom == -1) {
		let k2 = getWeek(day);
		if (window.innerWidth < 900) {
			k2 = day.getMonth() + "-" + day.getDate();
		}
		return {
			from: cacheLayout(
				"ym-" + day.getFullYear() + "-" + day.getMonth(),
				() => {
					return new MonthLayout(day);
				}
			),
			to: cacheLayout("yw-" + day.getFullYear() + "-" + k2, () => {
				return new WeekLayout(day);
			}),
		};
	} else if (zoom >= 0) {
		let k1 = getWeek(day);
		if (window.innerWidth < 900) {
			k1 = day.getMonth() + "-" + day.getDate();
		}
		return {
			from: cacheLayout("yw-" + day.getFullYear() + "-" + k1, () => {
				return new WeekLayout(day);
			}),
			to: cacheLayout("yw-" + day.getFullYear() + "-" + k1, () => {
				return new WeekLayout(day);
			}),
		};
	}
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function dateToKey(d) {
	if (d instanceof Date) {
		return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
	} else {
		return d;
	}
}

let zoomSmooth = zoomLevel.value;
let slideSmooth = moveSlide.value;

let yearKeys = [null, null];
let yearCaches = new Map();
let monthCaches = new Map();

function getYearCache(yearKey, rerender) {
	if (!yearCaches.has(yearKey)) {
		let yearCacheCanvas = document.createElement("canvas");
		yearCacheCanvas.width = 365;
		yearCacheCanvas.height = 40;
		yearCacheCanvas.style["image-rendering"] = "pixelated";
		let yearCacheCtx = yearCacheCanvas.getContext("2d");
		yearCacheCtx.imageSmoothingEnabled = false;
		yearCaches.set(yearKey, {
			canvas: yearCacheCanvas,
			ctx: yearCacheCtx,
		});

		rerender = true;
	}

	if (rerender) {
		let yearCacheCtx = yearCaches.get(yearKey).ctx;

		for (let d = 0; d < 365; d++) {
			setTimeout(() => {
				let dte = new Date(yearKey, 0, 0);
				dte.setDate(dte.getDate() + d);
				let log = getLogForDay(dte);
				if (log) {
					for (let item of log) {
						let block = blocksMap.value[item[0]];
						if (block) {
							yearCacheCtx.fillStyle = block.color;
							yearCacheCtx.fillRect(
								d,
								item[1] * 40,
								1,
								(item[2] - item[1]) * 40
							);
						}
					}
				}
			}, d * 4);
		}
	}

	return yearCaches.get(yearKey).canvas;
}

function getMonthCache(monthKey, rerender) {
	if (!monthCaches.has(monthKey)) {
		let monthCacheCanvas = document.createElement("canvas");
		monthCacheCanvas.width = 34;
		monthCacheCanvas.height = 120;
		monthCacheCanvas.style["image-rendering"] = "pixelated";
		let monthCacheCtx = monthCacheCanvas.getContext("2d");
		monthCacheCtx.imageSmoothingEnabled = false;
		monthCaches.set(monthKey, {
			canvas: monthCacheCanvas,
			ctx: monthCacheCtx,
		});

		rerender = true;
	}

	if (rerender) {
		let monthCacheCtx = monthCaches.get(monthKey).ctx;

		let baseDt = new Date(
			parseInt(monthKey.split("-")[0]),
			parseInt(monthKey.split("-")[1]),
			0
		);

		for (let d = 1; d <= getDaysInMonth(baseDt); d++) {
			setTimeout(() => {
				let dte = new Date(
					`${parseInt(monthKey.split("-")[0])}-${parseInt(
						monthKey.split("-")[1]
					)}-1`
				);
				dte.setDate(d);
				let log = getLogForDay(dte);
				if (log) {
					// console.log("Did hit", d, dte, monthKey);
					for (let item of log) {
						let block = blocksMap.value[item[0]];
						if (block) {
							monthCacheCtx.fillStyle = block.color;
							monthCacheCtx.fillRect(
								d,
								item[1] * 120,
								1,
								(item[2] - item[1]) * 120
							);
						}
					}
				} else {
					// console.log("No hit", d, dte, monthKey);
				}
			}, d * 4);
		}
	}

	return monthCaches.get(monthKey).canvas;
}

function centerCalendar() {
	if ((cnvsSize.y - 300) * calendarScale.value < window.innerHeight) {
		calendarY.value =
			(window.innerHeight - (cnvsSize.y - 300) * calendarScale.value) / 2;
	}
}

let clockMode = ref("12h");

function formatTimeClockMode(t) {
	let dec = t - Math.floor(t);
	let suffix = "";
	if (clockMode.value == "12h") {
		if (t >= 12) {
			t -= 12;
			suffix = "p";
		} else {
			suffix = "a";
		}

		if (Math.floor(t) == 0) {
			t = 12;
		}
	}
	if (Math.round(dec * 60) == 60) {
		if (suffix == "p" && Math.floor(t + 1) == 12) {
			suffix = "a";
		}
		return `${Math.floor(t + 1)}:00${suffix}`;
	} else {
		return `${Math.floor(t)}:${Math.round(dec * 60)
			.toString()
			.padStart(2, "0")}${suffix}`;
	}
}

let darkMode = false;

let invalidateTransforms = false;
let isScaling = false;

function paint(mouseCheck) {
	let currentDayKey = dateToKey(currentDay.value);
	let closestDay = null;
	let closestDist = Infinity;
	let resizeTarget = false;
	let resizeTime = 0;
	let sliceTarget = false;
	let clickableTarget = false;
	let typeTarget = false;
	let typeTime = 0;
	let blockTarget = null;
	let boxTarget = null;
	let mobileResize = false;
	let doPaint = !mouseCheck;

	if (doPaint) {
		ctx.clearRect(0, 0, cnvsSize.x, cnvsSize.y);
		ctx.fillStyle = "#fff";
		if (darkMode) {
			ctx.fillStyle = "#181a1b";
		}
		ctx.fillRect(0, 0, cnvsSize.x, cnvsSize.y);
	}

	// let lerpValue = Math.sin(Date.now() / 1000) / 2 + 0.5;
	let lerpValue = zoomSmooth - Math.floor(zoomSmooth);
	if (zoomSmooth >= 0) {
		lerpValue = zoomSmooth / 3;
	}
	let slideVal = 0;
	if (!isScaling) {
		if (Math.abs(slideSmooth) > 0.005) {
			slideVal = slideSmooth < 0 ? -1 : Math.ceil(slideSmooth);
		}

		if (slideVal != 0) {
			lerpValue = Math.abs(slideSmooth);
		}
	} else {
		slideSmooth = 0;
	}

	let layouts = getViewLayouts(
		focusDay.value,
		Math.floor(zoomSmooth),
		slideVal
	);

	let renderDays = {};
	let renderDaysFrom = {};
	let renderDaysTo = {};

	if (!layouts.from.rendered) {
		layouts.from.render();
		layouts.from.rendered = true;
	}

	if (!layouts.to.rendered) {
		layouts.to.render();
		layouts.to.rendered = true;
	}

	function appendLayout(layout, mp) {
		for (let i = 0; i < layout.slots.length; i++) {
			let slot = layout.slots[i];
			if (!slot.render.rendered || invalidateTransforms) {
				let trnsf = layout.getTransform(i);
				slot.render.x = trnsf.x;
				slot.render.y = trnsf.y;
				slot.render.width = trnsf.width;
				slot.render.height = trnsf.height;
				slot.render.radii = trnsf.radii;
				slot.render.rendered = true;
			}

			renderDays[dateToKey(slot.date)] = slot;
			mp[dateToKey(slot.date)] = slot;
		}
	}

	appendLayout(layouts.from, renderDaysFrom);
	appendLayout(layouts.to, renderDaysTo);

	invalidateTransforms = false;

	function calcBounds(days, filter = () => true) {
		let bounds = {
			x: Infinity,
			y: Infinity,
			width: 0,
			height: 0,
		};

		for (let day of Object.keys(days)) {
			if (!filter(days[day])) continue;

			let slot = days[day];
			if (slot instanceof DaySlot) {
				bounds.x = Math.min(bounds.x, slot.render.x);
				bounds.y = Math.min(bounds.y, slot.render.y);
				bounds.width = Math.max(
					bounds.width,
					slot.render.x + slot.render.width
				);
				bounds.height = Math.max(
					bounds.height,
					slot.render.y + slot.render.height
				);
			}
		}

		bounds.width -= bounds.x;
		bounds.height -= bounds.y;

		return bounds;
	}

	let fromBounds = calcBounds(renderDaysFrom);
	let toBounds = calcBounds(renderDaysTo);

	let fromBoundsOverlap = calcBounds(renderDaysFrom, (day) => {
		return dateToKey(day.date) in renderDaysTo;
	});

	let fromCenterOffset = {
		x: (cnvsSize.x - fromBounds.width) / 2,
		y: (cnvsSize.y - fromBounds.height) / 2,
	};
	let toCenterOffset = {
		x: (cnvsSize.x - toBounds.width) / 2,
		y: (cnvsSize.y - toBounds.height) / 2,
	};

	let fromTransformer = {
		originX: (fromBoundsOverlap.x * 2 + fromBoundsOverlap.width) / 2,
		originY: (fromBoundsOverlap.y * 2 + fromBoundsOverlap.height) / 2,
		scaleX: fromBoundsOverlap.width / fromBounds.width,
		scaleY: fromBoundsOverlap.height / fromBounds.height,
		translateX:
			fromBounds.x +
			fromBounds.width / 2 -
			(fromBoundsOverlap.x + fromBoundsOverlap.width / 2),
		translateY:
			fromBounds.y +
			fromBounds.height / 2 -
			(fromBoundsOverlap.y + fromBoundsOverlap.height / 2),
	};

	let inactive = {
		r: 246,
		g: 246,
		b: 246,
	};
	let active = {
		r: 230,
		g: 230,
		b: 230,
	};

	if (darkMode) {
		inactive = {
			r: 40,
			g: 40,
			b: 40,
		};
		active = {
			r: 20,
			g: 20,
			b: 20,
		};
	}

	let snapMousePos = -1;

	for (let day of [
		...Object.keys(renderDaysFrom),
		...Object.keys(renderDaysTo),
	]) {
		let slot = renderDays[day];
		let slotFrom = renderDaysFrom[day];
		let slotTo = renderDaysTo[day];

		let box = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			color: { r: 0, g: 0, b: 0 },
		};
		let opacity = 1;
		if (zoomSmooth >= 0 && Math.abs(slideSmooth) < 0.01 && slotFrom) {
			let fromColor = slotFrom.active ? active : inactive;
			box.color = {
				r: fromColor.r,
				g: fromColor.g,
				b: fromColor.b,
			};

			if (slot instanceof DaySlot) {
				box.x = fromCenterOffset.x + slotFrom.render.x;

				box.y = slotFrom.render.y + calendarYSmooth;
				box.width = slotFrom.render.width;
				box.height = slotFrom.render.height * calendarScaleSmooth;
				box.radii = slotFrom.render.radii;
			} else {
				box.x = fromCenterOffset.x + slotFrom.render.x;

				box.y = slotFrom.render.y + calendarYSmooth;
				box.width = slotFrom.render.width;
				box.height = slotFrom.render.height;
				box.radii = slotFrom.render.radii;
			}
		} else if (slotFrom && slotTo) {
			let fromColor = slotFrom.active ? active : inactive;
			let toColor = slotTo.active ? active : inactive;
			box.color = {
				r: lerp(fromColor.r, toColor.r, lerpValue),
				g: lerp(fromColor.g, toColor.g, lerpValue),
				b: lerp(fromColor.b, toColor.b, lerpValue),
			};

			box.x = lerp(
				fromCenterOffset.x + slotFrom.render.x,
				toCenterOffset.x + slotTo.render.x,
				lerpValue
			);
			box.y = lerp(
				fromCenterOffset.y + slotFrom.render.y,
				toCenterOffset.y + slotTo.render.y,
				lerpValue
			);
			box.width = lerp(
				slotFrom.render.width,
				slotTo.render.width,
				lerpValue
			);
			box.height = lerp(
				slotFrom.render.height,
				slotTo.render.height,
				lerpValue
			);
			box.radii = lerp(
				slotFrom.render.radii,
				slotTo.render.radii,
				lerpValue
			);
		} else if (slotFrom) {
			if (slideVal != 0) {
				box = {
					x:
						fromCenterOffset.x +
						slotFrom.render.x -
						slideSmooth * cnvsSize.x,
					y: fromCenterOffset.y + slotFrom.render.y,
					width: slotFrom.render.width,
					height: slotFrom.render.height,
					radii: slotFrom.render.radii,
				};
			} else {
				opacity = Math.max(0, 1 - lerpValue * 2);
				box = {
					x: fromCenterOffset.x + slotFrom.render.x,
					y: fromCenterOffset.y + slotFrom.render.y,
					width: slotFrom.render.width,
					height: slotFrom.render.height,
					radii: slotFrom.render.radii,
				};
			}

			let fromColor = slotFrom.active ? active : inactive;
			box.color = {
				r: fromColor.r,
				g: fromColor.g,
				b: fromColor.b,
			};

			// let sx = lerp(1, (1 / fromTransformer.scaleX) * 1.5, lerpValue);
			// 	let sy = lerp(1, (1 / fromTransformer.scaleY) * 1.5, lerpValue);
			// 	sx = sy = Math.max(sx, sy);

			// let ox = fromTransformer.originX;
			// let oy = fromTransformer.originY;
			// box.x -= ox;
			// box.y -= oy;
			// box.x *= sx;
			// box.y *= sy;
			// box.width *= sx;
			// box.height *= sy;
			// box.x += ox;
			// box.y += oy;
			// box.x -= ox;
			// box.y -= oy;
			// box.x *= sx;
			// console.log(Math.sign(fromTransformer.translateX));
			// box.x += lerp(
			// 	0,
			// 	fromTransformer.translateX *
			// 		((1 / fromTransformer.scaleX) * 1.5),
			// 	lerpValue
			// );
			// box.y += lerp(
			// 	0,
			// 	fromTransformer.translateY *
			// 		((1 / fromTransformer.scaleY) * 1.5),
			// 	lerpValue
			// );
			// box.x += ox;
			// box.y += oy;
			// box.x =
			// 	fromTransformer.originX -
			// 	(fromTransformer.originX - box.x) * sx;
			// box.y =
			// 	fromTransformer.originY -
			// 	(fromTransformer.originY - box.y) * sy;
		} else if (slotTo) {
			if (slideVal != 0) {
				box = {
					x:
						toCenterOffset.x +
						slotTo.render.x -
						slideSmooth * cnvsSize.x +
						cnvsSize.x * slideVal,
					y: toCenterOffset.y + slotTo.render.y,
					width: slotTo.render.width,
					height: slotTo.render.height,
					radii: slotTo.render.radii,
				};
			} else {
				opacity = lerpValue;
				box = {
					x: toCenterOffset.x + slotTo.render.x,
					y: toCenterOffset.y + slotTo.render.y,
					width: slotTo.render.width,
					height: slotTo.render.height,
					radii: slotTo.render.radii,
				};
			}

			let toColor = slotTo.active ? active : inactive;
			box.color = {
				r: toColor.r,
				g: toColor.g,
				b: toColor.b,
			};
		}

		if (doPaint) {
			ctx.beginPath();

			if (slot instanceof DaySlot) {
				ctx.fillStyle = `rgba(${box.color.r},${box.color.g},${box.color.b},${opacity})`;

				ctx.roundRect(box.x, box.y, box.width, box.height, [box.radii]);

				if (currentDayKey == dateToKey(slot.date)) {
					ctx.lineWidth = 6;
					ctx.strokeStyle = `rgba(30,144,255,${opacity})`;
					ctx.stroke();
				}

				ctx.fill();
			} else if (slot instanceof TextSlot) {
				ctx.fillStyle = `rgba(180,180,180,${opacity})`;
				if (darkMode) {
					ctx.fillStyle = `rgba(100,100,100,${opacity})`;
				}

				ctx.font = "16px Overpass";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(
					slot.date,
					box.x + box.width / 2,
					box.y + box.height / 2,
					box.width
				);
			}

			ctx.imageSmoothingEnabled = false;

			// ctx.beginPath();
			// ctx.roundRect(box.x, box.y, box.width, box.height, [box.radii]);
			ctx.save();
			ctx.clip();

			let num = 1;
			let w = box.width * window.devicePixelRatio;
			let h = box.height * window.devicePixelRatio;

			let bh = box.height;
			let bw = box.width;
			// for (let y = 0; y < box.height; y += 5) {
			// 	ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() *
			// 		255},${Math.random() * 255})`;
			// 	ctx.fillRect(box.x, box.y + y, box.width, 5);
			// }
			if (!slotTo) ctx.globalAlpha = 1 - lerpValue;

			if (slotFrom && slotTo) {
				let fromOpacity = slotFrom.active ? 1 : 0.01;
				let toOpacity = slotTo.active ? 1 : 0.01;
				ctx.globalAlpha = Math.min(
					ctx.globalAlpha,
					lerp(fromOpacity, toOpacity, lerpValue)
				);
			} else if (slotFrom) {
				let fromOpacity = slotFrom.active ? 1 : 0.01;
				ctx.globalAlpha = Math.min(ctx.globalAlpha, fromOpacity);
			} else if (slotTo) {
				let toOpacity = slotTo.active ? 1 : 0.01;
				ctx.globalAlpha = Math.min(ctx.globalAlpha, toOpacity);
			}

			ctx.globalAlpha;
			let lerpToLower = false;
			let fullyRendered = false;

			if (currentMouseX > box.x && currentMouseX < box.x + box.width) {
				if (
					currentMouseY > box.y &&
					currentMouseY < box.y + box.height
				) {
					boxTarget = box;
				}
			}

			function renderYearLevel(opacity) {
				if (slot instanceof DaySlot) {
					let yearCanvas = getYearCache(slot.date.getFullYear());
					let d = getDayOfYear(slot.date);
					if (window.innerWidth < 900) {
					} else {
						let oldAlpha = ctx.globalAlpha;
						ctx.globalAlpha = opacity;

						ctx.drawImage(
							yearCanvas,
							d,
							0,
							1,
							40,
							box.x,
							box.y,
							box.width,
							box.height
						);

						if (opacity == 1) {
							if (
								currentMouseX > box.x &&
								currentMouseX < box.x + box.width &&
								currentMouseY > box.y &&
								currentMouseY < box.y + box.height
							) {
								ctx.fillStyle = "white";
								ctx.textAlign = "center";
								ctx.textBaseline = "middle";
								ctx.font = "400 12px Overpass";
								ctx.fillText(
									slot.date.getDate(),
									box.x + box.width / 2,
									box.y + box.height / 2,
									box.width
								);
							}
						}

						ctx.globalAlpha = oldAlpha;
					}
				}
			}

			function renderMonthLevel(opacity) {
				if (slot instanceof DaySlot) {
					let monthCanvas = getMonthCache(
						slot.date.getUTCFullYear() +
							"-" +
							(slot.date.getUTCMonth() + 1)
					);
					let d = slot.date.getDate();
					let oldAlpha = ctx.globalAlpha;
					ctx.globalAlpha = opacity;

					ctx.drawImage(
						monthCanvas,
						d,
						0,
						1,
						120,
						box.x,
						box.y,
						box.width,
						box.height
					);
					if (opacity == 1) {
						if (
							currentMouseX > box.x &&
							currentMouseX < box.x + box.width &&
							currentMouseY > box.y &&
							currentMouseY < box.y + box.height
						) {
							ctx.beginPath();
							ctx.fillStyle = "white";
							ctx.arc(
								box.x + box.width / 2,
								box.y + box.height / 2,
								16,
								0,
								2 * Math.PI
							);
							ctx.fill();
							ctx.fillStyle = "black";
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.font = "400 16px Overpass";
							ctx.fillText(
								slot.date.getDate(),
								box.x + box.width / 2,
								box.y + box.height / 2,
								box.width
							);
						}
					}
					ctx.globalAlpha = oldAlpha;
				}
			}

			function renderWeekLevel(opacity) {
				let log = null;

				if (slot instanceof DaySlot) log = getLogForDay(slot.date);
				// console.log(log);
				if (log) {
					let oldAlpha = ctx.globalAlpha;
					ctx.globalAlpha = opacity;

					for (let [i, item] of log.entries()) {
						let block = blocksMap.value[item[0]];
						if (block) {
							ctx.fillStyle = block.color;
							ctx.fillRect(
								box.x,
								box.y + item[1] * box.height,
								box.width,
								(item[2] - item[1]) * box.height
							);

							if (
								log[i - 1] &&
								blocksMap.value[log[i - 1][0]].color ==
									block.color
							) {
								ctx.fillStyle = "rgba(255,255,255,0.2)";
								ctx.fillRect(
									box.x,
									box.y + item[1] * box.height,
									box.width,
									0.5
								);
							}

							if (
								slotTo &&
								zoomSmooth >= -1 &&
								(item[2] - item[1]) * box.height > 10
							) {
								ctx.font = `900 ${Math.min(
									16,
									(item[2] - item[1]) * box.height - 4
								)}px 'Font Awesome 6 Free'`;
								ctx.textAlign = "center";
								ctx.textBaseline = "middle";
								ctx.fillStyle = `rgba(255,255,255,${Math.min(
									1 + zoomSmooth,
									1
								)})`;
								// console.log(block.icon);
								let filterKey = filterIcon(
									block.icon || block.name
								);
								if (filterKey[2] == "b") {
									ctx.font = `900 ${Math.min(
										16,
										(item[2] - item[1]) * box.height - 4
									)}px 'Font Awesome 6 Brands'`;
								}
								ctx.fillText(
									String.fromCharCode(
										parseInt(`${charMap[filterKey]}`, 16)
									),
									box.x + box.width / 2,
									box.y +
										item[1] * box.height +
										((item[2] - item[1]) * box.height) / 2,
									box.width
								);

								if (
									zoomLevel.value >= 0 &&
									currentMouseX > box.x &&
									currentMouseX < box.x + box.width
								) {
									ctx.font = "400 16px Overpass";
									ctx.fillText(
										block.name,
										box.x + box.width / 2,
										box.y +
											20 +
											item[1] * box.height +
											((item[2] - item[1]) * box.height) /
												2,
										box.width
									);

									ctx.font = "400 14px Overpass";
									ctx.fillStyle = "rgba(255,255,255,0.7)";

									ctx.fillText(
										formatSeconds(
											(item[2] - item[1]) * 24 * 60 * 60
										),
										box.x + box.width / 2,
										box.y +
											35 +
											item[1] * box.height +
											((item[2] - item[1]) * box.height) /
												2,
										box.width
									);

									if (
										currentMouseY >
											box.y + item[1] * box.height &&
										currentMouseY <
											box.y + item[2] * box.height
									) {
										if (
											Math.abs(
												currentMouseY -
													(box.y +
														item[2] * box.height)
											) > 5 &&
											Math.abs(
												currentMouseY -
													(box.y +
														item[1] * box.height)
											) > 5
										) {
											ctx.fillStyle = "white";
											ctx.font =
												"900 16px 'Font Awesome 6 Free'";
											ctx.fillText(
												"\uf0c4",
												box.x + 10,
												currentMouseY
											);

											if (currentMouseX < box.x + 16) {
												blockTarget = {
													x: box.x,
													y:
														box.y +
														item[1] * box.height,
													width: box.width,
													height:
														(item[2] - item[1]) *
														box.height,
												};
											}
										} else {
											if (
												Math.abs(
													currentMouseY -
														(box.y +
															item[1] *
																box.height)
												) < 5
											) {
												snapMousePos =
													box.y +
													item[1] * box.height;
											} else {
												snapMousePos =
													box.y +
													item[2] * box.height;
											}
										}
									}
								}
							}
						} else {
							// console.log(blocks.value.find(b => b.id));
						}
					}

					ctx.globalAlpha = oldAlpha;
				}
			}

			if (zoomSmooth < -1) {
				renderYearLevel(ctx.globalAlpha);
				if (slotFrom && slotTo) {
					if (lerpValue != 0)
						renderMonthLevel(Math.min(lerpValue, ctx.globalAlpha));
				}
			} else if (zoomSmooth < 0) {
				renderMonthLevel(ctx.globalAlpha);
				if (slotFrom && slotTo) {
					if (lerpValue != 0)
						renderWeekLevel(Math.min(lerpValue, ctx.globalAlpha));
				}
			} else if (zoomSmooth >= 0) {
				renderWeekLevel(ctx.globalAlpha);
			}
			ctx.globalAlpha = 1;
			ctx.restore();

			// if (
			// 	currentMouseX > box.x &&
			// 	currentMouseX < box.x + box.width &&
			// 	currentMouseY > box.y &&
			// 	currentMouseY < box.y + box.height
			// ) {
			// 	closestDay = slot.date;
			// }
		}

		let primaryRenderSet = renderDaysFrom;
		if (lerpValue > 0.3) {
			primaryRenderSet = renderDaysTo;
		}

		if (mouseCheck && day in primaryRenderSet && slot.active) {
			let d = Math.sqrt(
				(mouseCheck.x - box.x - box.width / 2) ** 2 +
					(mouseCheck.y - box.y - box.height / 2) ** 2
			);

			if (d < closestDist && slot instanceof DaySlot) {
				closestDay = slot.date;
				closestDist = d;
			}

			if (mouseCheck.x > box.x && mouseCheck.x < box.x + box.width) {
				if (mouseCheck.y > box.y && mouseCheck.y < box.y + box.height) {
					clickableTarget = true;
				}
			}

			if (zoomSmooth >= 0 && slot instanceof DaySlot) {
				if (mouseCheck.x > box.x && mouseCheck.x < box.x + box.width) {
					let log = getLogForDay(slot.date);
					// console.log(log);
					if (log) {
						for (let [i, item] of log.entries()) {
							if (
								Math.abs(
									mouseCheck.y -
										(box.y + item[1] * box.height)
								) < 5
							) {
								if (log[i - 1] && log[i - 1].length > 3) {
									resizeTarget = true;
									resizeTime = log[i - 1][3];
									snapMousePos = box.y + item[1] * box.height;
								}
								blockTarget = {
									x: box.x,
									y: box.y + item[1] * box.height,
									width: box.width,
									height: (item[2] - item[1]) * box.height,
								};
							}

							if (!resizeTarget && mouseCheck.x < box.x + 16) {
								sliceTarget = true;
							}

							if (!resizeTarget && !sliceTarget) {
								let localBlockTarget = {
									x: box.x,
									y: box.y + item[1] * box.height,
									width: box.width,
									height: (item[2] - item[1]) * box.height,
								};
								let d = Math.sqrt(
									(mouseCheck.x -
										localBlockTarget.x -
										localBlockTarget.width / 2) **
										2 +
										(mouseCheck.y -
											localBlockTarget.y -
											localBlockTarget.height / 2) **
											2
								);
								if (d < 28 && log[i - 1]) {
									typeTarget = true;
									typeTime = log[i - 1][3];
								}
							}
						}
					}
				}
			}
		}
	}

	let ms = 0;

	if (doPaint && zoomSmooth >= 0) {
		let snapping =
			1 /
			(24 *
				Math.min(
					18,
					1 << Math.round(Math.sqrt(calendarScaleSmooth - 1))
				));
		let start = calendarYSmooth;
		let end = calendarYSmooth + (cnvsSize.y - 300) * calendarScaleSmooth;
		let screenStart = Math.max(start, 0);
		let screenEnd = Math.min(end, cnvsSize.y);

		// let startDayXS = calendarYSmooth + 780 * 1 * calendarScaleSmooth;
		let startDayX = Math.max(
			0,
			0 - calendarYSmooth / ((cnvsSize.y - 300) * calendarScaleSmooth)
		);
		let endDayX = Math.min(
			1,
			(cnvsSize.y - calendarYSmooth) /
				((cnvsSize.y - 300) * calendarScaleSmooth)
		);

		startDayX = Math.round(startDayX / snapping) * snapping;

		let mouseUseY = currentMouseY;
		if (snapMousePos != -1) {
			mouseUseY = snapMousePos;
		}
		let mousePosDay =
			(mouseUseY - calendarYSmooth) /
			((cnvsSize.y - 300) * calendarScaleSmooth);

		if (window.innerWidth > 900) {
			if (currentMouseX < 200 || currentMouseX > cnvsSize.x - 200) {
				mousePosDay = -1;
			}
		}

		let mousePosDayScreen =
			calendarYSmooth +
			(cnvsSize.y - 300) * mousePosDay * calendarScaleSmooth;

		let margin = 200;
		if (window.innerWidth < 900) {
			margin = 60;
		}

		for (let y = startDayX; y < endDayX; y += snapping) {
			let screenY =
				calendarYSmooth + (cnvsSize.y - 300) * y * calendarScaleSmooth;
			if (Math.abs(mousePosDayScreen - screenY) < 20) continue;

			ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
			if (darkMode) {
				ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
			}
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(margin, screenY);
			ctx.lineTo(cnvsSize.x - margin, screenY);
			ctx.stroke();

			let str = formatTimeClockMode(y * 24);
			ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
			if (darkMode) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			}
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			ctx.font = "16px Overpass";
			ctx.fillText(str, margin - 5, screenY);
		}

		if (mousePosDay >= 0 && mousePosDay <= 1) {
			let screenY =
				calendarYSmooth +
				(cnvsSize.y - 300) * mousePosDay * calendarScaleSmooth;
			ctx.strokeStyle = "rgba(119, 187, 255, 0.9)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			if (blockTarget) {
				ctx.moveTo(blockTarget.x + 13, screenY);
				ctx.lineTo(blockTarget.x + blockTarget.width, screenY);
			} else {
				ctx.moveTo(margin, screenY);
				ctx.lineTo(cnvsSize.x - margin, screenY);
			}
			ctx.stroke();

			let str = formatTimeClockMode(mousePosDay * 24);

			ctx.fillStyle = "rgba(119, 187, 255, 0.9)";
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			ctx.font = "16px Overpass";
			ctx.fillText(str, margin - 5, screenY);
		}
		// for (let i = start; i < end; i += snapping) {
		// 	// let currentSpot = (i + calendarYSmooth) * calendarScaleSmooth;

		// 	// ctx.strokeStyle = "black";
		// 	// ctx.lineWidth = 1;
		// 	// ctx.beginPath();
		// 	// ctx.moveTo(0, i);
		// 	// ctx.lineTo(cnvsSize.x, i);
		// 	// ctx.stroke();
		// 	console.log(i);
		// }

		if (snapMousePos != -1) {
			if (boxTarget && window.innerWidth < 900) {
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(
					boxTarget.x + boxTarget.width / 2,
					mouseUseY,
					20,
					0,
					2 * Math.PI
				);
				ctx.fill();
			}
		}
	}

	if (mouseCheck) {
		let mouseUseY = currentMouseY;
		if (snapMousePos != -1 && !mouseCheck.noSnap) {
			mouseUseY = snapMousePos;

			if (blockTarget) {
				let ox = blockTarget.x + blockTarget.width / 2;
				let oy = mouseUseY;
				let dx = mouseCheck.cx - ox;
				let dy = mouseCheck.cy - oy;
				let dist = Math.sqrt(dx * dx + dy * dy);
				mobileResize = dist < 20;
			}
		}
		let mousePosDay =
			(mouseUseY - calendarYSmooth) /
			((cnvsSize.y - 300) * calendarScaleSmooth);

		if (window.innerWidth < 900) {
		} else {
			if (currentMouseX < 200 || currentMouseX > cnvsSize.x - 200) {
				mousePosDay = -1;
			}
		}

		if (closestDay) {
			ms =
				startOfDay(closestDay).getTime() +
				mousePosDay * 24 * 60 * 60 * 1000;
			if (mousePosDay < 0) {
				ms = startOfDay(closestDay).getTime();
			}
			if (mousePosDay > 1) {
				ms = startOfDay(closestDay).getTime() + 24 * 60 * 60 * 1000;
			}
		}

		return {
			date: startOfDay(closestDay),
			resize: resizeTarget,
			slice: sliceTarget,
			clickable: clickableTarget,
			resizeTime,
			typeTarget,
			typeTime,
			ms,
			mobileResize,
		};
	}
}

function updateCanvasSize() {
	if (cnvs.value) {
		invalidateTransforms = true;

		ctx = cnvs.value.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		let ratio = window.devicePixelRatio;
		cnvs.value.width = Math.floor(window.innerWidth * ratio);
		cnvs.value.height = Math.floor(window.innerHeight * ratio);
		cnvs.value.style.width = window.innerWidth + "px";
		cnvs.value.style.height = window.innerHeight + "px";
		cnvsSize.x = window.innerWidth;
		cnvsSize.y = window.innerHeight;
		ctx.scale(ratio, ratio);
	}
}

let settled = true;

let targetedDate = focusDay.value;

let focusY = 0;

let calendarYSmooth = 1;
let calendarScaleSmooth = 1;

let mouseDown = false;
let mouseDownX = 0;
let mouseDownY = 0;
let currentMouseX = 0;
let currentMouseY = 0;
let calendarYDown = 0;

let targetedAction = {
	date: null,
	resize: false,
	resizeTime: 0,
	slice: false,
	targetMs: 0,
	typeTarget: false,
	typeTime: 0,
};

onMounted(() => {
	updateCanvasSize();

	window.addEventListener("resize", updateCanvasSize);

	let last = performance.now();
	function runPaint() {
		requestAnimationFrame(runPaint);

		if (!tabActive.value) {
			return;
		}

		let now = performance.now();
		let dt = now - last;
		last = now;

		let lerpSpeed = 0.018;

		calendarYSmooth = lerp(
			calendarYSmooth,
			calendarY.value,
			Math.max(Math.min(dt * lerpSpeed, 0.9), 0.0001)
		);
		calendarScaleSmooth = lerp(
			calendarScaleSmooth,
			calendarScale.value,
			Math.max(Math.min(dt * lerpSpeed, 0.9), 0.0001)
		);
		zoomSmooth = lerp(
			zoomSmooth,
			zoomLevel.value,
			Math.max(Math.min(dt * lerpSpeed, 0.9), 0.0001)
		);

		if (Math.abs(zoomSmooth - zoomLevel.value) < 0.001) {
			zoomSmooth = zoomLevel.value;
		}

		slideSmooth = lerp(
			slideSmooth,
			moveSlide.value,
			Math.max(Math.min(dt * lerpSpeed, 0.9), 0.0001)
		);

		if (!mouseDown) {
			if (slideSmooth >= 0.99) {
				if (zoomLevel.value == -2) {
					targetedDate = focusDay.value = addYears(focusDay.value, 1);
				} else if (zoomLevel.value == -1) {
					targetedDate = focusDay.value = addMonths(
						focusDay.value,
						1
					);
				} else if (zoomLevel.value == 0) {
					if (window.innerWidth < 900) {
						targetedDate = focusDay.value = addDays(
							focusDay.value,
							1
						);
					} else {
						targetedDate = focusDay.value = addWeeks(
							focusDay.value,
							1
						);
					}
				}
				moveSlide.value = 0;
				slideSmooth = 0;
			} else if (slideSmooth <= -0.99) {
				if (zoomLevel.value == -2) {
					targetedDate = focusDay.value = addYears(
						focusDay.value,
						-1
					);
				} else if (zoomLevel.value == -1) {
					targetedDate = focusDay.value = addMonths(
						focusDay.value,
						-1
					);
				} else if (zoomLevel.value == 0) {
					if (window.innerWidth < 900) {
						targetedDate = focusDay.value = addDays(
							focusDay.value,
							-1
						);
					} else {
						targetedDate = focusDay.value = addWeeks(
							focusDay.value,
							-1
						);
					}
				}
				moveSlide.value = 0;
				slideSmooth = 0;
			}
		}

		paint();
	}

	setInterval(() => {
		if (!mouseDown) {
			checkMousePosition(currentMouseX, currentMouseY);
		}

		if (document.documentElement.dataset.darkreaderScheme == "dark") {
			darkMode = true;
		} else {
			darkMode = false;
		}
	}, 400);

	let coolDown = 0;
	let clamZoomCooldown = zoomLevel.value;
	function clampZoom() {
		zoomLevel.value = Math.max(
			Math.min(zoomLevel.value, clamZoomCooldown + 1),
			clamZoomCooldown - 1
		);
		zoomLevel.value = Math.max(Math.min(zoomLevel.value, 3), -2);
	}

	setInterval(() => {
		if (coolDown > 0) {
			coolDown--;
			return;
		}

		if (zoomLevel.value <= 0) {
			zoomLevel.value = lerp(
				zoomLevel.value,
				Math.round(zoomLevel.value),
				1
			);
		}
		// moveSlide.value = lerp(moveSlide.value, Math.round(moveSlide.value), 1);

		if (
			Math.abs(Math.floor(zoomLevel.value) - zoomLevel.value) < 0.01 &&
			moveSlide.value == 0
		) {
			if (coolDown <= 0) {
				clamZoomCooldown = Math.floor(zoomLevel.value);
			}
			focusDay.value = targetedDate;
		}
	}, 100);

	function snapSlide() {
		moveSlide.value = Math.round(moveSlide.value);
	}

	runPaint();

	let mouseMoved = false;

	let doubleTapTimer = 0;
	let scaling = false;

	// cnvs.value.addEventListener("touchstart", async e => {
	// 	mouseDown = true;
	// 	mouseMoved = false;
	// 	mouseDownX = e.touches[0].clientX;
	// 	mouseDownY = e.touches[0].clientY;
	// 	calendarYDown = calendarY.value;
	// 	currentMouseX = mouseDownX;
	// 	currentMouseY = mouseDownY;
	// 	checkMousePosition(mouseDownX, mouseDownY);
	// 	console.log(new Date(targetedAction.targetMs));

	// 	if (Date.now() - doubleTapTimer < 240) {
	// 		executeSlice();
	// 	} else {
	// 		doubleTapTimer = Date.now();
	// 	}
	// });

	// cnvs.value.addEventListener("touchend", async e => {
	// 	mouseDown = false;
	// 	snapSlide();

	// 	// if (!mouseMoved) {
	// 	// 	zoomLevel.value += 1;
	// 	// }
	// });

	// cnvs.value.addEventListener("touchmove", async e => {
	// 	if (scaling) {
	// 		return;
	// 	}

	// 	focusY = e.touches[0].clientY;
	// 	let dx = e.touches[0].clientX - mouseDownX;
	// 	let dy = e.touches[0].clientY - mouseDownY;
	// 	if (dx * dx + dy * dy > 5) {
	// 		mouseMoved = true;
	// 	}
	// 	currentMouseX = e.touches[0].clientX;
	// 	currentMouseY = e.touches[0].clientY;

	// 	if (mouseDown && calendarScale.value > 1) {
	// 		calendarY.value = calendarYDown + dy;
	// 		calendarYSmooth = calendarY.value;
	// 		return;
	// 	}

	// 	if (Math.abs(Math.floor(zoomLevel.value) - zoomLevel.value) > 0.01) {
	// 		return;
	// 	}

	// 	if (mouseDown) {
	// 		moveSlide.value =
	// 			-1 * Math.min(0.998, Math.max(-0.998, dx / (cnvsSize.x / 2)));
	// 	}
	// });

	async function executeSlice() {
		let insertSliceAt = new Date(targetedAction.targetMs);
		let blockAt = await getBlockAt(insertSliceAt);
		writeLogEntry(insertSliceAt, blockAt);
		console.log();
	}
	let grabbingDown = false;
	cnvs.value.addEventListener("mousedown", async (e) => {
		grabbingDown = true;

		mouseDown = true;
		mouseDownX = e.clientX;
		mouseDownY = e.clientY;
		calendarYDown = calendarY.value;
		mouseMoved = false;

		if (targetedAction.slice) {
			executeSlice();
		} else if (targetedAction.resize) {
			let times = getNormalizedTimes(new Date(targetedAction.resizeTime));
			mutation.fromChunk = times[0];
			mutation.fromKey = times[1];
			mutation.toChunk = times[0];
			mutation.toKey = times[1];
		}
	});

	document.addEventListener("mouseup", (e) => {
		grabbingDown = false;
		mouseDown = false;

		if (scaling) return;
	});

	document.addEventListener("mouseleave", () => {
		mouseDown = false;
		grabbingDown = false;
		snapSlide();
	});

	// cnvs.value.addEventListener("click", () => {
	// 	zoomLevel.value += 1;
	// 	clampZoom();
	// });

	function checkMousePosition(x, y) {
		let {
			date,
			resize,
			slice,
			ms,
			resizeTime,
			clickable,
			typeTarget,
			typeTime,
		} = paint({
			x,
			y,
		});

		targetedAction.resize = resize;
		targetedAction.slice = slice;
		targetedAction.date = date;
		targetedAction.resizeTime = resizeTime;
		targetedAction.typeTarget = typeTarget;
		targetedAction.typeTime = typeTime;
		targetedAction.targetMs = ms;

		if (resize) {
			cnvs.value.style.cursor = "ns-resize";
		} else if (slice) {
			cnvs.value.style.cursor = "pointer";
		} else if (typeTarget) {
			cnvs.value.style.cursor = "pointer";
		} else if (clickable) {
			if (zoomSmooth < 0) {
				cnvs.value.style.cursor = "pointer";
			} else {
				if (swipeDown || grabbingDown) {
					cnvs.value.style.cursor = "grabbing";
				} else {
					cnvs.value.style.cursor = "grab";
				}
			}
		} else {
			if (swipeDown || grabbingDown) {
				cnvs.value.style.cursor = "grabbing";
			} else {
				cnvs.value.style.cursor = "grab";
			}
		}

		if (!mouseDown) {
			if (slideSmooth > 0.1) return;

			if (targetedAction.date) {
				targetedDate = targetedAction.date;
			}
		}
	}

	cnvs.value.addEventListener("mousemove", (e) => {
		focusY = e.clientY;
		let dx = e.clientX - mouseDownX;
		let dy = e.clientY - mouseDownY;
		currentMouseX = e.clientX;
		currentMouseY = e.clientY;
		mouseMoved = true;
		if (!mouseDown) {
			checkMousePosition(e.clientX, e.clientY);
		}

		// if (mouseDown && calendarScale.value > 1) {
		// 	calendarY.value = calendarYDown + dy;
		// 	calendarYSmooth = calendarY.value;
		// 	return;
		// }

		// if (Math.abs(Math.floor(zoomLevel.value) - zoomLevel.value) > 0.01) {
		// 	return;
		// }

		// if (mouseDown) {
		// 	moveSlide.value =
		// 		-1 * Math.min(0.998, Math.max(-0.998, dx / (cnvsSize.x / 2)));
		// }
	});

	centerCalendar();

	// document.addEventListener("gesturestart", function(e) {
	// 	e.preventDefault();
	// 	document.body.style.zoom = 0.99;
	// });

	// document.addEventListener("gesturechange", function(e) {
	// 	e.preventDefault();

	// 	document.body.style.zoom = 0.99;
	// });
	// document.addEventListener("gestureend", function(e) {
	// 	e.preventDefault();
	// 	document.body.style.zoom = 1;
	// });
	let swipeDown = false;
	let gestureDown = false;
	interact(cnvs.value)
		.styleCursor(false)
		.on("tap", function (event) {
			if (selectingType.value) {
				selectingType.value = false;
			}

			currentMouseX = event.clientX;
			currentMouseY = event.clientY;
			checkMousePosition(event.clientX, event.clientY);
			if (targetedAction.typeTarget) {
				nextTick(() => {
					selectingType.value = true;
					autoPos.value = {
						x: currentMouseX,
						y: currentMouseY + 10,
					};
				});
			}
			setTimeout(() => {
				console.log("tap zoom");
				if (zoomLevel.value < 0) {
					zoomLevel.value += 1;
				}
			}, 10);
			event.preventDefault();
		})
		.gesturable({
			styleCursor: false,
			listeners: {
				start(event) {
					gestureDown = true;
					scaling = true;
					isScaling = true;
					mouseDown = true;
					mouseMoved = false;
					mouseDownX = event.client.x;
					mouseDownY = event.client.y;
					calendarYDown = calendarY.value;
					currentMouseX = mouseDownX;
					currentMouseY = mouseDownY;
					checkMousePosition(mouseDownX, mouseDownY);
				},
				move(event) {
					// selectingType.value = false;
					let delta = event.ds;
					coolDown = 3;
					currentMouseX = event.client.x;
					currentMouseY = event.client.y;
					checkMousePosition(currentMouseX, currentMouseY);

					focusY = event.client.y;
					let dx = event.client.x - mouseDownX;
					let dy = event.client.y - mouseDownY;
					if (dx * dx + dy * dy > 5) {
						mouseMoved = true;
					}

					// if (calendarScale.value > 1) {
					// 	calendarY.value = calendarYDown + dy;
					// 	calendarYSmooth = calendarY.value;
					// }

					moveSlide.value =
						-1 *
						Math.min(
							0.998,
							Math.max(-0.998, dx / (cnvsSize.x / 2))
						);

					if (zoomLevel.value > 0) {
						{
							let py = event.client.y;
							console.log(py);
							let ty =
								(py - calendarY.value) / calendarScale.value;

							calendarScale.value -=
								event.ds * -1 * calendarScale.value;
							calendarScale.value = Math.min(
								90,
								Math.max(1, calendarScale.value)
							);

							calendarY.value = -ty * calendarScale.value + py;

							if (calendarScale.value <= 1.001) {
								zoomLevel.value = 0;
							} else {
								zoomLevel.value = 0.01;
							}

							centerCalendar();
						}
					} else {
						calendarScale.value = 1;

						zoomLevel.value += event.ds * 2;

						centerCalendar();
					}
					clampZoom();
				},
				end(event) {
					moveSlide.value = 0;
					isScaling = false;
					gestureDown = false;
					scaling = false;
					mouseDown = false;
					snapSlide();
				},
			},
		})
		.draggable({
			styleCursor: false,
			listeners: {
				start(event) {
					// selectingType.value = false;
					swipeDown = true;
					checkMousePosition(currentMouseX, currentMouseY);

					let { mobileResize } = paint({
						x: currentMouseX,
						y: currentMouseY,
						cx: event.client.x,
						cy: event.client.y,
					});

					if (mobileResize) {
						if (targetedAction.resize) {
							grabbingDown = true;

							mouseDown = true;
							mouseDownX = event.client.x;
							mouseDownY = event.client.x;
							calendarYDown = calendarY.value;
							mouseMoved = false;
							let times = getNormalizedTimes(
								new Date(targetedAction.resizeTime)
							);
							mutation.fromChunk = times[0];
							mutation.fromKey = times[1];
							mutation.toChunk = times[0];
							mutation.toKey = times[1];
						}
					}
				},
				move(event) {
					if (
						mouseDown &&
						!targetedAction.slice &&
						targetedAction.resize
					) {
						currentMouseX = event.client.x;
						currentMouseY = event.client.y;

						let { ms } = paint({
							x: event.client.x,
							y: event.client.y,
							noSnap: true,
						});
						console.log(event.client.y, ms);

						let bounds = getBlockBounds(
							new Date(targetedAction.resizeTime)
						);

						let minMs = chunkAndKeyToMs(
							bounds.min.chunk,
							bounds.min.key
						);
						let maxMs = chunkAndKeyToMs(
							bounds.max.chunk,
							bounds.max.key
						);

						if (isNaN(minMs)) {
							minMs = 0;
						}

						let times = getNormalizedTimes(
							new Date(Math.min(maxMs, Math.max(minMs, ms)))
						);

						if (ms >= maxMs) {
							mutation.toChunk = null;
							mutation.toKey = null;
						} else {
							mutation.toChunk = times[0];
							mutation.toKey = times[1];
						}

						return;
					}

					if (isScaling) {
						return;
					}
					let dx = event.client.x - event.clientX0;
					let dy = event.delta.y;

					if (calendarScale.value > 1) {
						calendarY.value += dy;
						calendarYSmooth = calendarY.value;
						return;
					}

					if (swipeDown && !gestureDown) {
						moveSlide.value =
							-1 *
							Math.min(
								0.998,
								Math.max(-0.998, dx / (cnvsSize.x / 2))
							);
					} else {
						moveSlide.value = 0;
					}
				},
				end() {
					mouseDown = false;

					if (
						targetedAction.resize &&
						mutation.fromChunk &&
						mutation.fromKey
					) {
						let block = getBlockAtExact(
							mutation.fromChunk,
							mutation.fromKey
						);
						writeLogEntry(
							new Date(
								chunkAndKeyToMs(
									mutation.fromChunk,
									mutation.fromKey
								)
							),
							deleteField()
						);
						if (mutation.toChunk) {
							writeLogEntry(
								new Date(
									chunkAndKeyToMs(
										mutation.toChunk,
										mutation.toKey
									)
								),
								block
							);
						}

						targetedAction.resize = false;
						mutation.fromChunk = null;
						mutation.fromKey = null;
						mutation.toChunk = null;
						mutation.toKey = null;
					} else {
					}
					swipeDown = false;
					snapSlide();
				},
			},
		});

	document.addEventListener(
		"wheel",
		(e) => {
			if (e.target != cnvs.value) {
				return;
			}
			selectingType.value = false;
			e.preventDefault();
			let delta = e.deltaY;
			coolDown = 3;

			if (zoomLevel.value > 0) {
				{
					let py = e.clientY;
					let ty = (py - calendarY.value) / calendarScale.value;

					calendarScale.value -=
						(e.deltaY / 1000) * calendarScale.value;
					calendarScale.value = Math.min(
						90,
						Math.max(1, calendarScale.value)
					);

					calendarY.value = -ty * calendarScale.value + py;

					if (calendarScale.value <= 1.001) {
						zoomLevel.value = 0;
					} else {
						zoomLevel.value = 0.01;
					}

					centerCalendar();
				}
			} else {
				calendarScale.value = 1;

				if (delta > 0) {
					zoomLevel.value -= 0.25;
				} else {
					zoomLevel.value += 0.25;
				}

				centerCalendar();
			}

			clampZoom();
		},
		{ passive: false }
	);
});
</script>

<template>
	<canvas ref="cnvs"></canvas>
	<Dialog v-if="selectingType" :auto="autoPos">
		<Selector
			@update:modelValue="updateTargetType($event.id)"
			:data="blocks"
		></Selector>
	</Dialog>
</template>
