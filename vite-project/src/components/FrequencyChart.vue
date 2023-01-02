<script setup>
import {
	addDays,
	differenceInWeeks,
	endOfWeek,
	endOfYear,
	getDaysInYear,
	startOfDay,
	startOfWeek,
	startOfYear,
} from "date-fns";
import { binarySearchData } from "../api.js";
import {
	watch,
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
	onUnmounted,
} from "vue";
import { getISOWeeksInYear } from "date-fns/esm";
import Icon from "./Icon.vue";
import { formatSecondsUpToHours } from "../time";
let props = defineProps({
	data: Array,
	getBlockFromId: Function,
	filter: {
		type: Array,
		default: () => [],
	},
});

let slots = ref([]);
watch(
	() => [props.data, props.filter],
	() => {
		draw();
	},
	{ deep: true }
);

let gap = 10;

function dateToKey(date) {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

const weeksPerYear = ref(52);
const colorMapping = ref({});
const counter = ref({});
const streaks = ref({});
const blocks = ref([]);
const min = ref(Infinity);
const max = ref(-Infinity);

function draw() {
	colorMapping.value = {};
	counter.value = {};
	blocks.value = [];
	min.value = Infinity;
	max.value = -Infinity;

	let colorsAvailable = [
		"#419ee8",
		"#9c27b0",
		"#ef5350",
		"#4caf50",
		"#ff9800",
		"#455a64",
		"#ad1457",
		"#ffeb3b",
	];
	slots.value = [];
	if (props.filter.length == 1) {
		colorsAvailable.unshift(props.filter[0].color);
	}

	let daysPerWeek = 7;

	let daysHit = {};
	for (let item of props.data) {
		if (!props.filter.find((x) => x.id == item[0])) continue;

		let day = startOfDay(new Date(item[1]));
		let dayKey = dateToKey(day);
		if (!daysHit[dayKey]) {
			daysHit[dayKey] = {};
		}
		if (!colorMapping.value[item[0]]) {
			colorMapping.value[item[0]] = colorsAvailable.shift();
		}
		if (!blocks.value.find((x) => x.id == item[0])) {
			blocks.value.push(props.getBlockFromId(item[0]));
		}
		if (!daysHit[dayKey][item[0]]) {
			counter.value[item[0]] = (counter.value[item[0]] || 0) + 1;
		}
		daysHit[dayKey][item[0]] =
			(daysHit[dayKey][item[0]] || 0) + (item[2] - item[1]) / 1000;

		max.value = Math.max(max.value, daysHit[dayKey][item[0]]);
	}

	for (let k in daysHit) {
		for (let k2 in daysHit[k]) {
			if (daysHit[k][k2] > 60 * 3)
				min.value = Math.min(min.value, daysHit[k][k2]);
		}
	}

	streaks.value = {};

	let firstDay = props.data[0];
	if (!firstDay) return;
	let pivot = new Date(firstDay[1]);
	let start = startOfWeek(startOfYear(pivot));
	let end = addDays(endOfWeek(endOfYear(pivot)), 1);

	let weeksDiff = differenceInWeeks(end, start);

	weeksPerYear.value = weeksDiff;

	let streakCounter = {};
	for (let item of blocks.value) {
		streakCounter[item.id] = {
			count: 0,
			lastDay: null,
			max: 0,
		};
	}

	for (let x = 0; x < weeksPerYear.value; x++) {
		for (let y = 0; y < daysPerWeek; y++) {
			let dayIndex = x * daysPerWeek + y;
			let dayDate = addDays(start, dayIndex);
			let year = dayDate.getFullYear();
			if (pivot.getFullYear() != year) {
				slots.value.push({
					filled: false,
				});
				continue;
			}

			let dayKey = dateToKey(dayDate);
			let dayHit = daysHit[dayKey];
			for (let item of blocks.value) {
				let k = item.id;
				if (dayHit && dayHit[k]) {
					if (streakCounter[k].lastDay === null) {
						streakCounter[k].lastDay = dayIndex;
						streakCounter[k].count = 1;
					} else {
						if (streakCounter[k].lastDay == dayIndex - 1) {
							streakCounter[k].count++;
							streakCounter[k].lastDay = dayIndex;
						}
					}
				} else {
					if (streakCounter[k].count > streakCounter[k].max) {
						streakCounter[k].max = streakCounter[k].count;
					}

					streakCounter[k].lastDay = null;
					streakCounter[k].count = 0;
				}
			}
			if (dayHit) {
				let sorted = Object.entries(dayHit).sort((a, b) => b[1] - a[1]);

				slots.value.push({
					filled: true,
					items: sorted.map((s, i) => ({
						id: s[0],
						scale: 1 + i / sorted.length,
						value: s[1],
						opacity: (s[1] - min.value) / (max.value - min.value),
						color: colorMapping.value[s[0]],
					})),
				});
			} else {
				slots.value.push({
					filled: true,
				});
			}
		}
	}

	streaks.value = {};
	for (let k in streakCounter) {
		streaks.value[k] = Math.max(
			streakCounter[k].max,
			streakCounter[k].count
		);
	}

	if (!isFinite(min.value)) min.value = 0;
	if (!isFinite(max.value)) max.value = 0;
}

onMounted(() => {
	window.addEventListener("resize", draw);
	draw();
});

onUnmounted(() => {
	window.removeEventListener("resize", draw);
});

let months = ref([
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
]);
</script>

<template>
	<div class="flex flex-row flex-wrap mb-2">
		<div
			v-for="b in blocks"
			class="flex flex-row items-center px-3 py-1 rounded-full"
			:style="`color: ${b.color}`"
		>
			<Icon class="text-sm mr-1" :icon="b.icon || b.name" />
			{{ b.name }}
			<span
				class="ml-2 rounded-full text-white px-2"
				:style="`background: ${colorMapping[b.id]}`"
			>
				{{ counter[b.id] }}
			</span>
			<span
				v-if="streaks[b.id] > 50"
				class="ml-1 rounded-full text-white px-2"
				:style="`background: ${colorMapping[b.id]}`"
			>
				{{ streaks[b.id] }} streak
			</span>
		</div>
		<div class="ml-auto">
			{{ formatSecondsUpToHours(min) }} -
			{{ formatSecondsUpToHours(max) }}
		</div>
	</div>
	<div
		class="grid gap-0.5 grid-flow-col"
		:style="`grid-template-columns: repeat(${weeksPerYear}, 1fr); grid-template-rows: repeat(7, 1fr);`"
	>
		<div
			v-for="(slot, index) in slots"
			:key="index"
			class="slot aspect-square w-full h-full rounded-sm flex items-center flex-col justify-center relative overflow-hidden"
			:class="{ 'bg-gray-100': slot.filled }"
		>
			<template v-if="slot.items">
				<template v-if="slot.items.length > 2">
					<div
						v-for="(b, i) in slot.items"
						class="hit w-full h-auto flex-1"
						:style="`background: ${b.color}; opacity: ${
							0.25 + b.opacity * 0.75
						}`"
					></div>
				</template>
				<template v-else>
					<div
						v-for="(b, i) in slot.items"
						class="hit p-1 absolute"
						:style="
							(slot.items.length == 2
								? ` height: 4rem; transform: rotate(${
										i == 0 ? `135deg` : `-45deg`
								  }) translate(${i == 0 ? `50%` : `50%`});`
								: ``) +
							`background: ${b.color}; opacity: ${
								0.25 + b.opacity * 0.75
							}`
						"
					></div>
				</template>
			</template>
		</div>
	</div>
</template>
