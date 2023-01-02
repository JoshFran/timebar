<script setup>
import { addDays, getDaysInYear, startOfWeek, startOfYear } from "date-fns";
import { binarySearchData } from "../api.js";
import parseColor from "color-parse";
import {
	watch,
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
	onUnmounted,
} from "vue";
let props = defineProps({
	data: Array,
	threshold: Number,
	getBlockFromId: Function,
});

let canvas = ref(null);

watch(
	() => [props.data, props.threshold],
	() => {
		draw();
	}
);

let gap = 10;

function draw() {
	if (!canvas.value) return;

	canvas.value.width = canvas.value.parentElement.clientWidth * 2;
	canvas.value.height = canvas.value.parentElement.clientHeight * 2;

	let ctx = canvas.value.getContext("2d");
	ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
	let firstDay = props.data[0];
	if (!firstDay) return;
	let start = startOfWeek(new Date(firstDay[1]));

	let daysPerWeek = 7;
	let weeksPerYear = 52;
	let increment = 60 * 3;
	let chunksPerDay = (24 * 60 * 60) / increment;
	console.log(chunksPerDay);
	let dayWidth = (canvas.value.width - gap * 6) / daysPerWeek;
	let chunkHeight = Math.floor(canvas.value.height / chunksPerDay);
	canvas.value.height = chunkHeight * chunksPerDay;
	let buckets = [];
	for (let i = 0; i < 7; i++) {
		let arr = [];
		for (let j = 0; j < chunksPerDay; j++) {
			arr.push({});
		}
		buckets.push(arr);
	}
	for (let x = 0; x < weeksPerYear; x++) {
		for (let y = 0; y < daysPerWeek; y++) {
			let dayIndex = x * daysPerWeek + y;
			let dayDate = addDays(start, dayIndex);

			for (let j = 0; j < chunksPerDay; j++) {
				let pixelTime =
					dayDate.getTime() +
					(j / chunksPerDay) * 24 * 60 * 60 * 1000;
				let res = binarySearchData(props.data, pixelTime);
				if (res) {
					let bucket = buckets[y][j];
					if (bucket[res[0]]) {
						bucket[res[0]]++;
					} else {
						bucket[res[0]] = 1;
					}
				}
			}
		}
	}

	for (let x = 0; x < daysPerWeek; x++) {
		let px = dayWidth * x + gap * x;
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(px, 0, dayWidth, canvas.value.height, 10);
		ctx.strokeStyle = "rgba(0,0,0,1)";
		ctx.lineWidth = 1;
		ctx.clip();
		for (let y = 0; y < chunksPerDay; y++) {
			let bucket = buckets[x][y];
			let py = chunkHeight * y;

			let max = 0;
			let maxKey = null;
			let avgColorR = 0;
			let avgColorG = 0;
			let avgColorB = 0;
			let avgColorCount = 0;
			let sortedKeys = Object.keys(bucket).sort(
				(a, b) => bucket[b] - bucket[a]
			);

			for (let ki = 0; ki < props.threshold; ki++) {
				if (ki >= sortedKeys.length) continue;
				let key = sortedKeys[ki];
				let b = props.getBlockFromId(key);
				if (b) {
					let parsed = parseColor(b.color);
					avgColorR += parsed.values[0] * bucket[key];
					avgColorG += parsed.values[1] * bucket[key];
					avgColorB += parsed.values[2] * bucket[key];
					avgColorCount += bucket[key];
				}
			}
			if (avgColorCount) {
				ctx.fillStyle = `rgb(${avgColorR / avgColorCount}, ${
					avgColorG / avgColorCount
				}, ${avgColorB / avgColorCount})`;
				ctx.fillRect(px, py, dayWidth, chunkHeight);
			}
		}
		ctx.restore();
	}
}

onMounted(() => {
	window.addEventListener("resize", draw);
	draw();
});

onUnmounted(() => {
	window.removeEventListener("resize", draw);
});

let days = ref(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
</script>

<template>
	<div class="flex flex-col">
		<canvas ref="canvas" class="max-w-full max-h-full"></canvas>
		<div class="flex flex-row mt-2">
			<span
				v-for="d in days"
				class="text-xs opacity-50 flex-1 text-center"
				>{{ d }}</span
			>
		</div>
	</div>
</template>
