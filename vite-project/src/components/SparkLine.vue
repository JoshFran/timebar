<script setup>
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
	lines: Array,
	invert: Boolean,
});

let canvas = ref(null);

watch(
	() => props.lines,
	() => {
		draw();
	}
);

function draw() {
	if (!canvas.value) return;

	canvas.value.width = canvas.value.parentElement.clientWidth * 2;
	canvas.value.height = canvas.value.parentElement.clientHeight * 2;

	let ctx = canvas.value.getContext("2d");
	ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

	ctx.beginPath();
	if (props.invert) {
		ctx.moveTo(0, 0);
	} else {
		ctx.moveTo(0, canvas.value.height);
	}
	for (let [i, line] of props.lines.entries()) {
		let x = (i / (props.lines.length - 1)) * canvas.value.width;
		let y = line * canvas.value.height;

		ctx.lineTo(x, y);
	}

	if (props.invert) {
		ctx.lineTo(canvas.value.width, 0);
	} else {
		ctx.lineTo(canvas.value.width, canvas.value.height);
	}
	// ctx.lineWidth = canvas.value.width / props.lines.length;
	ctx.fillStyle = "#CEDDEB";
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

onMounted(() => {
	window.addEventListener("resize", draw);
	draw();
});

onUnmounted(() => {
	window.removeEventListener("resize", draw);
});
</script>

<template>
	<canvas ref="canvas" class="max-w-full max-h-full"></canvas>
</template>
