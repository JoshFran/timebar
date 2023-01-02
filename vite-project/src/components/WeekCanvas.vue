<script setup>
import {
	addDays,
	differenceInWeeks,
	endOfWeek,
	endOfYear,
	getDaysInYear,
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
let props = defineProps({
	data: Array,
	getBlockFromId: Function,
});

let canvas = ref(null);

watch(
	() => props.data,
	() => {
		draw();
	}
);

let gap = 6;

function draw() {
	if (!canvas.value) return;

	canvas.value.width = canvas.value.parentElement.clientWidth * 2;
	canvas.value.height = canvas.value.parentElement.clientHeight * 2;
	let daysPerWeek = 7;
	let weeksPerYear = 52;

	let firstDay = props.data[0];
	if (!firstDay) return;
	let pivot = new Date(firstDay[1]);
	let start = startOfWeek(startOfYear(pivot));
	let end = addDays(endOfWeek(endOfYear(pivot)), 1);

	let weeksDiff = differenceInWeeks(end, start);

	weeksPerYear = weeksDiff;

	let dayHeight = (canvas.value.height - gap * daysPerWeek) / daysPerWeek;
	let dayWidth = dayHeight;
	canvas.value.width = dayWidth * weeksPerYear + gap * weeksPerYear;
	if (canvas.value.width > canvas.value.parentElement.clientWidth) {
		canvas.value.style.height = "auto";
	}

	let ctx = canvas.value.getContext("2d");
	ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

	for (let x = 0; x < weeksPerYear; x++) {
		for (let y = 0; y < daysPerWeek; y++) {
			let dayIndex = x * daysPerWeek + y;
			let dayDate = addDays(start, dayIndex);
			let year = dayDate.getFullYear();
			if (pivot.getFullYear() != year) continue;
			ctx.fillStyle = "#f3f4f6";
			ctx.fillRect(
				x * dayWidth + gap * x,
				y * dayHeight + gap * y,
				dayWidth,
				dayHeight
			);
			if (false) {
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#000000";
				ctx.font = "29px Arial";
				ctx.fillText(
					dayDate.getDate(),
					x * dayWidth + gap * x + dayWidth / 2,
					y * dayHeight + gap * y + dayHeight / 2
				);
				continue;
			}
			for (let j = 0; j < dayHeight; j++) {
				let pixelTime =
					dayDate.getTime() + (j / dayHeight) * 24 * 60 * 60 * 1000;
				let res = binarySearchData(props.data, pixelTime);
				if (res) {
					let block = props.getBlockFromId(res[0]);
					ctx.fillStyle = block.color;
					ctx.fillRect(
						x * dayWidth + gap * x,
						y * dayHeight + j + gap * y,
						dayWidth,
						1
					);
				}
			}
		}
	}
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
	<div class="flex flex-col">
		<canvas ref="canvas" class="max-w-full max-h-full"></canvas>
		<div class="flex flex-row mt-2">
			<span
				v-for="m in months"
				class="text-xs opacity-50 flex-1 text-center"
				>{{ m }}</span
			>
		</div>
	</div>
</template>
