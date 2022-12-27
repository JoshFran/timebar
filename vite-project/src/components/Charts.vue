<script setup>
import { computed, nextTick, onMounted, reactive, ref, toRef } from "vue";

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
} from "date-fns";

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

import { formatTime, formatSeconds } from "../time.js";
import LogRange from "../LogRange";

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

let chunks = {};

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

let logRange = computed(() => {
	let start = new Date(dateValue.value[0]);
	let end = new Date(dateValue.value[1]);

	return new LogRange(start, end);
});

let blocks = computed(() => {
	let result = props.blocks.reduce((res, obj) => {
		if (res[obj.color]) res[obj.color].push(obj);
		else res[obj.color] = [obj];
		return res;
	}, {});
	return Object.values(result).flat();
});
</script>

<template>
	<!-- <div class="panel"> -->
	<!-- <div class="select-bar cursor-pointer"> -->
	<div class="py-10 min-w-[350px]">
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
							return [new Date(range.start), new Date(range.end)];
						},
					}))
			"
		></litepie-datepicker>
		{{ logRange.walk() }}
	</div>
	<!-- </div> -->
	<!-- </div> -->
	<!-- <div class="chart-row">
		<DoughnutChart
			v-if="testData"
			:options="chartOptions"
			class="chart"
			:chartData="testData"
		/>
		<BarChart
			v-if="stackedChart"
			:options="chartOptions"
			class="chart"
			:chartData="stackedChart"
		/>
	</div> -->
</template>
