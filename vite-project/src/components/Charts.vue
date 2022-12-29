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
import InputBlocks from "./InputBlocks.vue";
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
import { getLogItemsInRange } from "../api";
import InputProxyBlock from "./InputProxyBlock.vue";

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
const blacklistEnabled = ref(false);
const merging = ref([]);

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

let logRange = computed(() => {
	let start = new Date(dateValue.value[0]);
	let end = endOfDay(new Date(dateValue.value[1]));

	getLogItemsInRange(start, end).then((a) => {
		console.log(sumLog(a, start, end));
	});

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
	<div class="py-10 min-w-[350px] flex flex-row">
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
							'opacity-25 pointer-events-none': !whitelistEnabled,
						}"
					>
						<InputBlocks></InputBlocks>
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
							'opacity-25 pointer-events-none': !blacklistEnabled,
						}"
					>
						<InputBlocks></InputBlocks>
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
							<InputProxyBlock v-model="m.to"></InputProxyBlock>
							<button
								@click="merging.splice(i, 1)"
								class="absolute -top-5 -right-5 bg-red-400 rounded-full w-8 h-8 min-w-8 min-h-8 max-w-8 max-h-8 flex items-center justify-center hover:bg-gray-600 hover:bg-red-500"
							>
								<i class="fas fa-times"></i>
							</button>
						</div>
					</template>

					<button
						@click="merging.push({ from: [], to: '' })"
						class="ml-2 mt-2 bg-gray-100 rounded-full p-2 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] flex items-center justify-center hover:bg-gray-600 hover:bg-opacity-50"
					>
						<i class="fas fa-add"></i>
					</button>
				</div>
			</div>
		</div>
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
