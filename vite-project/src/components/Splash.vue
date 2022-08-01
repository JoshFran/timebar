<script setup>
import FullLogo from "../assets/splash/timebar-logo-full.svg?raw";
import Triangle from "../assets/splash/triangle.svg?raw";
import TransitionBar from "../assets/splash/transition-bar.svg?raw";
import Grid from "../assets/splash/timebar-grid.svg?raw";
import Activity from "../assets/splash/activity.svg?raw";

import { formatSeconds } from "../time.js";
import { onMounted } from "vue";

onMounted(() => {
	let landed = Date.now();
	setInterval(() => {
		let s = 60 * 24 + Math.floor((Date.now() - landed) / 1000);
		document.querySelector("#Timer").children[0].innerHTML = formatSeconds(
			s
		);
	}, 500);
});
</script>

<template>
	<div class="splash-full">
		<div class="splash-nav">
			<div class="splash-logo" v-html="FullLogo"></div>
			<button class="btn hide-mobile">Launch</button>
		</div>
		<div class="splash-text">
			<h1>The time tracker built for life</h1>
			<p>
				Timebar is the timer that never stops ticking. It stays out of
				your way, and provides the flexibility to track everything from
				broad activities, to detailed daily logs.
			</p>
			<button class="btn hide-desktop">Launch App</button>
		</div>
		<div class="splash-fade"></div>
		<div class="splash-activity" v-html="Activity"></div>
		<div class="splash-triangle" v-html="Triangle"></div>
		<div class="splash-transition-bar" v-html="TransitionBar"></div>
		<div class="splash-background" v-html="Grid"></div>
	</div>
	<div class="splash-row">
		<div>
			<h2>Track anywhere</h2>
			<p>
				Easily keep time on daily activities down to the minute from
				desktop or mobile.
			</p>
		</div>
		<div>
			<img src="../assets/splash/track-anywhere.png" />
		</div>
	</div>
	<div class="splash-row">
		<div>
			<img src="../assets/splash/logging.png" />
		</div>
		<div>
			<h2>Powerful logging</h2>
			<p>
				Analyze how you spend your time, from months, to days, to hours.
				Forgot to track something? Easily fix it after the fact by
				splicing in the correct activity.
			</p>
		</div>
	</div>
	<div class="splash-row">
		<div>
			<h2>Syncronized</h2>
			<p>
				Realtime synchronization keeps your timer ticking across all
				devices at the same time, just set and forget.
			</p>
		</div>
		<div>
			<img src="../assets/splash/sync.png" />
		</div>
	</div>
	<div class="splash-row">
		<div>
			<h2>Get started</h2>
			<p>
				Timebar is completely free to use. Your data is yours and yours
				only.
			</p>
			<button class="btn hide-mobile">Launch</button>
			<button class="btn hide-desktop">Launch App</button>
		</div>
	</div>
</template>

<style>
html,
body {
	margin: 0;
}

#app {
	overflow-x: hidden;
}

.splash-full {
	min-height: 100vh;
	background-color: aliceblue;

	position: relative;
}

.splash-row {
	background-color: aliceblue;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	min-height: 700px;
	position: relative;
	z-index: 1;
}

.splash-row > div {
	text-align: left;
}

.splash-row img {
	filter: drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.2));
}

.splash-row > div:first-child {
	margin-right: 200px;
}
.splash-row > div:only-child {
	margin-right: 0px;
	text-align: center;
}
.splash-row > div:only-child p {
	text-align: center;
}

.splash-row h2 {
	font-size: 48px;
}
.splash-row p {
	max-width: 400px;
}

.splash-fade {
	position: absolute;
	top: 88px;
	left: 0;
	width: 100%;
	z-index: 1;
	height: 40%;
	background: linear-gradient(
		to bottom,
		rgba(255, 255, 255, 1) 50%,
		rgba(255, 255, 255, 0) 100%
	);
}

.splash-nav {
	background-color: white;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	padding: 20px;
	z-index: 10;
	position: relative;
}

.splash-text {
	position: relative;
	z-index: 11;
	font-family: "Overpass", sans-serif;
	display: flex;
	flex-direction: column;
	align-items: center;
}

h1 {
	font-weight: 100;
	font-size: 48px;
	margin: 0;
}

p {
	max-width: calc(min(600px, 100vw - 40px));
	text-align: left;
	font-size: 24px;
}

.splash-activity {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	/* max-height: 50px; */
	z-index: 3;
	filter: drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.2));
	margin-top: 100px;
}

.splash-background {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	margin-top: 100px;
	/* max-height: 80vh; */
	z-index: 0;
}

.splash-background::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0vw;
	width: 100%;
	height: 240px;
	background-color: aliceblue;
	z-index: 10;
}

.splash-triangle {
	position: absolute;
	right: 0;
	bottom: 0;
	z-index: 1;
}

.splash-triangle > svg {
	width: 100vw;
	height: 80vh;
}

.splash-transition-bar {
	position: absolute;
	bottom: -25px;
	width: 100%;

	z-index: 2;
	filter: drop-shadow(0px 0px 50px rgba(0, 0, 0, 0.5));
}

.splash-transition-bar > svg {
	height: 155px;
	width: 100vw;
}

.btn {
	cursor: pointer;
	border: none;
	--color: #58c460;
	background: var(--color);
	border-radius: 8px;

	outline: none;
	padding: 8px 25px;
	margin: 5px;
	font-size: 1em;
	color: rgb(255, 255, 255);
	font-family: "Overpass", sans-serif;
	transition: all 0.3s;
	transform: translate(0px, 0px);
	will-change: transform;
	user-select: none;
}

.btn:hover {
	filter: brightness(1.1);
	transform: translate(0px, -2px);
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
}

.btn:active {
	filter: brightness(0.9);
	transform: translate(0px, 0px) scale(0.95);
}

.btn > i {
	margin-left: 12px;
}

@media (min-width: 899px) {
	.hide-desktop {
		display: none;
	}
}

@media (max-width: 900px) {
	.hide-mobile {
		display: none;
	}

	.splash-nav {
		justify-content: center;
	}

	.splash-background,
	.splash-activity {
		transform: translate(-50%, -50%) scale(0.8);
		margin-top: 200px;
	}

	.splash-triangle > svg {
		height: 50vh;
	}

	.splash-transition-bar {
		bottom: -80px;
	}
	.splash-transition-bar > svg {
		height: 200px;
		width: 140vw;
	}

	h1 {
		font-weight: 100;
		font-size: 36px;
		margin-top: 20px;
	}

	p {
		max-width: calc(min(400px, 100vw - 40px));
		text-align: left;
		font-size: 18px;
	}

	.splash-fade {
		height: 75vh;
	}

	.splash-row {
		flex-direction: column;
		padding: 60px 0px;
	}

	.splash-row h2 {
		font-size: 36px;
	}

	.splash-row > div {
		text-align: center;
		padding: 20px;
	}

	.splash-row > div:first-child {
		margin-right: 0px;
	}
}
</style>
