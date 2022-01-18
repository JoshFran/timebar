<script setup>
import { computed, defineComponent, onMounted, ref , defineEmits, Teleport } from 'vue'

const open = ref(false)
const animateClose = ref(false)

const root = ref(null)

const position = ref({
	top: 0,
	left: 0
})

const snapTo = ref(false)

function openDialog() {
	open.value = true
	let rect = root.value.parentElement.getBoundingClientRect()
	snapTo.value = false
	
	position.value = {
		top: rect.top + rect.height,
		left: rect.left + rect.width / 2
	}
	
	if (position.value.left + 175 > window.innerWidth) {
		position.value.left = window.innerWidth - 175 / 2
	}

	if (rect.top + rect.height + 300 > window.innerHeight) {
		snapTo.value = true
		position.value.top = window.innerHeight - rect.top
	}
}

onMounted(() => {
	root.value.parentElement.addEventListener("click", () => {
		if (open.value) {
			closeDialog()
		}else{
			openDialog()
		}
	})
})

document.addEventListener("click", (e) => {
	if (open.value && !root.value.parentElement.contains(e.target) && e.target != root.value.parentElement && !e.target.matches(".dialog-box-inner") && !e.target.closest(".dialog-box-inner")) {
		closeDialog()
	}
})

document.addEventListener("mousewheel", (e) => {
	if (open.value && !e.target.closest(".dialog-box-inner")) {
		closeDialog()
	}
})

document.body.addEventListener("closedialog", () => {
	closeDialog()
})

function closeDialog() {
	animateClose.value = true
	setTimeout(() => {
		animateClose.value = false
		open.value = false
	}, 200)
}

</script>

<template>
	<div ref="root" class="dialog-box" :class="{open: open}">
		<Teleport to="body" v-if="open">
			<div class="dialog-shade" :class="{'closing': animateClose}"></div>
			<div :class="{'closing': animateClose, 'bottom-snap': snapTo}" :style="{'--left': position.left + 'px', '--top': position.top + 'px'}" class="dialog-box-inner">
				<div class="dialog-box-inner-container"><slot></slot></div>
			</div>
		</Teleport>
	</div>
</template>

<style scoped>

@media (max-width: 900px) {
	.dialog-box-inner {
		width: 100vw !important;
		height: 100vh !important;
		left: 0vw !important;
		top: 0vh !important;
		bottom: unset !important;
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: center !important;
		pointer-events: none !important;
		transform-origin: center !important;
	}

	.dialog-box-inner-container {
		pointer-events: all !important;
		max-height: 80vh !important;
	}

	.dialog-box-inner-container {
		width: 250px;
	}

	.dialog-box-inner::after, .dialog-box-inner::before {
		display: none;
	}

	.dialog-shade {
		position: fixed;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 40;
		top: 0;
		left: 0;
		opacity: 0;
		animation: fade-in 0.3s ease-in-out forwards;
		transition: .3s;
	}

	.closing.dialog-shade {
		animation: fade-out 0.3s ease-in-out forwards;
	}
}

@keyframes fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

@keyframes fade-out {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

.dialog-box {
	position: relative;
}

.dialog-box-inner {
	position: absolute;
	top: calc(var(--top) + 10px);
	left: calc(var(--left) - 175px / 2);
	width: 175px;
	z-index: 50;
	transform-origin: top center;
	animation: grow .2s ease-in-out forwards;
}

.dialog-box-inner.bottom-snap {
	bottom: calc(var(--top) + 10px);
	top: unset;
	transform-origin: bottom center;
}

.dialog-box-inner.closing {
	animation: shrink .2s ease-in-out;
}

@keyframes grow {
	0% {
		opacity: 0;
		transform: scale(0);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes shrink {
	0% {
		opacity: 1;
		transform: scale(1);
	}
	100% {
		opacity: 0;
		transform: scale(0);
	}
}

.dialog-box-inner-container {
	background-color: white;
	border-radius: 14px;
	box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
	z-index: 50;
	position: relative;
	max-height: calc(100vh - var(--top) - 20px);
	overflow: auto;
}

.dialog-box-inner::before {
	content: '';
	background-color: white;
	box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
	z-index: 48;
	transform: rotate(45deg);
	position: absolute;
	top: -10px;
	left: calc(50% - 10px);
	width: 20px;
	height: 20px;
}
.dialog-box-inner::after {
	content: '';
	z-index: 51;
	position: absolute;
	--box-size: calc(21px * 1.4142135623730951);
	top: calc(-21px * 1.4142135623730951);
	left: calc(50% - var(--box-size) / 2);
	
	/* height: calc(var(--box-size) / 2); */
	border: calc(var(--box-size) / 2) solid transparent;
	border-bottom: calc(var(--box-size) / 2) solid rgb(255, 255, 255);
}

.dialog-box-inner.bottom-snap::after {
	top: unset;
	bottom: calc(-21px * 1.4142135623730951);
	border: calc(var(--box-size) / 2) solid transparent;
	border-top: calc(var(--box-size) / 2) solid rgb(255, 255, 255);
}

.dialog-box-inner.bottom-snap::before {
	bottom: -10px;
	top: unset;
}

/* ===== Scrollbar CSS ===== */
  /* Firefox */
  .dialog-box-inner-container::-webkit-scrollbar {
  height: 16px;
  overflow: visible;
  width: 16px;
  display: none;
}

</style>