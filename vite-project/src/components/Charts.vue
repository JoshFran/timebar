<script setup>
import {
	computed,
	nextTick,
	onMounted,
	reactive,
	ref,
	toRef,
	watch,
} from "vue";

import "../roundRect.js";
import {
	format,
	getDay,
	getTime,
	getWeek,
	startOfWeek,
	endOfWeek,
	subWeeks,
	addWeeks,
	endOfDay,
	startOfDay,
	subDays,
	addDays,
	subMonths,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	subYears,
	isWeekend,
	getWeekOfMonth,
} from "date-fns";

import interact from "interactjs";

import charMap from "../unicode.js";

import { filterIcon } from "../iconer.js";

import Selector from "./Selector.vue";
import InputBlocks from "./InputBlocks.vue";
import Dialog from "./Dialog.vue";

import {
	DoughnutChart,
	useDoughnutChart,
	BarChart,
	LineChart,
} from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import invert from "invert-color";

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

import { formatSecondsUpToHours } from "../time.js";
import LogRange from "../LogRange";
import { getLogItemsInRange } from "../api";
import InputProxyBlock from "./InputProxyBlock.vue";
import ClockCanvas from "./ClockCanvas.vue";
import SparkLine from "./SparkLine.vue";
import WeekCanvas from "./WeekCanvas.vue";
import WeekAverageCanvas from "./WeekAverageCanvas.vue";
import FrequencyChart from "./FrequencyChart.vue";
import Icon from "./Icon.vue";
import { getWeekYear } from "date-fns/esm";
import Log from "./Log.vue";

Chart.register(ChartDataLabels);
Chart.register(...registerables);

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const rangeIndex = ref(0);

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

function formatToDDMMMYYYY(date) {
	return format(date, "dd MMM yyyy");
}
let dateValue = ref([
	formatToDDMMMYYYY(subDays(startOfDay(new Date()), 7)),
	formatToDDMMMYYYY(endOfDay(new Date())),
]);

function getNow() {
	return Date.now();
}

function getRanges() {
	let minTime = user ? parseInt(user.metadata.createdAt) : getNow();
	console.log(user);
	let maxTime = getNow();
	let ranges = [
		{
			name: "Today",
			start: Math.max(getTime(startOfDay(new Date())), minTime),
			end: Math.min(getTime(endOfDay(new Date())), maxTime),
		},
		{
			name: "Yesterday",
			start: Math.max(
				getTime(startOfDay(subDays(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfDay(subDays(new Date(), 1))), maxTime),
		},
		{
			name: "This Week",
			start: Math.max(getTime(startOfWeek(new Date())), minTime),
			end: Math.min(getTime(endOfWeek(new Date())), maxTime),
		},
		{
			name: "Last Week",
			start: Math.max(
				getTime(startOfWeek(subWeeks(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfWeek(subWeeks(new Date(), 1))), maxTime),
		},
		{
			name: "This Month",
			start: Math.max(getTime(startOfMonth(new Date())), minTime),
			end: Math.min(getTime(endOfMonth(new Date())), maxTime),
		},
		{
			name: "Last Month",
			start: Math.max(
				getTime(startOfMonth(subMonths(new Date(), 1))),
				minTime
			),
			end: Math.min(
				getTime(endOfMonth(subMonths(new Date(), 1))),
				maxTime
			),
		},
		{
			name: "This Year",
			start: Math.max(getTime(startOfYear(new Date())), minTime),
			end: Math.min(getTime(endOfYear(new Date())), maxTime),
		},
		{
			name: "Last Year",
			start: Math.max(
				getTime(startOfYear(subYears(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfYear(subYears(new Date(), 1))), maxTime),
		},
		{
			name: "All Time",
			start: Math.max(getTime(new Date(0)), minTime),
			end: Math.min(getTime(new Date()), maxTime),
		},
	];
	return ranges;
}

const autoPos = ref({ x: 0, y: 0 });

const tabActive = computed(() => props.active);

const filterActive = ref(false);

const whitelistEnabled = ref(false);
const whitelist = ref([]);
const blacklistEnabled = ref(false);
const blacklist = ref([]);
const merging = ref([]);

function isSleep(block) {
	return (
		block.icon == "bed" ||
		block.name.toLowerCase() == "sleep" ||
		block.name.toLowerCase() == "sleeping" ||
		block.name.toLowerCase() == "bed"
	);
}

function normalizeToDay(time) {
	let start = startOfDay(time);
	return (time.getTime() - start.getTime()) / 1000;
}

function daySecondsTo12Hour(seconds) {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds % 3600) / 60);
	let ampm = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	return hours + ":" + minutes + ampm;
}

function daySecondsToRadians(seconds) {
	return (seconds / (24 * 60 * 60)) * 2 * Math.PI;
}
function radiansToDaySeconds(rad) {
	return (rad / (2 * Math.PI)) * 24 * 60 * 60;
}

function angularDistanceWithDirection(a, b) {
	let dist = a - b;
	if (dist < 0) {
		dist = -dist;
	}
	if (dist > Math.PI) {
		dist = 2 * Math.PI - dist;
	}
	return dist;
}

class WeekAccumulator {
	constructor() {
		this.main = new TimeAccumulator("duration");
		this.daysOfWeek = [];
		for (let i = 0; i < 7; i++) {
			this.daysOfWeek.push(new TimeAccumulator("duration"));
		}
	}

	add(dateStart, dateEnd, time) {
		this.main.add(time);
		this.main.addDay(dateStart, dateEnd);

		this.daysOfWeek[dateStart.getDay()].add(time);
		this.daysOfWeek[dateStart.getDay()].addDay(dateStart, dateEnd);
	}

	getMainStats() {
		return this.main.getStats();
	}

	getDayOfWeekStats() {
		return this.daysOfWeek.map((day) => day.getStats());
	}
}

function maxDayAverage(days) {
	let max = 0;
	for (let i = 0; i < days.length; i++) {
		let day = days[i];
		if (day.dayAverage > max) {
			max = day.dayAverage;
		}
	}
	return max;
}

function dateToKey(date) {
	return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

function dateToWeekKey(date) {
	let start = startOfWeek(date);
	return dateToKey(start);
}
class TimeAccumulator {
	constructor(type) {
		this.type = type;
		this.totalX = 0;
		this.totalY = 0;
		this.samples = [];
		this.rawSamples = [];
		this.timestamps = [];
		this.timestampsEnd = [];
		this.buckets = [];
	}

	addDay(dateStart, dateEnd) {
		this.timestamps.push(dateStart);
		this.timestampsEnd.push(dateEnd);
	}

	add(time) {
		if (this.type == "clock") {
			let rad = daySecondsToRadians(time);
			this.samples.push(rad);
			this.rawSamples.push(time);
			let x = Math.cos(rad);
			let y = Math.sin(rad);
			this.totalX += x;
			this.totalY += y;
		} else {
			this.samples.push(time);
			this.totalX += time;
		}
	}

	getStats() {
		if (this.type == "clock") {
			let maxDistUp = 0;
			let maxDistDown = 0;

			let mode = {};
			let snappingInterval = 60 * 10;
			let roundedToRadians = daySecondsToRadians(snappingInterval);
			let roundToInterval = (time) => {
				return Math.round(time / snappingInterval) * snappingInterval;
			};

			let avgX = this.totalX / this.samples.length;
			let avgY = this.totalY / this.samples.length;
			let rad = Math.atan2(avgY, avgX);
			if (rad < 0) {
				rad += 2 * Math.PI;
			}

			for (let [i, s] of this.samples.entries()) {
				let rounded = roundToInterval(this.rawSamples[i]);
				if (mode[rounded] == undefined) {
					mode[rounded] = 0;
				}
				mode[rounded]++;
				let dist = angularDistanceWithDirection(s, rad);
				if (dist > 0) {
					maxDistUp = Math.max(maxDistUp, dist);
				} else {
					maxDistDown = Math.min(maxDistDown, dist);
				}
			}

			let modeRad = null;
			let modeCount = -Infinity;
			for (let [rad, count] of Object.entries(mode)) {
				if (count > modeCount) {
					modeRad = rad;
					modeCount = count;
				}
			}

			return {
				samples: this.samples,
				average: radiansToDaySeconds(rad),
				mode: modeRad,

				maxDistUp: radiansToDaySeconds(maxDistUp),
				maxDistDown: radiansToDaySeconds(maxDistDown),
				divergence: radiansToDaySeconds((maxDistUp + maxDistDown) / 2),
			};
		} else {
			let avg = this.totalX / this.samples.length;
			let maxDistUp = 0;
			let maxDistDown = 0;
			let min = Infinity;
			let minDay = null;
			let max = -Infinity;
			let maxDay = null;
			let dayBuckets = {};
			let weekBuckets = {};
			for (let [i, s] of this.samples.entries()) {
				if (s > max) {
					max = s;
					maxDay = this.timestamps[i];
				}
				if (s < min) {
					min = s;
					minDay = this.timestamps[i];
				}
				let dist = s - avg;
				if (dist > 0) {
					maxDistUp = Math.max(maxDistUp, dist);
				} else {
					maxDistDown = Math.min(maxDistDown, dist);
				}
				let dateKeyStart = dateToKey(this.timestamps[i]);

				let dateKeyEnd = dateToKey(this.timestampsEnd[i]);
				if (dateKeyStart != dateKeyEnd) {
					let endOfFirstDay = endOfDay(this.timestamps[i]);
					let startOfLastDay = startOfDay(this.timestampsEnd[i]);
					let firstDaySeconds =
						(endOfFirstDay - this.timestamps[i]) / 1000;
					let lastDaySeconds =
						(this.timestampsEnd[i] - startOfLastDay) / 1000;

					if (dayBuckets[dateKeyStart] == undefined) {
						dayBuckets[dateKeyStart] = 0;
					}
					dayBuckets[dateKeyStart] += firstDaySeconds;
					if (dayBuckets[dateKeyEnd] == undefined) {
						dayBuckets[dateKeyEnd] = 0;
					}
					dayBuckets[dateKeyEnd] += lastDaySeconds;
				} else {
					if (dayBuckets[dateKeyStart] == undefined) {
						dayBuckets[dateKeyStart] = 0;
					}
					dayBuckets[dateKeyStart] += s;
				}

				let weekKey = dateToWeekKey(this.timestamps[i]);

				let weekKeyEnd = dateToWeekKey(this.timestampsEnd[i]);
				if (weekKey != weekKeyEnd) {
					let endOfFirstWeek = endOfWeek(this.timestamps[i]);
					let startOfLastWeek = startOfWeek(this.timestampsEnd[i]);
					let firstWeekSeconds =
						(endOfFirstWeek - this.timestamps[i]) / 1000;
					let lastWeekSeconds =
						(this.timestampsEnd[i] - startOfLastWeek) / 1000;

					if (weekBuckets[weekKey] == undefined) {
						weekBuckets[weekKey] = 0;
					}
					weekBuckets[weekKey] += firstWeekSeconds;
					if (weekBuckets[weekKeyEnd] == undefined) {
						weekBuckets[weekKeyEnd] = 0;
					}
					weekBuckets[weekKeyEnd] += lastWeekSeconds;
				} else {
					if (weekBuckets[weekKey] == undefined) {
						weekBuckets[weekKey] = 0;
					}
					weekBuckets[weekKey] += s;
				}
			}

			let dayMaxDay = null;
			let dayAverage = 0;
			let workDayAverage = 0;
			let workDayCount = 0;
			let maxDayReal = -Infinity;
			for (let i in dayBuckets) {
				let date = new Date(i);
				dayAverage += dayBuckets[i];

				if (!isWeekend(date)) {
					workDayAverage += dayBuckets[i];
					workDayCount++;
				}

				if (dayBuckets[i] > maxDayReal) {
					maxDayReal = dayBuckets[i];
					dayMaxDay = date;
				}
			}
			dayAverage /= Object.keys(dayBuckets).length;

			let weekAverage = 0;
			let maxWeek = -Infinity;
			let maxWeekDay = null;
			if (Object.keys(weekBuckets).length > 40) {
				console.log(Object.keys(weekBuckets).length, weekBuckets);
			}
			for (let i in weekBuckets) {
				weekAverage += weekBuckets[i];
			}
			weekAverage /= Object.keys(weekBuckets).length;
			if (Object.keys(weekBuckets).length > 40) {
				console.log(weekAverage / (60 * 60));
			}

			return {
				samples: this.samples,
				average: avg,
				max,
				min,
				maxDay,
				minDay,
				dayAverage,
				weekAverage,
				workDayAverage: workDayAverage / workDayCount,
				dayMax: maxDayReal,
				dayMaxDay,
				divergence: (maxDistUp + maxDistDown) / 2,
			};
		}
	}
}

const dayStats = computed(() => {
	let bedtime = new TimeAccumulator("clock");
	let waketime = new TimeAccumulator("clock");
	let sleep = new WeekAccumulator();
	let sleepCount = 0;
	for (let i of rangeData.value) {
		let normalizedStart = normalizeToDay(i[1]);
		let normalizedEnd = normalizeToDay(i[2]);
		let duration = (i[2].getTime() - i[1].getTime()) / 1000;
		let b = getBlockById(i[0]);
		if (isSleep(b) && duration > 60 * 60 * 4) {
			sleep.add(i[1], i[2], (i[2] - i[1]) / 1000);

			bedtime.add(normalizedStart);
			waketime.add(normalizedEnd);
			sleepCount++;
		}
	}

	let a = sleep.getDayOfWeekStats();
	console.log(a);
	return {
		bedtime: bedtime.getStats(),
		waketime: waketime.getStats(),
		sleep: sleep.getMainStats(),
		weekSleep: a,
	};
});

const stackedChart = computed(() => {
	let interval = "week";

	let rangeDur = dateRange.value.end - dateRange.value.start;
	if (rangeDur < 1000 * 60 * 60 * 24 * 60) {
		interval = "day";
	} else {
		interval = "week";
	}

	function getStartAndEndOfInterval(date) {
		if (interval == "day") {
			let w = startOfDay(date);
			return [w.getTime(), endOfDay(new Date(w)).getTime()];
		} else if (interval == "week") {
			let w = startOfWeek(date);
			return [w.getTime(), endOfWeek(new Date(w)).getTime()];
		} else if (interval == "month") {
			let w = startOfMonth(date);
			return [w.getTime(), endOfMonth(new Date(w)).getTime()];
		}
	}

	let start = dateRange.value.start.getTime();
	let keys = {};
	let colors = {};
	let colorToKeys = {};

	let end = dateRange.value.end.getTime();
	let items = rangeDataFiltered.value;
	let buckets = {};
	function addBucketTime(bucketId, blockId, time) {
		keys[blockId] = (keys[blockId] || 0) + time;
		let bl = getBlockById(blockId);
		colors[bl.color] = (colors[bl.color] || 0) + time;

		colorToKeys[bl.color] = colorToKeys[bl.color] || {};
		colorToKeys[bl.color][blockId] = true;

		if (!buckets[bucketId]) {
			buckets[bucketId] = {};
		}
		if (!buckets[bucketId][blockId]) {
			buckets[bucketId][blockId] = 0;
		}
		buckets[bucketId][blockId] += time;
	}
	for (let item of items) {
		let realStart = Math.max(item[1], start);
		let realEnd = Math.min(item[2], end);
		let currentBucket = getStartAndEndOfInterval(new Date(realStart));

		if (realEnd < currentBucket[1]) {
			let duration = (realEnd - realStart) / 1000;

			addBucketTime(currentBucket[0], item[0], duration);
		} else {
			let duration = (currentBucket[1] - realStart) / 1000;
			addBucketTime(currentBucket[0], item[0], duration);
			let remaining = (realEnd - currentBucket[1]) / 1000;
			while (remaining > 0) {
				currentBucket = getStartAndEndOfInterval(
					new Date(currentBucket[1] + 60 * 60 * 20)
				);
				let duration = Math.min(
					remaining,
					currentBucket[1] - currentBucket[0]
				);
				addBucketTime(currentBucket[0], item[0], duration);
				remaining -= duration;
			}
		}
	}

	let sortedKeys = Object.keys(buckets)
		.map((x) => parseInt(x))
		.sort((a, b) => a - b);
	let sortedBuckets = sortedKeys.map((x) => buckets[x]);
	let orderedItems = [];
	for (let c of Object.keys(colors).sort((a, b) => {
		return colors[b] - colors[a];
	})) {
		for (let k of Object.keys(colorToKeys[c]).sort((a, b) => {
			return keys[b] - keys[a];
		})) {
			orderedItems.push(k);
		}
	}
	let datasets = orderedItems.map((k) => {
		let block = getBlockById(k);
		let biggestIndex = 0;
		let biggestValue = 0;
		let totals = [];
		for (let i = 0; i < sortedBuckets.length; i++) {
			let total = 0;
			for (let j = 0; j < orderedItems.length; j++) {
				total += sortedBuckets[i][orderedItems[j]] / (60 * 60) || 0;
			}
			totals.push(total);
		}
		// for (let i = 1; i < sortedBuckets.length - 1; i++) {
		// 	if (sortedBuckets[i][k] > biggestValue) {
		// 		biggestIndex = i;
		// 		biggestValue = sortedBuckets[i][k];
		// 	}
		// }
		biggestIndex = Math.floor(sortedBuckets.length / 2);
		return {
			cubicInterpolationMode: "monotone",
			tension: 0.4,
			label: block.name,
			id: k,
			backgroundColor: block.color,
			borderColor: "white",
			biggestIndex,
			totals,
			data: sortedBuckets.map((x) => x[k] / (60 * 60) || 0),
			fill: true,
		};
	});

	let d = {
		valid: Object.keys(keys).length > 0,
		data: {
			labels: sortedKeys.map((x) => new Date(x).toLocaleDateString()),
			datasets,
		},
		options: {
			interaction: {
				intersect: false,
				mode: "nearest",
			},
			pointStyle: false,
			pointRadius: 0,
			borderWidth: 1,
			responsive: true,
			plugins: {
				datalabels: {
					padding: {
						left: 40,
					},
					align: "bottom",
					offset: 0,
					font(context) {
						let width = context.chart.width;
						let size = Math.round(width / 32);
						let b = getBlockById(context.dataset.id);
						let filterKey = filterIcon(b.icon || b.name);
						let f = '"Font Awesome 6 Free"';
						if (filterKey[2] == "b") {
							f = '"Font Awesome 6 Brands"';
						}
						let scale =
							context.dataset.biggestIndex == context.dataIndex
								? 1
								: 0; //context.dataset.sizes[context.dataIndex];
						let ratio =
							context.dataset.data[context.dataIndex] /
							context.dataset.totals[context.dataIndex];

						return {
							family: f,
							weight: "900",
							size:
								ratio < 0.01
									? 0
									: Math.min(scale * ratio * 250, 18),
						};
					},
					color(context) {
						return "#fff";
					},
					formatter: (value, context) => {
						let b = getBlockById(context.dataset.id);
						let filterKey = filterIcon(b.icon || b.name);
						return String.fromCharCode(
							parseInt(`${charMap[filterKey]}`, 16)
						);
					},
				},
				title: {
					display: false,
					text: (ctx) => "c",
				},
				legend: {
					display: false,
				},
			},
			label: { display: false },
			scales: {
				x: {
					title: {
						display: false,
						text: "Month",
					},
				},
				y: {
					stacked: true,
					display: true,
					title: {
						display: false,
						text: "Value",
					},
					// min: 0,
				},
			},
		},
	};
	rangeIndex.value++;
	return d;
});

function sumLog(items, start, end) {
	start = start.getTime();
	end = end.getTime();
	let blocks = {};
	for (let item of items) {
		let realStart = Math.max(item[1], start);
		let realEnd = Math.min(item[2], end);
		let duration = (realEnd - realStart) / 1000;
		if (blocks[item[0]]) blocks[item[0]] += duration;
		else blocks[item[0]] = duration;
	}

	return blocks;
}

function getBlockById(id) {
	if (!id)
		return {
			name: "Unknown",
			color: "#000000",
			icon: "times",
		};

	if (id[0] == "!") {
		id = parseInt(id.substring(1));
		return (
			merging.value[id]?.to || {
				name: "Unknown",
				color: "#000000",
				icon: "times",
			}
		);
	}

	return blocksMap.value[id];
}

let pieData = computed(() => {
	let data = sumLog(
		rangeDataFiltered.value,
		dateRange.value.start,
		dateRange.value.end
	);
	let labels = Object.keys(data).sort((a, b) => {
		let c1 = getBlockById(a);
		let c2 = getBlockById(b);
		if (c1 && c2) {
			return c1.color.localeCompare(c2.color);
		}
	});
	let labelsData = labels.map((l) => {
		if (l == "blank") {
			return "blank";
		}
		let b = getBlockById(l);
		if (b) return b.name;
		return "Unknown";
	});
	let colorData = labels.map((l) => {
		if (l == "blank") {
			return "#fff";
		}
		let b = getBlockById(l);
		if (b) return b.color;
		return "#fff";
	});
	let numData = labels.map((l) => data[l]);
	let sum = numData.reduce((a, b) => a + b, 0);
	let sizes = labels.map((l) => data[l] / sum);

	return {
		labels: labelsData,
		datasets: [
			{
				labels: labelsData,
				ids: labels,
				sizes,
				data: numData,
				backgroundColor: colorData,
			},
		],
	};
});

const chartOptions = ref({
	responsive: true,
	borderWidth: 1,

	plugins: {
		tooltip: {
			callbacks: {
				label: function (context) {
					return (
						" " +
						context.label +
						" " +
						formatSecondsUpToHours(
							context.dataset.data[context.dataIndex]
						)
					);
				},
			},
		},
		datalabels: {
			clamp: true,
			font(context) {
				let width = context.chart.width;
				let size = Math.round(width / 32);
				let b = getBlockById(context.dataset.ids[context.dataIndex]);
				let filterKey = filterIcon(b.icon || b.name);
				let f = '"Font Awesome 6 Free"';
				if (filterKey[2] == "b") {
					f = '"Font Awesome 6 Brands"';
				}
				let percent = context.dataset.sizes[context.dataIndex];
				return {
					family: f,
					weight: "900",
					size: percent < 0.01 ? 0 : Math.min(percent * 500, 18),
				};
			},
			color(context) {
				return "#fff";
				return invert(
					context.dataset.backgroundColor[context.dataIndex],
					true
				);
			},
			formatter: (value, context) => {
				let b = getBlockById(context.dataset.ids[context.dataIndex]);
				let filterKey = filterIcon(b.icon || b.name);
				return String.fromCharCode(
					parseInt(`${charMap[filterKey]}`, 16)
				);
			},
			display: true,
		},
		legend: {
			position: "top",
			display: false,
		},
		title: {
			display: false,
			text: "Activity Distribution",
		},
	},
});

let rangeData = ref([]);

function doMerge(item) {
	let copy = [...item];
	for (let [i, m] of merging.value.entries()) {
		if (m.from.find((f) => f.id == item[0])) {
			copy[0] = `!${i}`;
		}
	}
	return copy;
}

let rangeDataFiltered = computed(() => {
	let items = [];
	for (let item of rangeData.value) {
		if (whitelistEnabled.value) {
			if (whitelist.value.find((b) => b.id == item[0])) {
				items.push(doMerge(item));
			}
		} else if (blacklistEnabled.value) {
			if (!blacklist.value.find((b) => b.id == item[0])) {
				items.push(doMerge(item));
			}
		} else {
			items.push(doMerge(item));
		}
	}

	return items;
});

let dateRange = computed(() => {
	let start = new Date(dateValue.value[0]);
	let end = new Date(
		Math.min(Date.now(), endOfDay(new Date(dateValue.value[1])).getTime())
	);

	return {
		start: start,
		end: end,
	};
});

function refresh() {
	let start = new Date(dateValue.value[0]);
	let end = endOfDay(new Date(dateValue.value[1]));

	getLogItemsInRange(start, end).then((a) => {
		rangeData.value = a;
		console.log("Range data rea", a);
	});
}

let grabs = ref([
	{
		search: ["basket ball"],
	},
	{
		search: [
			"ping pong",
			"chess",

			"minigolf",
			"boardgames",
			"billiards",

			"sports",
		],
	},
	{
		search: ["working", "cooking"],
	},
	{
		search: ["tv", "youtube", "gaming"],
	},
	{
		search: ["brushing", "driving", "packing"],
	},
	{
		search: ["beach", "outdoors", "biking", "skating", "skiing"],
	},
	{
		search: [
			"shower",
			"groceries",
			"shopping",
			"cleaning",
			"dishes",
			"packing",
		],
	},
	{
		search: [
			"reddit",
			"facebook",
			"twitter",
			"internet",
			"discord",
			"visiting",
		],
	},
]);

watch([dateValue], () => {
	refresh();
});

let blocks = computed(() => {
	let result = props.blocks.reduce((res, obj) => {
		if (res[obj.color]) res[obj.color].push(obj);
		else res[obj.color] = [obj];
		return res;
	}, {});
	return Object.values(result).flat();
});

let blockTotals = computed(() => {
	let totals = {};

	for (let i of rangeDataFiltered.value) {
		let b = getBlockById(i[0]);
		if (isSleep(b)) continue;
		let normalizedStart = normalizeToDay(i[1]);
		let normalizedEnd = normalizeToDay(i[2]);
		let duration = (i[2].getTime() - i[1].getTime()) / 1000;
		if (!totals[b.id]) {
			totals[b.id] = {
				week: new WeekAccumulator(),
				clockStart: new TimeAccumulator("clock"),
				clockEnd: new TimeAccumulator("clock"),
				clockMid: new TimeAccumulator("clock"),
				totalTime: 0,
				totalSamples: 0,
			};
		}
		totals[b.id].week.add(i[1], i[2], (i[2] - i[1]) / 1000);
		totals[b.id].clockStart.add(normalizedStart);
		totals[b.id].clockEnd.add(normalizedEnd);
		totals[b.id].clockMid.add((normalizedEnd + normalizedStart) / 2);
		totals[b.id].totalTime += duration;
		totals[b.id].totalSamples++;
	}

	let result = Object.keys(totals).map((k) => ({
		id: k,
		block: getBlockById(k),
		week: totals[k].week.getDayOfWeekStats(),
		main: totals[k].week.getMainStats(),
		clockStart: totals[k].clockStart.getStats(),
		clockEnd: totals[k].clockEnd.getStats(),
		clockMid: totals[k].clockMid.getStats(),
		totalTime: totals[k].totalTime,
		totalSamples: totals[k].totalSamples,
		averageDuration: totals[k].totalTime / totals[k].totalSamples,
	}));

	return result.sort((a, b) => b.totalTime - a.totalTime);
});

function findBlock(name) {
	return blocks.value.find((b) => b.name.toLowerCase() == name.toLowerCase());
}

onMounted(() => {
	if (false) {
		merging.value = [
			{
				from: [findBlock("working"), findBlock("work self")],
				to: {
					id: "!0",
					icon: "briefcase",
					name: "Working",
					color: "#8bc34a",
				},
			},
		];

		let colors = {};
		console.log(blocks.value);
		for (let b of blocks.value) {
			console.log(b);
			if (!colors[b.color]) colors[b.color] = [];
			colors[b.color].push(b);
		}

		for (let c of Object.keys(colors)) {
			if (colors[c].length >= 1) {
				merging.value.push({
					from: colors[c],
					to: {
						id: "!" + (merging.value.length + 1),
						icon: colors[c][0].icon || colors[c][0].name,
						name: c,
						color: c,
					},
				});
			}
		}
	}

	for (let g of grabs.value) {
		g.filter = computed(() => {
			return [
				...blocks.value.filter((b) => {
					return g.search.find((s) => {
						return b.name.toLowerCase() == s.toLowerCase();
					});
				}),
				...merging.value
					.filter((m) => {
						return g.search.find((s) => {
							return m.to.name.toLowerCase() == s.toLowerCase();
						});
					})
					.map((m) => m.to),
			];
		});
	}
	console.log("Grabs", grabs.value);

	refresh();
});
</script>

<template>
	<div class="overflow-auto space-y-4 pb-40">
		<!-- <div class="panel"> -->
		<!-- <div class="select-bar cursor-pointer"> -->
		<div class="p-4 max-w-[400px] flex flex-row mx-auto">
			<litepie-datepicker
				v-model="dateValue"
				separator=" — "
				:formatter="{
					date: 'DD MMM YYYY',
					month: 'MMM',
				}"
				:shortcuts="
					() =>
						getRanges().map((range) => ({
							label: range.name,
							atClick: () => {
								return [
									new Date(range.start),
									new Date(range.end),
								];
							},
						}))
				"
			></litepie-datepicker>
			<button
				@click="filterActive = !filterActive"
				class="ml-2 rounded-full p-2 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] flex items-center justify-center hover:bg-gray-600 hover:bg-opacity-50"
			>
				<i class="fas fa-filter"></i>
			</button>

			<div
				class="filter-modal modal"
				@click="
					$event.target.classList.contains('modal')
						? (filterActive = false)
						: null
				"
				:class="{ open: filterActive }"
			>
				<div
					class="modal-content p-10 space-y-4 overflow-auto pb-40"
					style="justify-content: start"
				>
					<div class="w-80 max-w-80">
						<p>Filters</p>
					</div>
					<div class="w-80 max-w-80">
						<p>
							<input
								type="checkbox"
								class="mr-2"
								v-model="whitelistEnabled"
							/>
							<span
								:class="{
									'opacity-25 pointer-events-none':
										!whitelistEnabled,
								}"
								>Whitelist</span
							>
						</p>
						<div
							:class="{
								'opacity-25 pointer-events-none':
									!whitelistEnabled,
							}"
						>
							<InputBlocks v-model="whitelist"></InputBlocks>
						</div>
					</div>
					<div class="w-80 max-w-80">
						<p>
							<input
								type="checkbox"
								class="mr-2"
								v-model="blacklistEnabled"
							/>
							<span
								:class="{
									'opacity-25 pointer-events-none':
										!blacklistEnabled,
								}"
								>Blacklist</span
							>
						</p>
						<div
							:class="{
								'opacity-25 pointer-events-none':
									!blacklistEnabled,
							}"
						>
							<InputBlocks v-model="blacklist"></InputBlocks>
						</div>
					</div>
					<div class="w-80 max-w-80">
						<p>Merging</p>

						<template v-for="(m, i) in merging">
							<div
								class="border-gray-200 p-2 rounded-lg border relative mb-8"
							>
								<InputBlocks v-model="m.from"></InputBlocks>
								<div>=</div>
								<InputProxyBlock
									v-model="m.to"
								></InputProxyBlock>
								<button
									@click="merging.splice(i, 1)"
									class="absolute -top-5 -right-5 bg-red-400 rounded-full w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 flex items-center justify-center hover:bg-gray-600 hover:bg-red-500"
								>
									<i class="fas fa-times"></i>
								</button>
							</div>
						</template>

						<button
							@click="
								merging.push({
									from: [],
									to: {
										icon: 'circle-outline',
										name: 'Untitled',
										color: '#2196f3',
									},
								})
							"
							class="ml-2 mt-2 bg-gray-100 rounded-full p-2 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] flex items-center justify-center hover:bg-gray-600 hover:bg-opacity-50"
						>
							<i class="fas fa-add"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<div
			class="chart-row grid grid-cols-1 lg:grid-cols-12 gap-4 w-full px-4 lg:px-10"
		>
			<div
				class="chart bg-white rounded-lg p-4 col-span-1 lg:col-span-4 aspect-square flex items-center justify-center"
			>
				<DoughnutChart
					:options="chartOptions"
					class="chart"
					:chartData="pieData"
				/>
			</div>
			<div
				class="chart bg-white rounded-lg p-4 col-span-1 lg:col-span-8 grid grid-rows-4 lg:grid-cols-3 lg:grid-rows-2 gap-4"
			>
				<div
					class="bg-gray-100 p-4 px-6 rounded-lg inline-flex flex-col lg:col-start-1 lg:col-end-3 items-start justify-start relative overflow-hidden"
				>
					<div class="text-left inline-flex flex-col">
						<ClockCanvas
							class="absolute top-0 right-0 mr-2 mt-2"
							:lines="dayStats.bedtime.samples"
						></ClockCanvas>
						<div class="absolute bottom-0 right-0 left-0 h-20">
							<SparkLine
								:lines="
									dayStats.waketime.samples.map(
										(v) => v / (Math.PI * 2)
									)
								"
							></SparkLine>
						</div>
						<span class="font-bold text-2xl opacity-60"
							>Bedtime</span
						>
						<span class="text-4xl">
							{{ daySecondsTo12Hour(dayStats.bedtime.average) }}
							<span class="text-xs italic">
								±
								{{
									formatSecondsUpToHours(
										dayStats.bedtime.divergence
									)
								}}
							</span>
						</span>
					</div>
				</div>
				<div
					class="bg-gray-100 p-4 px-6 rounded-lg inline-flex flex-col items-start justify-end relative lg:col-start-1 lg:row-start-2 lg:col-end-3 overflow-hidden"
				>
					<div class="text-left inline-flex flex-col">
						<ClockCanvas
							class="absolute bottom-0 right-0 mr-2 mb-2"
							:lines="dayStats.waketime.samples"
						></ClockCanvas>
						<div class="absolute top-0 right-0 left-0 h-20">
							<SparkLine
								:invert="true"
								:lines="
									dayStats.waketime.samples.map(
										(v) => v / (Math.PI * 2)
									)
								"
							></SparkLine>
						</div>
						<span class="font-bold text-2xl opacity-60"
							>Waketime</span
						>
						<span class="text-4xl"
							>{{ daySecondsTo12Hour(dayStats.waketime.average)
							}}<span class="text-xs italic">
								±
								{{
									formatSecondsUpToHours(
										dayStats.waketime.divergence
									)
								}}
							</span></span
						>
					</div>
				</div>

				<div
					class="bg-gray-100 p-2 px-4 rounded-lg inline-flex flex-col items-center justify-center relative overflow-hidden lg:col-start-3 lg:row-start-1"
				>
					<div class="text-left inline-flex flex-col">
						<div class="absolute bottom-0 right-0 left-0 h-10">
							<SparkLine
								:lines="
									dayStats.sleep.samples.map(
										(v) => v / dayStats.sleep.max / 2
									)
								"
							></SparkLine>
						</div>
						<span class="font-bold text-2xl opacity-60">Sleep</span>
						<span class="text-3xl">
							<div>
								<span class="text-sm">avg</span>
								{{
									formatSecondsUpToHours(
										dayStats.sleep.average
									)
								}}
							</div>
							<div>
								<span class="text-sm">min</span>
								{{ formatSecondsUpToHours(dayStats.sleep.min) }}
								<span
									v-if="dayStats.sleep.minDay"
									class="text-xs"
									>({{
										dayStats.sleep.minDay.toLocaleDateString()
									}})</span
								>
							</div>
							<div>
								<span class="text-sm">max</span>
								{{ formatSecondsUpToHours(dayStats.sleep.max) }}
								<span
									v-if="dayStats.sleep.maxDay"
									class="text-xs"
									>({{
										dayStats.sleep.maxDay.toLocaleDateString()
									}})</span
								>
							</div>
						</span>
					</div>
				</div>
				<div
					class="bg-gray-100 rounded-lg h-full relative overflow-hidden lg:col-start-3 lg:row-start-2"
				>
					<div
						class="text-left inline-flex h-full p-2 flex-col items-start w-full space-y-1"
					>
						<template v-for="i in 7">
							<div
								class="w-full flex flex-row flex-1"
								v-if="dayStats?.weekSleep[i - 1]"
							>
								<div
									class="bg-[#ceddeb] rounded-md px-2 text-sm"
									:style="`width: calc(${
										(dayStats.weekSleep[i - 1].average /
											dayStats.sleep.max) *
										100
									}% - 36px)`"
								>
									{{ daysOfWeek[i - 1] }}
								</div>
								<span class="ml-2 text-sm">{{
									formatSecondsUpToHours(
										dayStats.weekSleep[i - 1].average
									)
								}}</span>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
		<div class="chart-row flex flex-row gap-4 px-4 lg:px-10">
			<div
				class="chart bg-white rounded-lg p-4 col-span-4 flex items-center justify-center w-full"
			>
				<LineChart
					:key="`${rangeData.start}-${rangeData.end}-${rangeIndex}`"
					v-if="stackedChart.valid"
					:options="stackedChart.options"
					class="chart w-full h-[400px]"
					:chartData="stackedChart.data"
				/>
			</div>
		</div>
		<div class="chart-row flex flex-row gap-4 px-4 lg:px-10">
			<div
				class="chart bg-white rounded-lg p-4 col-span-4 flex items-center justify-center w-full"
			>
				<WeekCanvas
					v-if="rangeDataFiltered"
					:data="rangeDataFiltered"
					:get-block-from-id="getBlockById"
					class="chart w-full"
				/>
			</div>
		</div>
		<div
			class="chart-row grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-10"
		>
			<div
				class="chart bg-white rounded-lg p-4 col-span-1 flex flex-row items-center justify-center w-full space-x-2"
			>
				<template v-for="(b, i) in blockTotals">
					<div
						v-if="i < 7 && b && b.block"
						class="chart bg-gray-100 h-full rounded-lg col-span-1 flex flex-col w-full overflow-hidden"
					>
						<div
							class="flex flex-col items-center text-white p-2 px-3"
							:style="`color: ${b.block.color}`"
						>
							<Icon
								class="text-xl my-2"
								:icon="b.block.icon || b.block.name"
							></Icon>
							<span
								style="
									writing-mode: vertical-rl;
									text-orientation: mixed;
								"
								class="text-md font-bold"
							>
								{{ b.block.name }}
							</span>
							<span class="mt-1 text-sm">
								{{
									formatSecondsUpToHours(b.main.weekAverage)
								}}/wk
							</span>
						</div>
						<div
							class="mt-auto grid grid-rows-2 text-sm my-2 mx-1 items-center justify-center"
							style="grid-template-columns: 1rem 1fr"
						>
							<Icon
								class="text-xs text-blue-300"
								:no-filter="true"
								icon="play"
							></Icon>
							<span>{{
								daySecondsTo12Hour(b.clockStart.mode)
							}}</span>

							<Icon
								class="text-xs text-red-300"
								icon="stop"
							></Icon>
							<span>{{
								daySecondsTo12Hour(b.clockEnd.mode)
							}}</span>
						</div>
					</div>
				</template>
			</div>
			<div
				class="chart bg-white rounded-lg p-4 col-span-1 flex items-center justify-center w-full"
			>
				<WeekAverageCanvas
					v-if="rangeDataFiltered"
					:threshold="10"
					:data="rangeDataFiltered"
					:get-block-from-id="getBlockById"
					class="chart w-full h-[256px]"
				/>
			</div>
		</div>
		<div
			class="chart-row grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-10"
		>
			<div
				v-for="grab in grabs"
				class="chart bg-white rounded-lg p-4 col-span-1 flex flex-col w-full"
			>
				<FrequencyChart
					v-if="rangeDataFiltered"
					:filter="grab.filter"
					:data="rangeDataFiltered"
					:get-block-from-id="getBlockById"
					class="chart w-full"
				/>
			</div>
		</div>
		<div
			class="chart-row grid grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5 gap-4 px-4 lg:px-10"
		>
			<div
				class="chart bg-white rounded-lg col-span-1 flex flex-col w-full overflow-hidden"
			>
				<div
					class="flex flex-row items-center text-white p-2 px-3 bg-gray-500"
				>
					<Icon class="text-2xl mr-2" icon="chart-bar"></Icon>
					<span class="text-xl font-bold">Legend</span>
					<span class="text-lg font-bold ml-auto opacity-75"
						>total hours</span
					>
					<ClockCanvas
						class="bg-white ml-2 border-white border-2"
						:lines="[
							0,
							Math.PI / 2,
							Math.PI,
							Math.PI + Math.PI / 2,
						]"
						color="grey"
					></ClockCanvas>
				</div>
				<div class="flex flex-row">
					<div class="flex flex-col p-2">
						<div class="text-sm opacity-50">Session</div>
						<div class="flex flex-col items-center">
							average
							<div
								class="w-0 h-1 border-gray-400 border-r-[1px] rounded-full"
							></div>
						</div>
						<div class="opacity-75 flex flex-col">
							max
							<span class="text-xs">(date)</span>
						</div>
					</div>
					<div class="flex flex-col p-2">
						<div class="text-sm opacity-50">Day</div>
						<div class="flex flex-col items-center">
							average
							<div
								class="w-0 h-1 border-gray-400 border-r-[1px] rounded-full"
							></div>
						</div>
						<div class="opacity-75 flex flex-col">
							max
							<span class="text-xs">(date)</span>
						</div>
					</div>
					<div
						class="text-right inline-flex h-full flex-col items-end justify-evenly w-full"
					>
						<template v-for="i in 7">
							<div
								class="w-full flex flex-row flex-1 justify-end"
							>
								<div
									class="z-0 bg-[#ceddeb] px-2 text-xs relative font-bold text-opacity-30 text-black rounded-l-sm w-20"
								>
									<span class="absolute left-2">
										{{ daysOfWeek[i - 1] }} avg
									</span>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
			<div
				v-for="b in blockTotals"
				class="chart bg-white rounded-lg col-span-1 flex flex-col w-full overflow-hidden"
			>
				<div
					class="flex flex-row items-center text-white p-2 px-3"
					:style="`background: ${b.block.color}`"
				>
					<Icon
						class="text-2xl mr-2"
						:icon="b.block.icon || b.block.name"
					></Icon>
					<span class="text-xl font-bold">{{ b.block.name }}</span>
					<span class="text-lg font-bold ml-auto opacity-75">{{
						formatSecondsUpToHours(b.totalTime)
					}}</span>
					<ClockCanvas
						class="bg-white ml-2 border-white border-2"
						:lines="b.clockMid.samples"
						:color="b.block.color"
					></ClockCanvas>
				</div>
				<div class="flex flex-row">
					<div class="flex flex-col p-2">
						<div class="text-sm opacity-50">Session</div>
						<div class="flex flex-col items-center">
							{{ formatSecondsUpToHours(b.main.average) }}
							<div
								class="w-0 h-1 border-gray-400 border-r-[1px] rounded-full"
							></div>
						</div>
						<div class="opacity-75 flex flex-col">
							{{ formatSecondsUpToHours(b.main.max) }}
							<span v-if="b.main.maxDay" class="text-xs"
								>({{
									b.main.maxDay.toLocaleDateString()
								}})</span
							>
						</div>
					</div>
					<div class="flex flex-col p-2">
						<div class="text-sm opacity-50">Day</div>
						<div class="flex flex-col items-center">
							{{ formatSecondsUpToHours(b.main.dayAverage) }}
							<div
								class="w-0 h-1 border-gray-400 border-r-[1px] rounded-full"
							></div>
						</div>
						<div class="opacity-75 flex flex-col">
							{{ formatSecondsUpToHours(b.main.dayMax) }}
							<span v-if="b.main.dayMaxDay" class="text-xs"
								>({{
									b.main.dayMaxDay.toLocaleDateString()
								}})</span
							>
						</div>
					</div>
					<div
						class="text-right inline-flex h-full flex-col items-end justify-evenly w-full"
					>
						<template v-for="i in 7">
							<div
								class="w-full flex flex-row flex-1 justify-end"
								v-if="b.week[i - 1]"
							>
								<div
									class="z-0 bg-[#ceddeb] px-2 text-xs relative font-bold text-opacity-30 text-black rounded-l-sm"
									:class="{
										// 'after:absolute after:bg-[#ceddeb] after:-left-2 after:bottom-0 after:w-2 after:h-2':
										// 	b.week[i - 1]?.average /
										// 		b.main.max -
										// 		0.05 <
										// 	b.week[i]?.average / b.main.max,
										// 'rounded-tl-md':
										// 	b.week[i - 1]?.average >
										// 	b.week[i - 2]?.average,
										// 'before:absolute before:bg-[#ceddeb] before:-left-2 before:top-0 before:w-2 before:h-2':
										// 	b.week[i - 2]?.average /
										// 		b.main.max -
										// 		0.05 >
										// 	b.week[i - 1]?.average / b.main.max,
										// 'rounded-bl-md':
										// 	b.week[i - 1]?.average >
										// 	b.week[i]?.average,
									}"
									:style="`width: ${
										20 +
										(b.week[i - 1].dayAverage /
											maxDayAverage(b.week)) *
											80
									}%`"
								>
									<span
										class="absolute left-2"
										v-if="b.week[i - 1].dayAverage"
									>
										{{
											formatSecondsUpToHours(
												b.week[i - 1].dayAverage
											)
										}}
									</span>
									<span class="absolute left-0" v-else>
									</span>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
		<div class="chart-row grid grid-cols-2 px-10 gap-4" v-if="false">
			<div
				class="chart bg-white rounded-lg overflow-hidden flex flex-col pointer-events-none"
			>
				<div class="flex flex-col my-2 mt-4">
					<span class="text-lg">Most Diverse Week</span>
					<span class="text-md opacity-70">{{
						formatToDDMMMYYYY(new Date(2022, 12 - 1, 8))
					}}</span>
				</div>
				<div class="h-[800px] mb-2">
					<Log
						v-if="props.user"
						:blocks="props.blocks"
						:user="props.user"
						:db="props.db"
						:active="true"
						:restrict-to-parent="true"
						:no-mobile="true"
						:start-zoom="2"
						:start-date="new Date(2022, 12 - 1, 8)"
					></Log>
				</div>
			</div>
			<div
				class="chart bg-white rounded-lg overflow-hidden flex flex-col pointer-events-none"
			>
				<div class="flex flex-col my-2 mt-4">
					<span class="text-lg">Busiest week</span>
					<span class="text-md opacity-70">{{
						formatToDDMMMYYYY(new Date(2022, 8 - 1, 28))
					}}</span>
				</div>
				<div class="h-[800px] mb-2">
					<Log
						v-if="props.user"
						:blocks="props.blocks"
						:user="props.user"
						:db="props.db"
						:active="true"
						:restrict-to-parent="true"
						:no-mobile="true"
						:start-zoom="2"
						:start-date="new Date(2022, 8 - 1, 28)"
					></Log>
				</div>
			</div>
		</div>
	</div>
</template>
