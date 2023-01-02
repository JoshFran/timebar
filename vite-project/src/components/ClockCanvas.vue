<script setup>
import {
	watch,
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
} from "vue";
let props = defineProps({
	lines: Array,
	color: {
		type: String,
		default: "#000",
	},
});

let canvas = ref(null);

watch(
	() => [props.lines, props.color],
	() => {
		draw();
	}
);

function draw() {
	if (!canvas.value) return;

	let ctx = canvas.value.getContext("2d");
	ctx.clearRect(0, 0, 100, 100);
	let distCenter = 30;
	var grd = ctx.createConicGradient(0, 50, 50);
	let sunrise = 7;
	let sunset = 12 + 8;
	let sunriseRad = (sunrise / 24) * 2 * Math.PI;
	let sunsetRad = (sunset / 24) * 2 * Math.PI;
	function addColorStop(time, color) {
		if (time < 0) time = 24 + time;
		if (time > 24) time = time - 24;
		grd.addColorStop(time / 24, color);
	}

	let dayColor = "#ffc412";
	let nightColor = "rgba(0, 0, 0, 1)";

	ctx.globalAlpha = 1;
	grd.addColorStop(0, nightColor);
	grd.addColorStop(1, nightColor);
	addColorStop(sunrise - 3, nightColor);
	addColorStop(sunrise, dayColor);
	addColorStop(sunrise + 10, dayColor);
	addColorStop(sunset, nightColor);
	addColorStop(sunset + 2, nightColor);

	// Fill with gradient
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(50, 50, distCenter, 0, 2 * Math.PI);
	ctx.fill();

	for (let line of props.lines) {
		ctx.beginPath();
		ctx.moveTo(
			50 + Math.cos(line) * (distCenter + 4),
			50 + Math.sin(line) * (distCenter + 4)
		);
		ctx.lineTo(50 + Math.cos(line) * 50, 50 + Math.sin(line) * 50);
		ctx.lineWidth = 2;
		ctx.globalAlpha = 0.6;

		ctx.strokeStyle = props.color;
		ctx.stroke();
	}
	ctx.restore();
}

onMounted(() => {
	draw();
});
</script>

<template>
	<div
		class="clock-canvas rounded-full w-10 h-10 overflow-hidden border border-gray-400"
	>
		<canvas
			ref="canvas"
			width="100"
			height="100"
			class="max-w-full max-h-full"
		></canvas>
	</div>
</template>
