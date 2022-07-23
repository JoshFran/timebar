<script setup>
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
	subYears
} from "date-fns";

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
	where
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";

import { DoughnutChart, useDoughnutChart, BarChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
Chart.register(...registerables);

import Color from "./Color.vue";
import Log from "./Log.vue";
import Icon from "./Icon.vue";
import Selector from "./Selector.vue";
import Dialog from "./Dialog.vue";
import LoginBox from "./LoginBox.vue";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import interact from "interactjs";

import invert from "invert-color";

import icons from "../icons";
import { auth } from "firebaseui";

const selectorIcons = computed(() => {
	return Object.keys(icons).map(i => ({
		name: i
	}));
});

const profileData = ref(null);

const gridMode = ref(false);

const currentTab = ref("tracking");

const db = getFirestore();

const rootEl = ref(null);

const blockSize = ref(200);
const editing = ref("");

const user = ref(null);
const isInitialized = ref(false);
const isProfileWatched = ref(false);

const position = ref({
	x: 0,
	y: 0
});

const snappedPosition = ref({
	x: 0,
	y: 0
});

function trackEvent(name, d) {
	logEvent(window.timebar.analytics, name, d);
}

let ignoreSnap = false;

watch(
	snappedPosition,
	nv => {
		if (ignoreSnap) {
			ignoreSnap = false;
			return;
		}
		console.log("snappedPosition", nv);
		startTracking(
			getClosestBlock(snappedPosition.value.x, snappedPosition.value.y)
		);
	},
	{ deep: true }
);

const blocks = ref([]);

const blockMap = computed(() => {
	let map = {};
	for (let i = 0; i < blocks.value.length; i++) {
		let x = blocks.value[i].x;
		let y = blocks.value[i].y;
		map[x + "," + y] = blocks.value[i];
	}

	return map;
});

function getBlockDirections(b) {
	let openSpots = [];
	let directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	];
	for (let d of directions) {
		let x = b.x + d[0];
		let y = b.y + d[1];
		let key = x + "," + y;
		if (!(key in blockMap.value)) {
			openSpots.push({
				x: x,
				y: y,
				relx: d[0],
				rely: d[1]
			});
		}
	}

	return openSpots;
}

const blockDirections = computed(() => {
	return blocks.value.map(block => {
		return getBlockDirections(block);
	});
});

const addBlocks = computed(nv => {
	return [];
	let adds = [];
	let directions = [
		[-1, 0],
		[-1, -1],
		[1, 0],
		[1, -1],
		[0, -1],
		[1, 1],
		[0, 1],
		[-1, 1]
	];

	for (let dir of directions) {
		let x = snappedPosition.value.x + dir[0];
		let y = snappedPosition.value.y + dir[1];
		let key = x + "," + y;
		if (!blockMap.value[key]) {
			adds.push({
				id: key,
				x: x,
				y: y
			});
		}
	}

	return adds;
});

const profile = ref(null);

// Generates blocks in a radius
function generateBlocks(radius) {
	const blocks = [];
	for (let i = -radius + 1; i < radius; i++) {
		for (let j = -radius + 1; j < radius; j++) {
			if (i * i + j * j <= radius * radius)
				blocks.push({
					id: `${i}-${j}`,
					x: i,
					y: j,
					name: `${i}-${j}`,
					color: "#0000ee"
				});
		}
	}
	return blocks;
}

//blocks.value = generateBlocks(3)

const computedTransforms = computed(() => {
	return blocks.value.map(block => {
		return getBlockTransform(block);
	});
});

const computedAddTransforms = computed(() => {
	return addBlocks.value.map(block => {
		return getBlockTransform(block);
	});
});

const container = ref({
	width: window.innerWidth,
	height: window.innerHeight
});

window.onresize = () => {
	container.value = {
		width: window.innerWidth,
		height: window.innerHeight
	};
	centerCalendar();
};

const enableTransition = ref(true);

const blockEls = ref([]);

const currentChunk = ref(null);
const currentChunkId = ref(null);
const prevChunk = ref(null);

const count = ref(0);

function lerp(v0, v1, t) {
	return v0 * (1 - t) + v1 * t;
}

function updateBlocks() {
	blockEls.value;
}

let focusBlock = null;
let focusScaleLerp = ref(0);

let oldTransforms = {};

const timeRanges = ref([]);

function getNow() {
	return Date.now();
}

function updateRanges() {
	let minTime = user.value
		? parseInt(user.value.metadata.createdAt)
		: getNow();
	let maxTime = getNow();
	console.log(new Date(minTime), new Date(maxTime));

	timeRanges.value = [
		{
			name: "Today",
			start: Math.max(getTime(startOfDay(new Date())), minTime),
			end: Math.min(getTime(endOfDay(new Date())), maxTime)
		},
		{
			name: "Yesterday",
			start: Math.max(
				getTime(startOfDay(subDays(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfDay(subDays(new Date(), 1))), maxTime)
		},
		{
			name: "This Week",
			start: Math.max(getTime(startOfWeek(new Date())), minTime),
			end: Math.min(getTime(endOfWeek(new Date())), maxTime)
		},
		{
			name: "Last Week",
			start: Math.max(
				getTime(startOfWeek(subWeeks(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfWeek(subWeeks(new Date(), 1))), maxTime)
		},
		{
			name: "This Month",
			start: Math.max(getTime(startOfMonth(new Date())), minTime),
			end: Math.min(getTime(endOfMonth(new Date())), maxTime)
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
			)
		},
		{
			name: "This Year",
			start: Math.max(getTime(startOfYear(new Date())), minTime),
			end: Math.min(getTime(endOfYear(new Date())), maxTime)
		},
		{
			name: "Last Year",
			start: Math.max(
				getTime(startOfYear(subYears(new Date(), 1))),
				minTime
			),
			end: Math.min(getTime(endOfYear(subYears(new Date(), 1))), maxTime)
		},
		{
			name: "All Time",
			start: Math.max(getTime(new Date(0)), minTime),
			end: Math.min(getTime(new Date()), maxTime)
		}
	];
}

watch(
	[user],
	() => {
		console.log("User changed");
		updateRanges();
	},
	{ deep: true }
);

updateRanges();
const currentChartRange = ref(timeRanges.value[0]);

function getBlockTransform(block) {
	let dist = Math.max(
		Math.abs(block.y - position.value.y),
		Math.abs(block.x - position.value.x)
	);
	let xdist = Math.abs(block.x - position.value.x);
	let ydist = Math.abs(block.y - position.value.y);
	let realDist = Math.sqrt(
		Math.pow(block.x - position.value.x, 2) +
			Math.pow(block.y - position.value.y, 2)
	);
	let unitX = (block.x - position.value.x) / realDist;
	let unitY = (block.y - position.value.y) / realDist;
	if (isNaN(unitX)) {
		unitX = 0;
	}
	if (isNaN(unitY)) {
		unitY = 0;
	}
	let centerX = container.value.width / 2;
	let centerY = container.value.height / 2;
	let scale = Math.min(1, Math.max(0.3, lerp(1, 0.3, realDist / 3)));
	let xs = Math.sign(block.x - position.value.x);
	let ys = Math.sign(block.y - position.value.y);
	let bx = block.x;
	let by = block.y;

	// if (xdist > 1) {
	// 	xdist += 1;
	// }
	// if (ydist > 1) {
	// 	ydist += 1;
	// }
	// if (xdist > 3) {
	// 	xdist += 2;
	// }
	// if (ydist > 3) {
	// 	ydist += 2;
	// }
	// bx += (xdist * unitX * -1) / 4;
	// by += (ydist * unitY * -1) / 4;

	// bx = position.value.x + unitX * xdist * scale * 1.5;
	// by = position.value.y + unitY * ydist * scale * 1.5;

	// scale = 1;
	let x =
		centerX -
		blockSize.value / 2 +
		(bx - position.value.x) * blockSize.value;
	let y =
		centerY -
		blockSize.value / 2 +
		(by - position.value.y) * blockSize.value;

	let xd = centerX - blockSize.value / 2;
	let yd = centerY - blockSize.value / 2;

	//x += (position.value.x - block.x)
	if (
		block.x == snappedPosition.value.x &&
		block.y == snappedPosition.value.y
	) {
		//scale = 1
	}

	// x += xs * (realDist * blockSize.value / 8)
	// y += ys * (realDist * blockSize.value / 8)

	if (dist >= 1) {
		//scale = 0.5
	}

	// y += scale * (position.value.y - block.y) * blockSize.value
	let oldX = 0;
	let oldY = 0;
	if (oldTransforms[block.id]) {
		oldX = oldTransforms[block.id]["data-x"];
		oldY = oldTransforms[block.id]["data-y"];
	}
	let distx = Math.sqrt(Math.pow(x - oldX, 2) + Math.pow(y - oldY, 2));
	let dur = 0.3 + realDist / 5;

	if (gridMode.value) {
		scale = 0.9;
	} else {
	}
	let shouldtrans = true;
	if (currentHolding.value && currentHolding.value.id == block.id) {
		shouldtrans = false;
	}
	if (isZooming.value) {
		shouldtrans = false;
	}
	let cube = `cubic-bezier(0.32, 0.86, .5, ${0.9 +
		Math.min(distx / 1000, 0.1)})`;
	let trs = {
		"data-x": x,
		"data-y": y,
		transform: `translate(${x}px, ${y}px) scale(calc(${scale} + var(--add-scale)))`,
		width: `${blockSize.value}px`,
		height: `${blockSize.value}px`,
		opacity: 1,
		transition:
			enableTransition.value && shouldtrans
				? `width ${dur}s ${cube}, height ${dur}s ${cube}, transform ${dur}s ${cube}`
				: "none"
	};

	oldTransforms[block.id] = trs;

	if (block.id == editing.value) {
		return {
			// width: "100%",
			// height: "100%",
			// transform: `translate(${centerX - 250}px, ${centerY - 250}px) scale(1)`,
			// zIndex: 10,
			// transition: `.3s`
		};
	}

	return trs;
}

document.addEventListener("keydown", e => {
	if (e.key == "Enter") {
		if (!editing.value)
			editBlock(getClosestBlock(position.value.x, position.value.y));
	}
});

document.addEventListener("keyup", e => {
	// Arrow keys for position movement
	if (currentTab.value != "tracking") return;
	if (e.target.closest("input")) return;
	let t = false;
	if (e.keyCode === 37) {
		position.value.x--;
		t = true;
	} else if (e.keyCode === 38) {
		position.value.y--;
		t = true;
	} else if (e.keyCode === 39) {
		position.value.x++;
		t = true;
	} else if (e.keyCode === 40) {
		position.value.y++;
		t = true;
	}

	if (t)
		setTimeout(() => {
			snapPosition();
			updateGlobal();
		}, 10);
});

function getClosestBlock(x, y, ignore) {
	let closest = null;
	let minDist = Infinity;
	for (let block of blocks.value) {
		if (ignore && ignore.id == block.id) continue;
		let dist = Math.sqrt(
			Math.pow(block.x - x, 2) + Math.pow(block.y - y, 2)
		);
		if (dist < minDist) {
			minDist = dist;
			closest = block;
		}
	}

	return closest;
}

function getBlockAt(x, y, ignore) {
	if (displaced.value) {
		if (displacedPos.value.x == x && displacedPos.value.y == y) {
			return displaced.value;
		}
	}
	for (let block of blocks.value) {
		if (ignore && ignore.id == block.id) continue;
		if (block.x == x && block.y == y) {
			return block;
		}
	}

	return null;
}

function formatDate(d) {
	if (selectedWeek.value.start.getYear() == selectedWeek.value.end.getYear())
		return format(d, "MMM d");
	else return format(d, "MMM d yyyy");
}

const actions = [];
let actionTimeout = null;

function enqueueDBAction(fn) {
	clearTimeout(actionTimeout);
	actions.push(fn);

	actionTimeout = setTimeout(() => {
		for (let a of actions) a();

		actions.splice(0, actions.length);
	}, 500);
}

function getSetting(name, defaultValue) {
	let profData = profileData.value; // This will subscribe to profile data so that we notify computed props that this func has updated
	if (profData && profData.settings) {
	}
	if (!isInitialized.value) return defaultValue;

	if (profData.settings && profData.settings[name]) {
		return profData.settings[name];
	} else {
		return defaultValue;
	}
}

let settingTimeout = null;

function setSetting(name, value) {
	if (!isInitialized.value) return;

	if (profileData.value) {
		if (!profileData.value.settings) profileData.value.settings = {};
		profileData.value.settings[name] = value;
	}

	let dRef = getProfRef();
	enqueueDBAction(() => {
		updateDoc(dRef, {
			[["settings." + name]]: value
		});
	});
}

async function deleteBlock(block) {
	trackEvent("delete_block");

	if (blocks.value.length == 1) {
		return;
	}

	for (let i = updates.length - 1; i >= 0; i--) {
		if (updates[i].block.id == block.id) {
			updates.splice(i, 1);
		}
	}

	let dRef = getProfRef();
	await updateDoc(dRef, {
		[["blocks." + block.id]]: deleteField()
	});
}

function updateGlobal() {
	let b = getClosestBlock(position.value.x, position.value.y);
	snappedPosition.value.x = b.x;
	snappedPosition.value.y = b.y;
}

function snapPosition() {
	let b = getClosestBlock(position.value.x, position.value.y);
	position.value.x = b.x;
	position.value.y = b.y;
}

function selectTab(t) {
	trackEvent("select_tab", { name: t });
	currentTab.value = t;
	gridMode.value = false;
	if (t == "chart") {
		currentChartRange.value = timeRanges.value[0];
	}
}

let lastSelectedTime = 0;

function selectBlock(block) {
	lastSelectedTime = Date.now();
	if (editing.value || gridMode.value) return;

	position.value.x = block.x;
	position.value.y = block.y;

	trackEvent("select_block");

	updateGlobal();
}

function editBlock(block) {
	editing.value = block.id;
	setTimeout(() => {
		if (window.innerWidth > 900)
			document.querySelector("#focus-input").focus();
	}, 1);
}

let holdTimeout = null;

const currentHolding = ref(null);

function startHold(block, isClick) {
	if (gridMode.value) {
		currentHolding.value = block;
		return;
	}

	if (isClick || window.innerWidth > 901) {
		return;
	}

	clearTimeout(holdTimeout);
	holdTimeout = setTimeout(() => {
		trackEvent("hold_block");
		editing.value = block.id;
		setTimeout(() => {
			//document.querySelector("#focus-input").focus()
		}, 1);
	}, 500);
}

function endHold() {
	clearTimeout(holdTimeout);
}

function getBlockById(id) {
	for (let block of blocks.value) {
		if (block.id == id) {
			return block;
		}
	}

	return null;
}

function getBlockIndex(id) {
	for (let [i, block] of blocks.value.entries()) {
		if (block.id == id) {
			return i;
		}
	}

	return null;
}

async function initChunk(first) {
	let c = getCurrentChunk();
	trackEvent("init_chunk", {
		first: first,
		time: c
	});
	let cref = getChunkRef();
	let data = {
		created: getNow()
	};
	if (first) {
		data.log = {
			[Math.floor(getNow() / 1000) - c]: "aa"
		};
	} else {
		// let latestTimerQuery = query(collection(db, "users", user.value.uid, "chunks"), orderBy("updated", "desc"), limit(1));
		// let docs = await getDocs(latestTimerQuery);
		// if (docs.length > 0) {
		// 	let latestTimer = docs[0].data
		// 	let log = latestTimer.log
		// 	let lastTime = Object.keys(log).sort()[0]
		// 	let lastValue = log[lastTime]
		// 	data.log = {
		// 		[Math.floor(getNow() / 1000) - c]: lastValue
		// 	}
		// }
	}
	await setDoc(cref, data, { merge: true });
}

const userMenu = computed(() => {
	if (!user.value) {
		return [{ name: "Login", icon: "sign-in-alt" }];
	} else {
		let x = [
			{ name: "Get My Data", icon: "download" },
			{ name: "Logout", icon: "sign-out-alt" }
		];

		if (user.value.isAnonymous)
			x.unshift({ name: "Save", icon: "cloud-upload-alt" });

		x.unshift({
			name: user.value.displayName || "Anonymous",
			icon: "user"
		});
		return x;
	}
});

function refreshConnection(u) {
	user.value = u;
	if (u) {
		console.log("Refreshing connection");
		updateRanges();
		if (u.isAnonymous) {
			if (parseInt(u.metadata.createdAt) < getNow() - 10 * 1000) {
				trackEvent("show_should_upgrade");
				shouldUpgradeAccount.value = true;
			}
		}
		const unsubscribe = onSnapshot(
			doc(db, "users", user.value.uid),
			snapshot => {
				isProfileWatched.value = true;
				let d = snapshot.data();

				if (d) {
					isInitialized.value = true;
					console.log("Got new profile snapshot: ", d);
					blocks.value = Object.keys(d.blocks).map(
						id => d.blocks[id]
					);
					profileData.value = d;
				}
			}
		);

		let cref = getChunkRef();
		let latestQuery = query(
			collection(db, "users", user.value.uid, "chunks"),
			orderBy("created", "desc"),
			limit(1)
		);

		let justStarted = true;

		const unsub2 = onSnapshot(latestQuery, snapshots => {
			let snapshot = snapshots.docs[0];
			isProfileWatched.value = true;

			if (snapshot.exists()) {
				let d = snapshot.data();
				currentChunk.value = d;
				currentChunkId.value = snapshot.id;

				if (!currentChunk.value.log) {
					currentChunk.value.log = {};
				}

				if (currentTracking.value) {
					let b = getBlockById(currentTracking.value.block);
					if (
						justStarted ||
						lastSelectedTime < Date.now() - 1000 * 5
					) {
						justStarted = false;
						if (b) {
							ignoreSnap = true;
							snappedPosition.value.x = b.x;
							snappedPosition.value.y = b.y;
							position.value.x = b.x;
							position.value.y = b.y;
							setTimeout(() => {
								ignoreSnap = false;
							}, 10);
						}
					}
				}
			} else {
				console.log("Creating new chunk");
				initChunk();
			}
		});

		let latestTimerQuery = query(
			collection(db, "users", user.value.uid, "chunks"),
			orderBy("updated", "desc"),
			limit(1)
		);

		// const unsub3 = onSnapshot(latestTimerQuery, snapshots => {
		// 	if (snapshots.docs.length == 0) {
		// 		console.log("User doesn't yet have any chunks that were updated");

		// 		return;
		// 	}

		// 	let snapshot = snapshots.docs[0]

		// 	if (snapshot.exists()) {
		// 		let d = snapshot.data()
		// 		console.log(d);
		// 	}else{

		// 	}
		// });

		let crefPrev = getPrevChunkRef();

		/*const unsub3 = onSnapshot(crefPrev, snapshot => {
			if (snapshot.exists()) {
				let d = snapshot.data()
				prevChunk.value = d
				if (!prevChunk.value.log) {
					prevChunk.value.log = {}
				}
			}
		});*/
	}
}

let scale = ref(1);

function findMiddle() {
	let x = 0;
	let y = 0;
	for (let block of blocks.value) {
		x += block.x;
		y += block.y;
	}
	x /= blocks.value.length;
	y /= blocks.value.length;
	return {
		x,
		y
	};
}

function enterGridMode() {
	trackEvent("enter_grid_mode");
	gridMode.value = true;
	/*let p = findMiddle()
	position.value.x = p.x
	position.value.y = p.y
	snapPosition()
	updateGlobal()*/
	isDeleting.value = false;
}

function exitGridMode() {
	gridMode.value = false;
	isDeleting.value = false;
	if (currentHolding.value) {
		currentHolding.value = null;
	}
	updateGlobal();
}

let saveTimeout = null;

let updates = [];

function updateBlock(block, v) {
	trackEvent("update_block");
	clearTimeout(saveTimeout);
	updates.push({ block, value: v });
	for (let k of Object.keys(v)) {
		block[k] = v[k];
	}

	saveTimeout = setTimeout(() => {
		let dRef = getProfRef();
		let updateMap = {};
		for (let update of updates) {
			for (let k of Object.keys(update.value)) {
				updateMap[["blocks." + update.block.id + "." + k]] =
					update.value[k];
			}
		}
		updates = [];
		console.log(updateMap);
		updateDoc(dRef, updateMap);
	}, 1000);
}

watch(scale, () => {
	if (editing.value) {
		scale.value = 1;
	}

	if (scale.value < 0) {
		scale.value = 0;
	}
	if (scale.value > 1) {
		scale.value = 1;
	}

	if (scale.value > 0.5) {
		if (gridMode.value) {
			exitGridMode();
		}
	} else {
		if (!gridMode.value) {
			enterGridMode();
		}
	}

	blockSize.value = lerp(80, 200, scale.value);
});

setInterval(() => {
	if (!isZooming.value)
		if (gridMode.value) {
			scale.value = lerp(scale.value, 0, 0.7);
		} else {
			scale.value = lerp(scale.value, 1, 0.7);
		}
}, 200);

const calendarScale = ref(1);

const dayNames = ref(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

window.getChunks = async () => {
	let chunksList = {};
	(
		await getDocs(query(collection(db, "users", user.value.uid, "chunks")))
	).forEach(doc => {
		chunksList[doc.id] = doc.data();
	});
	return chunksList;
};

window.addEventListener("mousewheel", e => {
	if (currentTab.value == "tracking") {
		scale.value -= e.deltaY / 1000;
	} else {
		if (!e.target.closest(".calendar")) return;
		let oldScale = calendarScale.value;
		let py = e.clientY;
		let ty = (py - calendarY.value) / calendarScale.value;

		calendarScale.value -= (e.deltaY / 1000) * calendarScale.value;
		calendarScale.value = Math.min(90, Math.max(1, calendarScale.value));

		calendarY.value = -ty * calendarScale.value + py; //calendarY.value - (e.clientY / window.innerHeight) * (600 * calendarScale.value - 600 * oldScale)

		if (600 * calendarScale.value < window.innerHeight) {
			centerCalendar();
		}
	}
});

const calendarInfo = computed(() => {
	let d = new Date();

	if (window.innerWidth < 900) {
		return {
			week: getWeek(d),
			day: getDay(new Date(selectedWeek.value.start))
		};
	}

	return {
		week: getWeek(d),
		day: getDay(d)
	};
});

function centerCalendar() {
	calendarX.value = (window.innerWidth - window.innerWidth * 0.8) / 2;
	calendarY.value = (window.innerHeight - 600 * calendarScale.value) / 2;
}

const isZooming = ref(false);

const startGridPosition = ref({ x: 0, y: 0 });
const displaced = ref(null);
const displacedPos = ref(null);

const calendarDragging = ref(false);

onMounted(() => {
	interact(document.querySelector("#calendar-area"))
		.gesturable({
			listeners: {
				start(event) {},
				move(event) {
					//calendarScale.value += event.ds
					let py = event.client.y;
					let ty = (py - calendarY.value) / calendarScale.value;

					calendarScale.value -= event.ds * -1 * calendarScale.value;
					calendarScale.value = Math.min(
						90,
						Math.max(1, calendarScale.value)
					);

					calendarY.value = -ty * calendarScale.value + py;

					if (600 * calendarScale.value < window.innerHeight) {
						centerCalendar();
					}
				},
				end(event) {}
			}
		})
		.draggable({
			//lockAxis: "start",
			listeners: {
				start(event) {
					calendarDragging.value = true;
				},
				move(event) {
					if (isResizing.value) {
						setResizeTarget(event.client.y);
						return;
					}
					//calendarX.value += event.dx * calendarScale.value
					if (600 * calendarScale.value > window.innerHeight) {
						calendarY.value += event.dy;
					}

					if (calendarY.value + 600 * calendarScale.value < 100) {
						calendarY.value = 100 - 600 * calendarScale.value;
					}

					if (calendarY.value > window.innerHeight - 100) {
						calendarY.value = window.innerHeight - 100;
					}

					//calendarSwipeX.value += event.dx
				},
				end(event) {
					calendarDragging.value = false;
					if (isResizing.value) {
						confirmResize();
						isResizing.value = false;
					}
					calendarSwipeX.value = 0;
				}
			}
		});

	interact(rootEl.value)
		.gesturable({
			listeners: {
				start(event) {
					isZooming.value = true;
				},
				move(event) {
					clearTimeout(holdTimeout);
					scale.value += event.ds;
				},
				end(event) {
					//scale.value += event.ds
					isZooming.value = false;
				}
			}
		})
		.draggable({
			inertia: {
				endSpeed: 100,
				enabled: false,
				allowResume: false
			},
			listeners: {
				start(event) {
					if (gridMode.value) {
						if (currentHolding.value) {
							startGridPosition.value.x = currentHolding.value.x;
							startGridPosition.value.y = currentHolding.value.y;
						}

						return;
					}
					enableTransition.value = false;
					//console.log(event.type, event.target)
				},
				move(event) {
					if (gridMode.value) {
						if (event.client.y < 90) {
							isDeleting.value = true;
						} else {
							isDeleting.value = false;
						}
						if (currentHolding.value) {
							currentHolding.value.x += event.dx / 80;
							currentHolding.value.y += event.dy / 80;
							let rx = Math.round(currentHolding.value.x);
							let ry = Math.round(currentHolding.value.y);
							let closest = getBlockAt(
								rx,
								ry,
								currentHolding.value
							);
							if (
								rx == startGridPosition.value.x &&
								ry == startGridPosition.value.y
							) {
								closest = null;
							}
							if (!closest) {
								if (displaced.value) {
									updateBlock(displaced.value, {
										x: displacedPos.value.x,
										y: displacedPos.value.y
									});
									displaced.value = null;
								}
								return;
							}
							if (displaced.value) {
								if (displaced.value.id != closest.id) {
									updateBlock(displaced.value, {
										x: displacedPos.value.x,
										y: displacedPos.value.y
									});
									displaced.value = null;
								}
							}

							if (
								!displaced.value &&
								closest.id != currentHolding.value.id
							) {
								displaced.value = closest;
								displacedPos.value = {
									x: displaced.value.x,
									y: displaced.value.y
								};
							}

							if (displaced.value) {
								updateBlock(displaced.value, {
									x: startGridPosition.value.x,
									y: startGridPosition.value.y
								});
							}
						}

						return;
					}
					clearTimeout(holdTimeout);
					if (!editing.value) {
						position.value.x -= event.dx / 150;
						position.value.y -= event.dy / 150;
						updateGlobal();
					}
					//console.log(event.type, event.target)
				}
			}
		})
		.on("dragend", event => {
			if (gridMode.value) {
				if (event.client.y < 90) {
					if (currentHolding.value) {
						deleteBlock(currentHolding.value);
						currentHolding.value = null;
					}
				}

				if (currentHolding.value) {
					updateBlock(currentHolding.value, {
						x: Math.round(currentHolding.value.x),
						y: Math.round(currentHolding.value.y)
					});
				}

				if (displaced.value) {
					updateBlock(displaced.value, {
						x: startGridPosition.value.x,
						y: startGridPosition.value.y
					});
					displaced.value = null;
				}
				currentHolding.value = null;
				return;
			}

			enableTransition.value = true;
			snapPosition();
			//console.log(event.type, event.target)
		});
});

const creatingUser = ref(false);

function getProfRef() {
	return doc(db, "users", user.value.uid);
}

function keysIntoLinearLog(c) {
	return Object.keys(c.log)
		.map(key => [parseInt(key), c.log[key]])
		.sort((a, b) => a[0] - b[0]);
}

let linearLog = computed(() => {
	let log = [];
	/*if (prevChunk.value && prevChunk.value.log) {
		log = keysIntoLinearLog(prevChunk.value)
	}*/

	if (currentChunk.value && currentChunk.value.log) {
		log = log.concat(keysIntoLinearLog(currentChunk.value));
	}

	return log;
});

let latestTracking = computed(() => {
	let cc = floorToChunk(getNow());
	if (currentChunk.value && currentChunk.value.log) {
		let x = Object.keys(currentChunk.value.log)
			.map(a => parseInt(a))
			.sort((a, b) => a - b);
		if (x.length > 0) {
			return [
				cc * 1000 + x[x.length - 1] * 1000,
				currentChunk.value.log[x[x.length - 1]]
			];
		}
	}

	let cid = floorToChunk(getNow());
	return [0, "aa"];
});

function getLogItemIndex(time) {
	return linearLog.value.findIndex(item => item[0] == time);
}

function getCurrentChunk() {
	let n = getNow();
	return (
		Math.floor(n / (1000 * chunkIntervalSeconds)) * chunkIntervalSeconds
	).toString();
}

function getCurrentTime() {
	let c = getCurrentChunk();
	let n = getNow();
	return Math.floor(n / 1000) - c;
}

function currentRealTime() {
	return getNow();
}

const currentTracking = computed(() => {
	// let log = linearLog.value
	// if (log.length == 0) {
	// 	return null
	// }
	// let last = log[log.length - 1]

	let last = latestTracking.value;
	return {
		time: last[0],
		block: last[1]
	};
});

let trackingTimeout = null;

function startTracking(block) {
	console.log("started tracking", block);
	trackEvent("start_tracking", {
		name: block.name
	});

	let cref = getChunkRef();
	let log = linearLog.value;
	let t = getCurrentTime();

	if (log.length > 0) {
		let last = log[log.length - 1];
		if (last[1] == block.id) {
			return;
		}

		if (last[0] + 15 > t) {
			t = last[0];
		}
	}

	if (currentChunk.value) {
		currentChunk.value.log[t.toString()] = block.id;
	}

	if (trackingTimeout) clearTimeout(trackingTimeout);

	trackingTimeout = setTimeout(async () => {
		try {
			await updateDoc(cref, {
				updated: getNow(),
				[["log." + t.toString()]]: block.id
			});
			console.log("Updated existing chunk");
		} catch (e) {
			console.error(e);
			console.log("Creating new chunk");
			await initChunk();

			await updateDoc(cref, {
				updated: getNow(),
				[["log." + t.toString()]]: block.id
			});
		}
	}, 1000);
}

function getChunkRef() {
	let m = getCurrentChunk();
	return doc(db, "users", user.value.uid, "chunks", m);
}

function getPrevChunkRef() {
	let m = (parseInt(getCurrentChunk()) - chunkIntervalSeconds).toString();
	return doc(db, "users", user.value.uid, "chunks", m);
}

let templates = {
	"58": {
		x: -2,
		id: "58",
		color: "#2196f3",
		y: 1,
		icon: "youtube",
		name: "youtube"
	},
	bq: {
		y: 3,
		color: "#f44336",
		id: "bq",
		name: "diy",
		icon: "hammer",
		x: 0
	},
	dz: {
		id: "dz",
		y: -1,
		color: "#673ab7",
		name: "shower",
		x: 2
	},
	zk: {
		name: "email",
		x: 0,
		color: "#8bc34a",
		id: "zk",
		y: -3
	},
	oc: {
		x: -1,
		id: "oc",
		color: "#8bc34a",
		name: "admin",
		y: -2
	},
	"8q": {
		y: 2,
		x: 0,
		color: "#f44336",
		id: "8q",
		name: "cleaning"
	},
	mo: {
		color: "#673ab7",
		name: "dishes",
		y: 0,
		x: 2,
		id: "mo"
	},
	rk: {
		y: 0,
		x: 3,
		icon: "kitchen-set",
		color: "#673ab7",
		name: "cooking",
		id: "rk"
	},
	so: {
		id: "so",
		color: "#8bc34a",
		x: 0,
		name: "learning",
		y: -2
	},
	ab: {
		name: "internet",
		id: "ab",
		color: "#2196f3",
		y: 0,
		x: -2
	},
	fr: {
		x: 1,
		y: 0,
		id: "fr",
		name: "eating",
		color: "#673ab7"
	},
	lh: {
		id: "lh",
		color: "#f44336",
		name: "driving",
		x: 0,
		y: 1,
		icon: "car"
	},
	zq: {
		x: -1,
		id: "zq",
		y: 0,
		name: "tv",
		color: "#2196f3"
	},
	pd: {
		id: "pd",
		x: -1,
		y: 2,
		name: "groceries",
		color: "#f44336"
	},
	"0p": {
		id: "0p",
		y: -2,
		color: "#8bc34a",
		name: "meeting",
		x: 1
	},
	"8r": {
		y: -1,
		id: "8r",
		name: "working",
		color: "#8bc34a",
		icon: "briefcase",
		x: 0
	},
	gn: {
		color: "#f44336",
		name: "shopping",
		x: 1,
		y: 2,
		id: "gn"
	},
	aa: {
		id: "aa",
		name: "sleeping",
		color: "#7a7a7a",
		y: 0,
		x: 0
	},
	zc: {
		y: 0,
		name: "gaming",
		id: "zc",
		color: "#2196f3",
		x: -3
	},
	bi: {
		color: "#673ab7",
		x: 2,
		id: "bi",
		name: "brushing",
		y: 1
	},
	hd: {
		icon: "thumbs-up",
		y: -1,
		color: "#2196f3",
		name: "social media",
		x: -2,
		id: "hd"
	}
};

function initUser(useTemplate) {
	creatingUser.value = true;
	setTimeout(async () => {
		let dRef = getProfRef();
		await setDoc(
			dRef,
			{
				name: "",
				blocks: useTemplate
					? templates
					: {
							aa: {
								id: "aa",
								x: 0,
								y: 0,
								name: "Internet",
								color: "#2196f3"
							}
					  },
				created: getNow()
			},
			{ merge: true }
		);
		await initChunk(true);
		creatingUser.value = false;
		isInitialized.value = true;

		console.log("initialized");
	}, 300);
}

function formatTime(t) {
	let dec = t - Math.floor(t);
	return `${Math.floor(t)}:${Math.round(dec * 60)
		.toString()
		.padStart(2, "0")}`;
}

function formatTimeClockMode(t) {
	let dec = t - Math.floor(t);
	let suffix = "";
	if (clockMode.value == "12h") {
		if (t >= 12) {
			t -= 12;
			suffix = "p";
		} else {
			suffix = "a";
		}

		if (Math.floor(t) == 0) {
			t = 12;
		}
	}
	return `${Math.floor(t)}:${Math.round(dec * 60)
		.toString()
		.padStart(2, "0")}${suffix}`;
}

function getNewId() {
	let id = (Math.random() * 100000).toString(36).slice(-2);
	while (blocks.value.find(b => b.id == id)) {
		id = (Math.random() * 100000).toString(36).slice(-2);
	}
	return id;
}

async function addBlock(x, y) {
	trackEvent("add_block");

	let dRef = getProfRef();
	let id = getNewId();
	await updateDoc(dRef, {
		[["blocks." + id]]: {
			id: id,
			x: x,
			y: y,
			name: "Activity",
			color: "#9c27b0"
		}
	});
	if (window.innerWidth < 900) {
		position.value.x = x;
		position.value.y = y;
		updateGlobal();
	}
}

const isDeleting = ref(false);
const currentTimeUpdating = ref(currentRealTime());

setInterval(() => {
	currentTimeUpdating.value = currentRealTime();
	let currentChunkNow = getCurrentChunk();
	if (currentChunkNow != currentChunkId.value) {
		initChunk();
	}
}, 1000);

document.addEventListener("mouseup", () => {
	currentHolding.value = null;
	isResizing.value = false;
});

function formatSeconds(s) {
	if (s >= 60 * 60 * 24) {
		return (s / (60 * 60 * 24)).toFixed(1) + "d";
	} else if (s >= 60 * 60) {
		return (
			formatTime(s / (60 * 60)) + ":" + formatTime(s / 60).split(":")[1]
		); //(s / (60 * 60)).toFixed(1) + "h"
	} else if (s >= 60) {
		return formatTime(s / 60); //Math.round((s / 60 * 10)) / 10 + "m"
	} else {
		return s + "s";
	}
}

const calendarX = ref(0);
const calendarY = ref(0);
const calendarSwipeX = ref(0);

centerCalendar();

const chunkCache = ref({});

const chunkIntervalSeconds = 60 * 60 * 24 * 14;

function floorToChunk(t) {
	let n = t;
	let cid =
		Math.floor(n / (1000 * chunkIntervalSeconds)) * chunkIntervalSeconds;
	return cid;
}

async function getChunkForTime(t) {
	let cid = floorToChunk(t).toString();

	if (cid == getCurrentChunk()) {
		return currentChunk.value;
	}

	let cRef = doc(db, "users", user.value.uid, "chunks", cid);
	if (chunkCache.value[cid]) {
		return chunkCache.value[cid];
	} else {
		let c = await getDoc(cRef);
		if (c && c.exists()) {
			chunkCache.value[cid] = c.data();
			return c;
		}
	}

	return null;
}

function setKeyWithDotsInObj(obj, key, value) {
	let keys = key.split(".");
	let last = keys.pop();
	let o = obj;
	for (let k of keys) {
		if (!o[k]) {
			o[k] = {};
		}
		o = o[k];
	}
	o[last] = value;
}

function deleteKeyWithDotsInObj(obj, key) {
	let keys = key.split(".");
	let last = keys.pop();
	let o = obj;
	for (let k of keys) {
		if (!o[k]) {
			return;
		}
		o = o[k];
	}
	delete o[last];
}

async function setKeyInChunk(time, key, value) {
	let cid = floorToChunk(time).toString();
	let cRef = doc(db, "users", user.value.uid, "chunks", cid);
	let c = await getChunkForTime(time);

	if (c) {
		setKeyWithDotsInObj(c, key, value);
	}

	enqueueDBAction(() => {
		updateDoc(cRef, {
			[[key]]: value
		});
	});
}

async function deleteKeyInChunk(time, key) {
	let cid = floorToChunk(time).toString();
	let cRef = doc(db, "users", user.value.uid, "chunks", cid);
	let c = await getChunkForTime(time);

	if (c) {
		deleteKeyWithDotsInObj(c, key);
	}

	enqueueDBAction(() => {
		updateDoc(cRef, {
			[[key]]: deleteField()
		});
	});
}

async function getLatestTimeLog(time) {
	let c = await getChunkForTime(time);
	let ctime = floorToChunk(time);
	let rtime = time / 1000 - ctime;
	if (c) {
		let log = Object.keys(c.log)
			.map(v => [parseInt(v), c.log[v]])
			.filter(v => v[0] <= rtime)
			.sort((a, b) => a[0] - b[0]);
		if (log.length > 0) {
			return {
				log: log[log.length - 1],
				chunk: ctime
			};
		}
	}

	let cBack = await getChunkForTime(time - 1000 * chunkIntervalSeconds);
	ctime = floorToChunk(time - 1000 * chunkIntervalSeconds);
	rtime = time / 1000 - ctime;
	if (cBack) {
		let log = Object.keys(cBack.log)
			.map(v => [parseInt(v), cBack.log[v]])
			.filter(v => v[0] <= rtime)
			.sort((a, b) => a[0] - b[0]);
		if (log.length > 0) {
			return {
				log: log[log.length - 1],
				chunk: ctime
			};
		}
	}

	return null;
}

async function getLogForDay(day) {
	let chunk = await getChunkForTime(day);
	let chunkStart = floorToChunk(day);
	let dayInSeconds = day / 1000;

	let fakeData = false;
	if (fakeData) {
		let a = [];
		let n = 24 * 60;
		for (let i = 0; i < n; i++) {
			let rng = Math.floor(Math.random() * blocks.value.length);
			let size = Math.floor(Math.random() * 10);
			if (Math.random() > 0.9) size = Math.floor(Math.random() * 100);

			i += size;
			a.push([
				dayInSeconds - chunkStart + (i / n) * 60 * 60 * 24,
				blocks.value[rng].id
			]);
		}
		return a;
	}

	if (chunk && chunk.log) {
		let logs = Object.keys(chunk.log)
			.map(v => [parseInt(v), chunk.log[v]])
			.sort((a, b) => a[0] - b[0])
			.filter(v => {
				let vi = v[0] + chunkStart;
				if (vi >= dayInSeconds && vi < dayInSeconds + 60 * 60 * 24) {
					return true;
				}
			});

		if (logs.length == 0) {
			let lastActivity = await getLatestTimeLog(day);
			if (lastActivity) {
				if (lastActivity.chunk + lastActivity.log[0] > dayInSeconds) {
					return [];
				}

				if (day > getNow()) {
					return [];
				}

				if (
					lastActivity.chunk + lastActivity.log[0] >
					dayInSeconds + 24 * 60 * 60
				) {
					return [
						[dayInSeconds - chunkStart, lastActivity.log[1]],
						[
							dayInSeconds - chunkStart + 60 * 60 * 24,
							lastActivity.log[1]
						]
					];
				} else {
					return [
						[dayInSeconds - chunkStart, lastActivity.log[1]]
						//[dayInSeconds - chunkStart + (getNow() - day) / 1000, lastActivity.log[1]]
					];
				}
			}
			return [];
		} else {
			return logs;
		}
	} else {
		return [];
	}
}

const selectedTime = ref(new Date());

const selectedWeek = computed(() => {
	let time = selectedTime.value;
	if (window.innerWidth <= 900) {
		return {
			start: startOfDay(time),
			end: startOfDay(time)
		};
	}
	return {
		start: startOfWeek(time),
		end: endOfWeek(time)
	};
});

const calendarAnimating = ref(false);
const calendarAnimatingTo = ref(0);

const weekTimeChunks = ref([[], [], [], [], [], [], []]);

function prevWeek() {
	calendarAnimating.value = true;
	calendarAnimatingTo.value = 1;
	setTimeout(() => {
		weekTimeChunks.value = [[], [], [], [], [], [], []];
		if (window.innerWidth <= 900) {
			selectedTime.value = subDays(selectedTime.value, 1);
		} else {
			selectedTime.value = subWeeks(selectedTime.value, 1);
		}
		calendarAnimating.value = false;
	}, 300);
}

function nextWeek() {
	calendarAnimatingTo.value = -1;
	calendarAnimating.value = true;
	setTimeout(() => {
		weekTimeChunks.value = [[], [], [], [], [], [], []];
		if (window.innerWidth <= 900) {
			selectedTime.value = addDays(selectedTime.value, 1);
		} else {
			selectedTime.value = addWeeks(selectedTime.value, 1);
		}
		calendarAnimating.value = false;
	}, 300);
}

const weekList = computed(() => {
	let x = [];
	let d = new Date();
	for (let i = 0; i < 24; i++) {
		let t = subWeeks(d, i);
		x.push({
			time: t,
			name: format(t, "dd MMMM yyyy")
		});
	}
	return x;
});

function selectWeek(time) {
	selectedTime.value = time.time;
}

const chartRange = ref(1);

watch(
	[selectedWeek, currentChunk],
	async () => {
		let sow = getTime(startOfWeek(new Date(selectedWeek.value.start)));
		let days = [];
		let dbefore = await getLogForDay(sow - 24 * 60 * 60 * 1000);
		for (let i = 0; i < 7; i++) {
			let startOfDay = sow + i * 24 * 60 * 60 * 1000;
			let startOfDayChunk = startOfDay / 1000 - floorToChunk(startOfDay);
			let d = await getLogForDay(startOfDay);
			if (d.length > 0) {
				if (d[0][0] != startOfDay / 1000) {
					if (dbefore.length > 0)
						d.unshift([
							startOfDayChunk,
							dbefore[dbefore.length - 1][1]
						]);
				}
			}

			let parts = [];
			for (let j = 0; j < d.length; j++) {
				let e = Math.min(
					getNow() / 1000 - floorToChunk(startOfDay),
					startOfDayChunk + 24 * 60 * 60
				);
				if (j < d.length - 1) {
					e = d[j + 1][0];
				}
				parts.push({
					start: d[j][0] - startOfDayChunk,
					end: e - startOfDayChunk,
					block: getBlockById(d[j][1]) || {
						color: "white",
						name: "Unknown"
					}
				});
			}

			days.push(
				parts.sort((a, b) => b.end - b.start - (a.end - a.start))
			);

			dbefore = d;
		}

		weekTimeChunks.value = days;
	},
	{ deep: true }
);

const weekTimeChunksInView = computed(() => {
	let chunks = weekTimeChunks.value;

	let sizeInPixels = 600 * calendarScale.value;

	let sy = Math.abs(Math.min(0, calendarY.value / sizeInPixels));
	let ey = sy + innerHeight / sizeInPixels;
	let dayInSeconds = 24 * 60 * 60;

	sy *= dayInSeconds;
	ey *= dayInSeconds;

	return chunks
		.map(day =>
			day.filter(
				v =>
					(sy < v.start && v.start < ey) ||
					(sy < v.end && v.end < ey) ||
					(v.start < sy && ey < v.end)
			)
		)
		.map(day => (day.length > 50 ? day.slice(0, 50) : day));
});

const divisions = ref([
	[0, 24],
	[1, 24],
	[2, 24 * 2],
	[3, 24 * 4],
	[10, 24 * 6],
	[15, 24 * 12]
]);

const currentDivision = computed(() => {
	for (let i = 0; i < divisions.value.length; i++) {
		if (divisions.value[i][0] >= calendarScale.value) {
			return divisions.value[i - 1][1];
		}
	}

	return divisions.value[divisions.value.length - 1][1];
});

const resizingDay = ref(null);
const resizingBlockA = ref(null);
const resizingBlockB = ref(null);
const resizingEdge = ref(null);
const resizingEdgeChunkTime = ref(null);
const resizingEdgeRealTime = ref(null);
const resizingBlockTarget = ref(0);
const isResizing = ref(false);

function download(filename, text) {
	var element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(text)
	);
	element.setAttribute("download", filename);

	element.style.display = "none";
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

window.devImportData = function(json) {
	updateDoc(doc(db, "users", user.value.uid), json.profile);
	for (let chunk of Object.keys(json.chunks)) {
		setDoc(
			doc(db, "users", user.value.uid, "chunks", chunk),
			json.chunks[chunk]
		);
	}
};

window.downloadData = function() {
	let d = {};

	if (prevChunk.value) {
		d[getPrevChunkRef().id] = prevChunk.value;
	}

	if (currentChunk.value) {
		d[getChunkRef().id] = currentChunk.value;
	}

	download("data.json", JSON.stringify(d, null, "\t"));
};

window.downloadProfile = function() {
	let d = profileData.value;

	download("profile.json", JSON.stringify(d, null, "\t"));
};

function setResizeTarget(clientY) {
	let i = getLogItemIndex(resizingEdgeChunkTime.value);
	let prev = null;
	let next = null;
	if (i > 0) prev = linearLog.value[i - 1];
	if (i + 1 < linearLog.value.length) next = linearLog.value[i + 1];

	if (i == -1) {
		return false;
	}

	let sizeInPixels = 600 * calendarScale.value;
	let sy = Math.abs(Math.min(0, calendarY.value / sizeInPixels));
	let ey = sy + innerHeight / sizeInPixels;

	if (calendarY.value > 0) {
		clientY -= calendarY.value;
	}
	let dayInSeconds = 24 * 60 * 60;

	let dec = sy + (clientY / window.innerHeight) * (ey - sy);
	dec *= dayInSeconds;

	if (dec < 0) dec = 0;

	if (dec > dayInSeconds) dec = dayInSeconds;

	let offset = currentWeekdayAndTimeToChunkTime(resizingDay.value, 0);

	if (prev && dec < prev[0] - offset) dec = prev[0] - offset;

	if (next && dec > next[0] - offset) dec = next[0] - offset;

	resizingBlockTarget.value = Math.floor(dec);

	return true;
}

function confirmResize() {
	trackEvent("time_resize");

	let i = getLogItemIndex(resizingEdgeChunkTime.value);
	let key = resizingEdgeChunkTime.value.toString();

	let activity = currentChunk.value.log[key];
	deleteKeyInChunk(resizingEdgeRealTime.value, "log." + key);
	//delete currentChunk.value.log[key]
	let offset = currentWeekdayAndTimeToChunkTime(resizingDay.value, 0);
	let r = offset + resizingBlockTarget.value;

	if (r - resizingEdgeChunkTime.value != 0) {
		//currentChunk.value.log[r.toString()] = activity
		setKeyInChunk(
			resizingEdgeRealTime.value,
			"log." + r.toString(),
			activity
		);
	}
}

function currentWeekdayAndTimeToChunkTime(day, time) {
	let sow = getTime(startOfWeek(new Date()));
	let d = sow + day * 24 * 60 * 60 * 1000;
	let chunk = floorToChunk(d);
	return sow / 1000 - chunk + day * 24 * 60 * 60 + time;
}

function currentWeekdayAndTimeToRealTime(day, time) {
	let sow = getTime(startOfWeek(new Date()));
	let d = sow + day * 24 * 60 * 60 * 1000;
	return d;
}

function startResize(e, d, start, end) {
	let t = e.currentTarget || e.target;
	let clientX = e.clientX || e.touches[0].clientX;
	let clientY = e.clientY || e.touches[0].clientY;
	let rect = t.getBoundingClientRect();
	let direction = false;
	if (clientY < rect.top + 8) {
		direction = false;
	} else if (clientY > rect.bottom - 8) {
		direction = true;
	} else {
		return;
	}

	if (!direction) {
		resizingBlockA.value = start;
		resizingBlockB.value = start;
		resizingEdge.value = start;
	} else {
		resizingBlockA.value = end;
		resizingBlockB.value = end;
		resizingEdge.value = end;
	}

	resizingEdgeChunkTime.value = currentWeekdayAndTimeToChunkTime(
		d,
		resizingEdge.value
	);
	resizingEdgeRealTime.value = currentWeekdayAndTimeToRealTime(
		d,
		resizingEdge.value
	);

	resizingDay.value = d;

	isResizing.value = true;

	let v = setResizeTarget(clientY);
	if (!v) {
		isResizing.value = false;
	}
}

const clockMode = computed(() => {
	profileData.value;
	return getSetting("clockMode", "24h");
});

function toggleClockMode() {
	if (clockMode.value == "24h") {
		setSetting("clockMode", "12h");
	} else {
		setSetting("clockMode", "24h");
	}
}

function addLogBlock(time, blockId) {
	currentChunk.value.log[Math.floor(time).toString()] = blockId;
}

function addTimeBlock(d, start, end, direction) {
	let chunkTime = currentWeekdayAndTimeToChunkTime(d, start);
	let realTime = currentWeekdayAndTimeToRealTime(d, start);
	let i = getLogItemIndex(chunkTime);
	if (direction) {
		setKeyInChunk(
			realTime,
			"log." + Math.floor(chunkTime + (end - start) * 0.9).toString(),
			linearLog.value[i][1]
		);
	} else {
		setKeyInChunk(
			realTime,
			"log." + Math.floor(chunkTime + (end - start) * 0.1).toString(),
			linearLog.value[i][1]
		);
	}
}

function updateTimeBlock(d, start, blockId) {
	let chunkTime = currentWeekdayAndTimeToChunkTime(d, start);
	//currentChunk.value.log[chunkTime.toString()] = blockId
	let realTime = currentWeekdayAndTimeToRealTime(d, start);
	setKeyInChunk(realTime, "log." + chunkTime.toString(), blockId);
}

const dataValues = ref([30, 40, 60, 70, 5]);
const toggleLegend = ref(true);

const testData = ref(null);
const stackedChart = ref(null);
watch(
	[currentChartRange, currentChunk],
	async () => {
		let blockIntervals = [{}];
		let interval = 24 * 60 * 60 * 1000;
		if (currentChartRange.value.name != "Today")
			trackEvent("chart", {
				name: currentChartRange.value.name
			});

		let rangeTime =
			currentChartRange.value.end - currentChartRange.value.start;

		if (rangeTime > 1000 * 60 * 60 * 24 * 30) {
			interval = 7 * 24 * 60 * 60 * 1000;
		}

		let times = {};
		let start = currentChartRange.value.start;
		let end = currentChartRange.value.end;

		let chunks = {};

		for (let i = start; i < end; i += 1000 * 60 * 60 * 24) {
			let c = floorToChunk(i);
			if (!chunks[c]) {
				let cdata = await getChunkForTime(i);
				if (cdata) chunks[c] = cdata;
			}
		}

		let timer = start;
		let activity = "blank";
		let total = 0;
		let closest = 0;
		let closestDistance = 0;
		let asc = (a, b) => a - b;
		let pInt = a => parseInt(a);

		for (let key of Object.keys(chunks)
			.map(pInt)
			.sort(asc)) {
			let chunkTime = key * 1000;
			if (chunks[key].log)
				for (let block of Object.keys(chunks[key].log)
					.map(pInt)
					.sort(asc)) {
					let time = chunkTime + block * 1000;

					if (time < start || time > end) {
						if (time < start) {
							activity = chunks[key].log[block];
						}
						continue;
					}

					if (activity == "blank") {
						activity = chunks[key].log[block];
						timer = time;
						continue;
					}

					if (!times[activity]) {
						times[activity] = 0;
					}

					times[activity] += time - timer;
					total += time - timer;

					timer = time;
					activity = chunks[key].log[block];
				}
		}

		if (Object.keys(times).length == 0) {
			console.log("Hit");
		}
		let e = Math.min(end, getNow());
		if (timer < e) {
			if (!times[activity]) {
				times[activity] = 0;
			}

			times[activity] += e - timer;
			total += e - timer;
		}

		let labels = Object.keys(times);
		let labelsData = labels.map(l => {
			if (l == "blank") {
				return "blank";
			}
			let b = blocks.value.find(b => b.id == l);
			if (b) return b.name;
			return "Unknown";
		});
		let colorData = labels.map(l => {
			if (l == "blank") {
				return "#fff";
			}
			let b = blocks.value.find(b => b.id == l);
			if (b) return b.color;
			return "#fff";
		});
		let numData = labels.map(l => times[l] / 1000);

		testData.value = {
			labels: labelsData,
			datasets: [
				{
					labels: labelsData,
					data: numData,
					backgroundColor: colorData
				}
			]
		};
	},
	{ deep: true }
);

const chartOptions = ref({
	responsive: true,

	plugins: {
		tooltip: {
			callbacks: {
				label: function(context) {
					return (
						" " +
						context.label +
						" " +
						formatSeconds(context.dataset.data[context.dataIndex])
					);
				}
			}
		},
		datalabels: {
			color(context) {
				return invert(
					context.dataset.backgroundColor[context.dataIndex],
					true
				);
			},
			formatter: (value, context) => {
				return context.dataset.labels[context.dataIndex];
			},
			display: "auto"
		},
		legend: {
			position: "top"
		},
		title: {
			display: true,
			text: "Activity Distribution"
		}
	}
});

const permLogin = ref(false);

const loginBox = ref(null);

function upgradeAccount() {
	trackEvent("try_upgrade");
	loginBox.value.linkToPermanentAccount();
}

function userAction(d) {
	if (d.name == "Logout") {
		trackEvent("logout");
		window.timebar.auth.signOut();
		setTimeout(() => {
			window.location.reload();
		}, 450);
	} else if (d.name == "Save") {
		upgradeAccount();
	} else if (d.name == "Get My Data") {
		getMyDataChoice.value = true;
	}
}

function getMyData(format) {
	(async () => {
		let chunksList = {};
		(
			await getDocs(
				query(collection(db, "users", user.value.uid, "chunks"))
			)
		).forEach(doc => {
			chunksList[doc.id] = doc.data();
		});

		let p = profileData.value;

		if (format == "json") {
			download(
				"timebar-data.json",
				JSON.stringify({ profile: p, chunks: chunksList }, null, "\t")
			);
		} else if (format == "csv") {
			let rows = [
				"start,end,activity,color,duration pretty,duration seconds"
			];
			let timeLog = [];
			let lastTime = 0;

			for (let key of Object.keys(chunksList)
				.map(k => parseInt(k))
				.sort((a, b) => a - b)) {
				let chunkTimeReal = key * 1000;
				if (chunksList[key].log)
					for (let block of Object.keys(chunksList[key].log)
						.map(k => parseInt(k))
						.sort((a, b) => a - b)) {
						let time = chunkTimeReal + block * 1000;
						let activity =
							chunksList[key.toString()].log[block.toString()];
						let b = blocks.value.find(b => b.id == activity);
						if (b) {
							let color = b.color;
							let name = b.name;
							// let duration = time - chunkTime
							// rows.push(`${chunkTime},${time},${name},${color},${duration}`);
							timeLog.push({
								start: time,
								activity: activity,
								color: color,
								name: name
							});
						}
					}
			}

			timeLog.push({
				start: getNow()
			});

			if (timeLog.length > 0)
				for (let i = 1; i < timeLog.length - 1; i++) {
					let start = new Date(timeLog[i - 1].start);
					let end = new Date(timeLog[i].start);
					let activity = timeLog[i - 1].activity;
					let color = timeLog[i - 1].color;
					let name = timeLog[i - 1].name;
					let duration = formatSeconds((end - start) / 1000).replace(
						"s",
						""
					);
					rows.push(
						`${start.toISOString()},${end.toISOString()},${name},${color},${duration},${(end -
							start) /
							1000}`
					);
				}

			download("timebar-data.csv", rows.join("\n"));
		}
	})();

	getMyDataChoice.value = false;
}

const shouldUpgradeAccount = ref(false);

const getMyDataChoice = ref(false);
</script>

<template>
	<login-box ref="loginBox" @setUser="refreshConnection($event)"></login-box>

	<div class="anonymous-modal modal" :class="{ open: shouldUpgradeAccount }">
		<div class="modal-content">
			<h1 class="big-title">Save Your Data</h1>
			<p>
				Please sign in via Google, or Email to save your data
				permanently.
			</p>
			<div class="btn-bar">
				<div
					class="btn"
					@click="shouldUpgradeAccount = false"
					style="--color: #e91e63"
				>
					Sign-in later<i class="fas fa-arrow-right"></i>
				</div>
				<div class="btn" @click="upgradeAccount()">
					Sign-in now<i class="fas fa-cloud-upload-alt"></i>
				</div>
			</div>
		</div>
	</div>

	<div class="get-data-modal modal" :class="{ open: getMyDataChoice }">
		<div class="modal-content">
			<h1 class="big-title">How would you like your data?</h1>
			<div class="btn-bar">
				<div class="big-btn" @click="getMyData('json')">
					<i class="fas fa-code fa-3x"></i>
					<div>JSON</div>
				</div>
				<div class="big-btn" @click="getMyData('csv')">
					<i class="fas fa-file-csv fa-3x"></i>
					<div>CSV</div>
				</div>
			</div>
		</div>
	</div>

	<div
		class="grid-drop-zone"
		:class="{ open: currentHolding, active: isDeleting }"
	>
		<i class="fas fa-trash"></i>
	</div>
	<div
		class="back-drop"
		:class="{ active: !!editing }"
		@click="editing = ''"
	></div>
	<div
		class="init-modal modal"
		:class="{ open: isProfileWatched && !isInitialized }"
	>
		<div class="modal-content">
			<h1 class="big-title">Get Started</h1>
			<div class="btn-bar">
				<div
					class="big-btn"
					:class="{ disabled: creatingUser }"
					@click="initUser()"
				>
					<i class="far fa-square fa-3x"></i>
					<div>Empty</div>
				</div>
				<div
					class="big-btn"
					:class="{ disabled: creatingUser }"
					@click="initUser(true)"
				>
					<i class="fas fa-shapes fa-3x"></i>
					<div>Template</div>
				</div>
			</div>
		</div>
	</div>
	<div class="block-wrap" :class="{ 'grid-mode': gridMode }" ref="rootEl">
		<template v-for="(block, i) in blocks" :key="block.id">
			<div
				class="block"
				:class="{
					editing: block.id == editing,
					active:
						block.x == snappedPosition.x &&
						block.y == snappedPosition.y
				}"
				:style="{
					'--color': block.color,
					'--contrast': invert(block.color, true),
					...computedTransforms[i]
				}"
				:data-block="block.id"
				@contextmenu="$event.preventDefault()"
			>
				<template v-for="(dir, j) in blockDirections[i]">
					<div
						class="add-block-direction"
						@click="addBlock(dir.x, dir.y)"
						:style="{ '--x': dir.relx, '--y': dir.rely }"
					>
						<i class="fas fa-add"></i>
					</div>
				</template>

				<div
					v-if="editing == block.id"
					@click="editing = ''"
					class="bad-btn"
				>
					<i class="fas fa-times"></i>
				</div>
				<div
					@click="selectBlock(block)"
					@mousedown="startHold(block, true)"
					@touchstart="startHold(block)"
					@touchend="endHold()"
					class="block-background"
				></div>

				<div class="block-icon">
					<Icon :icon="block.icon || block.name">
						<Dialog v-if="editing">
							<Selector
								@update:modelValue="
									(block.icon = $event.name),
										updateBlock(block, { icon: block.icon })
								"
								:data="selectorIcons"
							></Selector>
						</Dialog>
					</Icon>
				</div>
				<div v-if="block.id != editing" class="block-text">
					{{ block.name }}
				</div>
				<input
					v-else
					id="focus-input"
					@keypress.enter="editing = ''"
					class="block-text"
					style="pointer-events: all;"
					v-model="block.name"
					@change="updateBlock(block, { name: block.name })"
				/>
				<Color
					class="block-color-box"
					v-model="block.color"
					@update:modelValue="
						updateBlock(block, { color: block.color })
					"
				></Color>
				<div @click="editBlock(block)" class="block-edit-btn">
					<i class="fas fa-edit"></i>
				</div>
			</div>
		</template>

		<template v-if="currentTracking !== null && !gridMode">
			<div
				class="tracking-clock"
				:style="{
					...computedTransforms[getBlockIndex(currentTracking.block)]
				}"
			>
				{{
					formatSeconds(
						Math.floor(
							(currentTimeUpdating - currentTracking.time) / 1000
						)
					)
				}}
			</div>
		</template>

		<template v-for="(block, i) in addBlocks" :key="block.id">
			<div
				class="block add-block"
				:style="{
					'--color': '#f5f5f5',
					'--contrast': 'black',
					...computedAddTransforms[i]
				}"
			>
				<div
					@click="addBlock(block.x, block.y)"
					class="block-background"
				></div>
				<div class="block-icon">
					<i class="fas fa-add fa-5x"></i>
				</div>
			</div>
		</template>
	</div>

	<div
		class="calendar"
		:style="{ '--calendar-direction': calendarAnimatingTo }"
		:class="{
			'calendar-animating': calendarAnimating,
			active: currentTab == 'calendar'
		}"
		id="calendar-area"
	>
		<Log v-if="user" :blocks="blocks" :user="user" :db="db"></Log>
		<!-- <div class="week">
			<div class="week-box">
				<i @click="prevWeek()" class="fas fa-chevron-left"></i>
				<div class="week-text">
					{{formatDate(selectedWeek.start)}} - {{formatDate(selectedWeek.end)}}
					<Dialog>
						<Selector @update:modelValue="selectWeek($event)" :data="weekList"></Selector>
					</Dialog>
				</div>
				<i @click="nextWeek()" class="fas fa-chevron-right"></i>
			</div>
		</div>
		<div class="days swiper" :style="{'--zoom': calendarScale, '--x': calendarX + 'px', '--y': calendarY + 'px'}">
			<div class="timeline">
				<template v-for="h in currentDivision" :key="h">
					<div class="hour">{{formatTimeClockMode(((h - 1) / currentDivision) * 24)}}</div>
				</template>
				<div class="clock-24-12" @click="toggleClockMode()">
					{{clockMode}}
				</div>
			</div>
			<template v-for="d in 7" :key="d">
				<div class="day">
					
				</div>
			</template>
		</div>
		<div class="days" :class="{'dragging': calendarDragging, 'resizing': isResizing}" :style="{'--zoom': calendarScale, '--x': (calendarX + calendarSwipeX) + 'px', '--y': calendarY + 'px'}">
			<div class="timeline">
				<template v-for="h in currentDivision" :key="h">
					<div class="hour">{{formatTimeClockMode(((h - 1) / currentDivision) * 24)}}</div>
				</template>
				<div class="clock-24-12" @click="toggleClockMode()">
					{{clockMode}}
				</div>
			</div>
			<template v-for="d in 7" :key="d">
				<div class="day" :class="{'active': calendarInfo.day == d - 1}">
					<div class="day-chunks">
						<template v-if="currentTab == 'calendar'">
							<template v-for="c in weekTimeChunksInView[d - 1]" :key="c.start">
								<div @touchstart="startResize($event, d - 1, c.start, c.end)" @mousedown="startResize($event, d - 1, c.start, c.end)" class="time-chunk" :style="{
										'--start': (resizingDay == d - 1 && (resizingEdge == c.start && isResizing)) ? resizingBlockTarget : c.start,
										'--end': (resizingDay == d - 1 && (resizingEdge == c.end && isResizing)) ? resizingBlockTarget : c.end, '--color': c.block.color}"
										:title="c.block.name + ' ' + formatTimeClockMode(c.start / (60 * 60)) + ' - ' + formatTimeClockMode(c.end / (60 * 60))"
									>
									<div v-if="(resizingDay == d - 1 && (resizingEdge == c.start && isResizing)) ? true : (calendarScale > 9 ? true :  c.end - c.start > 60 * 15)" class="time-chunk-name">
										<svg viewBox="0 0 100 50">
											<text text-anchor="middle" x="50%" y="50%" dy=".4em" :font-size="(100 / (c.block.name.length + 6)) + 'pt'">
												{{c.block.name}} ({{formatSeconds(((resizingDay == d - 1 && (resizingEdge == c.end && isResizing)) ? resizingBlockTarget : c.end) - ((resizingDay == d - 1 && (resizingEdge == c.start && isResizing)) ? resizingBlockTarget : c.start))}})
											</text>
										</svg>

										<div class="calendar-time-btn calendar-edit-btn">
											<i class="fas fa-edit"></i>
											<Dialog>
												<Selector @update:modelValue="updateTimeBlock(d - 1, c.start, $event.id)" :data="blocks"></Selector>
											</Dialog>
										</div>
										<div class="calendar-time-btn calendar-add-top-btn" @click="addTimeBlock(d - 1, c.start, c.end, false)"><i class="fas fa-plus"></i></div>
										<div class="calendar-time-btn calendar-add-bottom-btn" @click="addTimeBlock(d - 1, c.start, c.end, true)"><i class="fas fa-plus"></i></div>
									</div>
								</div>
							</template>
						</template>
					</div>
					<div class="day-name">
						{{dayNames[d - 1]}}
					</div>
				</div>
			</template>
		</div> -->
	</div>

	<div
		class="charts"
		:class="{ active: currentTab == 'chart' }"
		id="charts-area"
	>
		<div class="panel">
			<div class="select-bar">
				{{ currentChartRange.name }}
				<Dialog>
					<Selector
						v-model="currentChartRange"
						:data="timeRanges"
					></Selector>
				</Dialog>
			</div>
		</div>
		<template v-if="currentTab == 'chart'">
			<div class="chart-row">
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
			</div>
		</template>
	</div>

	<div class="tabs-container">
		<div class="tabs edit-tab" v-if="currentTab == 'tracking'">
			<div
				@click="gridMode ? exitGridMode() : enterGridMode()"
				class="tab"
				:class="{ active: gridMode }"
			>
				<div class="tab-icon"><i class="fas fa-edit"></i></div>
			</div>
		</div>
		<div class="tabs">
			<div
				class="tab"
				@click="selectTab('tracking')"
				:class="{ active: currentTab == 'tracking' }"
			>
				<div class="tab-icon"><i class="fas fa-stopwatch"></i></div>
				<div class="tab-text">Tracking</div>
			</div>
			<div
				class="tab"
				@click="selectTab('calendar')"
				:class="{ active: currentTab == 'calendar' }"
			>
				<div class="tab-icon"><i class="fas fa-calendar-week"></i></div>
				<div class="tab-text">Log</div>
			</div>
			<div
				class="tab"
				@click="selectTab('chart')"
				:class="{ active: currentTab == 'chart' }"
			>
				<div class="tab-icon"><i class="fas fa-chart-pie"></i></div>
				<div class="tab-text">Charts</div>
			</div>
			<div class="tab" :class="{ 'has-photo': user && user.photoURL }">
				<Dialog>
					<Selector
						:hide-search="true"
						@update:modelValue="userAction($event)"
						:data="userMenu"
					></Selector>
				</Dialog>

				<div class="tab-icon">
					<i v-if="!user || !user.photoURL" class="fas fa-user"></i>
					<img :src="user.photoURL" v-else />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Overpass&display=swap");

p {
	line-height: 1.6em;
}

.btn {
	cursor: pointer;
	border: none;
	--color: dodgerblue;
	background: var(--color);
	border-radius: 8px;

	outline: none;
	padding: 10px;
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

.chart-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 0.5em;
}

@media (max-width: 900px) {
	.chart-row {
		flex-direction: column;
	}
}

.chart,
.panel {
	border-radius: 12px;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0);
	padding: 10px;
	/* filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.2)); */
	transition: 0.3s;
	transform: translate(0px, 0px);
	background-color: #ffffff;
	margin: 20px;
}

.chart:hover {
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
	transform: translate(0px, -6px);
}

.clock-24-12 {
	cursor: pointer;
	transition: 0.2s;
	position: absolute;
	bottom: -32px;
	width: 40px;
	text-align: center;
	font-family: "Overpass", sans-serif;
}

.clock-24-12:hover {
	color: dodgerblue;
}

.calendar-edit-btn {
	top: calc(50% - 20px);
	left: calc(50% - 15px);
	z-index: 14 !important;
}

.calendar-add-bottom-btn {
	bottom: 10px;
	--size: 20px !important;
	left: calc(50% - 10px);
}

.calendar-add-top-btn {
	top: 10px;
	--size: 20px !important;
	left: calc(50% - 10px);
}

.calendar-time-btn {
	position: absolute;
	--size: 30px;
	width: var(--size);
	height: var(--size);
	padding: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background-color: transparent;
	transition: 0.3s;
	border-radius: 120px;
	background-color: #42b983;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.199);
	pointer-events: none;
	transform: scale(0);
	font-size: 1em;
	z-index: 3;

	pointer-events: all;
	z-index: 11;
}

.days:not(.resizing) .time-chunk:hover .calendar-time-btn {
	transform: scale(1);
}

.days.swiper {
	position: absolute;
}

.calendar-animating .days:not(.swiper) {
	transition: 0.3s;

	--add-x: calc(var(--calendar-direction) * 100vw);
}

.calendar-animating .days.swiper {
	animation: days-grow 0.3s ease-in-out forwards;
}

@keyframes days-grow {
	0% {
		opacity: 0;
		transform: translate(calc(var(--x) + var(--add-x)), var(--y)) scale(0);
	}
	100% {
		opacity: 1;
		transform: translate(calc(var(--x) + var(--add-x)), var(--y)) scale(1);
	}
}

.week {
	height: calc((100vh - 600px) / 2);
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.week-box {
	border-radius: 6px;
	transition: 0.3s;
	cursor: pointer;
	margin-bottom: 12px;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;

	user-select: none;
}

.week-box i {
}

.week-box > * {
	transition: 0.3s;
	height: 100%;
	padding: 10px;
	border-radius: 6px;
}

.week-box > *:hover {
	background-color: #eeeeee;
}

.select-bar {
	margin: 10px;
	transition: 0.3s;
	padding: 10px;
	border-radius: 6px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.select-bar:hover {
	background-color: #eeeeee;
}

.calendar {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: white;
	z-index: 19;
	transition: 0.3s;
	opacity: 1;
	pointer-events: none;

	display: block;

	overflow: hidden;
	touch-action: none;
	top: 100vh;
}

.calendar.active {
	top: 0px;
	pointer-events: all;
}

.charts {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgb(236, 236, 236);
	z-index: 19;
	transition: 0.3s;
	opacity: 1;
	top: 100vh;
	pointer-events: none;

	display: block;

	overflow: hidden;
	touch-action: none;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
}

.charts.active {
	top: 0px;
	pointer-events: all;
}

.days {
	display: flex;
	flex-direction: row;
	height: calc(600px * var(--zoom));
	/* transition: .3s; */
	--add-x: 0px;
	width: 80vw;
	transform: translate(calc(var(--x) + var(--add-x)), var(--y));
	background-color: white;
}

.days.dragging {
	/* transition: none; */
}

.day {
	display: flex;
	flex-direction: column;
	border-radius: 12px;
	background-color: rgb(238, 238, 238);
	margin: 0px 10px;
	flex: 1;
	position: relative;
	align-items: center;
	--total-seconds: calc(24 * 60 * 60);
}

.day-chunks {
	overflow: hidden;
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	border-radius: 12px;
}

.time-chunk::after,
.time-chunk::before {
	content: "";
	transition: 0.3s;
	transform: scale(0, 1);
}

.days:not(.resizing) .time-chunk:hover::after,
.days:not(.resizing) .time-chunk:hover::before {
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.199);
	background-color: white;
	border-radius: 100px;
	box-sizing: border-box;
	transform: scale(1, 1);
}

.days.resizing * {
	cursor: ns-resize !important;
}

.time-chunk:hover::after {
	content: "";
	position: absolute;
	top: calc(100% - 4px);
	left: 15%;
	width: 70%;
	height: 8px;
	cursor: ns-resize;
	pointer-events: all;
	z-index: 12;
}

.time-chunk:hover::before {
	content: "";
	position: absolute;
	top: -4px;
	left: 15%;
	width: 70%;
	height: 8px;
	cursor: ns-resize;
	pointer-events: all;
	z-index: 11;
}

.day.active .day-name {
	color: dodgerblue;
}

.day-name {
	position: absolute;
	bottom: -32px;
	font-family: "Overpass", sans-serif;
}

@media (max-width: 900px) {
	.day:not(.active) {
		display: none;
	}
}

.time-chunk {
	/* overflow: hidden; */
	position: absolute;
	left: 0px;
	width: 100%;

	top: calc((var(--start) / var(--total-seconds)) * 100%);
	height: calc(
		((var(--end) - var(--start) - 4) / var(--total-seconds)) * 100%
	);

	background-color: var(--color);

	display: flex;
	align-items: center;
	justify-content: center;
	color: white;

	cursor: default;
	/* animation: grow-chunk .3s ease-in-out forwards; */
}

@keyframes grow-chunk {
	0% {
		transform: scale(1, 0);
	}
	100% {
		transform: scale(1, 1);
	}
}

/*.time-chunk:nth-last-child(2) {
	border-radius: 0px 0px 12px 12px;
}

.time-chunk:first-child {
	border-radius: 12px 12px 0px 0px;
}*/

.time-chunk-name > svg {
	width: 100%;
	height: 100%;
}

.time-chunk-name > svg > text {
	font-family: "Overpass", sans-serif;
}

.time-chunk-name {
	width: 100%;
	height: 100%;
	z-index: 10;
}

@keyframes grow-in {
	0% {
		transform: scale(0, 0);
	}
	100% {
		transform: scale(1, 1);
	}
}

.edit-tab {
	position: fixed;
	right: 40px;
	top: 40px;
	left: unset !important;
	width: unset !important;
	border-radius: 16px !important;
	animation: grow-in 0.3s ease-in-out forwards;
}

.edit-tab > .tab {
	width: 50px;
	height: 50px;
	padding: 0;
}

.tabs-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 150px;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 20;
}

.timeline {
	display: flex;
	flex-direction: column;
}

.hour {
	flex: 1;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.hour:not(:nth-last-child(2))::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: -10px;
	width: calc(100vw * 0.8 + 10px);
	border-bottom: 1px solid rgb(0 0 0 / 7%);
	z-index: 10;
}

.tabs {
	background-color: white;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
	border-radius: 16px;
	z-index: 20;

	display: flex;
	flex-direction: row;
	pointer-events: all;
}

.tab {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: row;
	font-size: 24px;
	padding: 12px 20px;
	margin: 10px;
	border-radius: 12px;
	transition: 0.3s;
	cursor: pointer;
	user-select: none;
}

.tab:hover {
	background-color: #dadada;
}

.tab.active {
	background-color: rgb(119, 187, 255);
	color: black;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

@media (max-width: 900px) {
	.tab.active {
		box-shadow: none;
	}

	.tab {
		padding: 22px 20px;
	}
}

.tab-text {
	margin-left: 20px;
}

.tab.has-photo {
	/* height: 40px; */
	padding: 0 6px !important;
}

.tab.has-photo .tab-icon {
	display: flex;
	align-items: center;
	justify-content: center;
}

.tab-icon > img {
	max-height: 40px;
	border-radius: 100px;
	left: -20px;
}

@media (max-width: 900px) {
	.tabs-container {
		justify-content: flex-start;
		align-items: flex-end;
	}
	.tabs {
		width: 100vw;
		border-radius: 0px;
	}

	.tab {
		/* padding: 15px 10px; */
		margin: 0px;
		font-size: 20px;
		border-radius: 0px;
		flex: 1;
	}

	.tab-icon:not(:only-child) {
		/* margin-right: 5px; */
	}
}

@media (max-width: 900px) {
	.tab-text {
		display: none;
	}
}

.add-block-direction {
	position: absolute;
	top: calc(50% - 30px);
	left: calc(50% - 30px);
	width: 60px;
	height: 60px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 36px;
	transition: all 0.3s, background-color 0.1s;

	background-color: white;
	border: 4px solid dodgerblue;
	color: dodgerblue;
	box-sizing: border-box;
	border-radius: 12px;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
	--scale: 1;
}

.add-block-direction:hover {
	--scale: 1;
	background-color: rgb(189, 217, 244);
}

.block.active .add-block-direction,
.block:hover .add-block-direction,
.block.active:hover .add-block-direction {
	transform: translate(
			calc(var(--x) * 100% + var(--x) * 60px),
			calc(var(--y) * 100% + var(--y) * 60px)
		)
		scale(var(--scale));
}

.block.editing .add-block-direction {
	transform: scale(0) !important;
}

.grid-mode .add-block-direction {
	transform: scale(0) !important;
}

@media (min-width: 901px) {
	.block.active .add-block-direction {
		transform: unset;
	}
}

.add-block {
	--add-scale: -0.4;
}

.big-title {
	font-size: 50px;
}

div.big-btn.disabled {
	opacity: 0.5;
	pointer-events: none;
	transform: scale(0.8);
}

.btn-bar {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

.big-btn {
	padding: 40px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	margin: 10px;
	width: 100px;
	box-shadow: 0px 3px 16px rgba(0, 0, 0, 0.2);
	font-size: 30px;
	user-select: none;
	border: 4px solid transparent;
}

.big-btn > div {
	margin-top: 40px;
}

.big-btn:hover {
	color: dodgerblue;
	transform: scale(1.1);
	border: 4px solid dodgerblue;
	box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.2);
}

.big-btn:active {
	box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
	transition: 0.05s;
	transform: scale(0.95);
}

@media (max-width: 900px) {
	.big-title {
		font-size: 30px;
	}

	.btn-bar {
		flex-direction: column;
	}
}

.modal-content {
	position: fixed;
	top: 15%;
	left: 15%;
	width: 70%;
	height: 70%;
	background: white;
	border-radius: 24px;
	box-shadow: 0 0 24px 0 rgba(0, 0, 0, 0.2);
	z-index: 40;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	transform: scale(0);
	transition: 0.3s;
	pointer-events: none;
}

.modal {
	font-family: "Overpass", sans-serif;
	font-size: 18px;
	position: fixed;
	top: 0%;
	left: 0%;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.295);
	z-index: 30;
	opacity: 0;
	transition: 0.3s;
	pointer-events: none;
}

.modal.open {
	opacity: 1;
	transition: 0.3s;
	pointer-events: all;
}

.modal.open .modal-content {
	transform: scale(1);
	pointer-events: all;
}

@media (max-width: 900px) {
	.modal-content {
		width: 100%;
		top: 10%;
		left: 0%;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		bottom: 0%;
		height: unset;

		justify-content: flex-start;
		overflow: auto;
	}

	.modal-content h1 {
		margin: 20px 20px;
	}
}

a {
	color: #42b983;
}

.bad-btn {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 6;
	cursor: pointer;
	transition: 0.3s;
	border-radius: 16px;
	background: red;
	color: white;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.5);
	width: 60px;
	height: 60px;
	font-size: 2.5em;
	display: flex;
	justify-content: center;
	align-items: center;
	display: none;
}

@media (max-width: 900px) {
	.bad-btn {
		display: flex;
	}
}

.block-color-box {
	position: absolute;
	right: 20px;
	bottom: 20px;
	display: none;
}

.editing .block-color-box {
	display: block;
}

.back-drop {
	opacity: 0;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 9;
	transition: opacity 0.3s;
	pointer-events: none;
}

.back-drop.active {
	opacity: 1;
	pointer-events: all;
}

.editing .block-background {
	/* transform: scale(1);
	opacity: 0;
	border-radius: 50%;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, .3);
	cursor: default;
	transition: .2s; */
	border-color: white;
}
.block.editing {
	cursor: default;
}

@media (max-width: 900px) {
	.block.editing {
		z-index: 21;
	}
}

.block-edit-btn {
	position: absolute;
	top: 12px;
	right: 12px;
	width: 40px;
	height: 40px;
	padding: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background-color: transparent;
	transition: 0.1s;
	border-radius: 14px;
	background-color: white;
	border: 4px solid dodgerblue;
	color: dodgerblue;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.199);
	pointer-events: none;
	transform: scale(0);
	font-size: 1.5em;
	z-index: 3;
}

input.block-text {
	background-color: rgb(209, 209, 209);
	color: black !important;
	border: 10px solid white;
	box-sizing: border-box;
	border-radius: 24px;
	height: 90px;
	font-size: 32px;
	text-align: center;
	outline: none;
}

.block-edit-btn:hover {
	background-color: rgb(189, 217, 244);
}

.block-wrap {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	touch-action: none;
	user-select: none;
}

.block {
	top: 0px;
	left: 0px;
	position: absolute;
	/* transition: .1s ease-in-out; */
	background-color: rgb(255, 255, 255);
	border-radius: 24px;
	--add-scale: 0;
	cursor: pointer;
	/* overflow: hidden; */

	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
}

.block:hover {
	--add-scale: 0;
	outline: 4px solid rgba(0, 174, 255, 0.4);
}

.grid-mode .block,
.grid-mode .block .block-background {
	font-size: 10px;
	border-radius: 12px !important;
	cursor: grab;
}

.grid-mode .block:active {
	cursor: grabbing;
	--add-scale: -0.1;
	z-index: 2;
}

.grid-mode .block:active,
.grid-mode .block:active .block-background {
	cursor: grabbing;
}

.grid-mode .block .block-text {
	font-size: 12px;
	height: 15px;
	opacity: 0;
}

.grid-mode .block .block-icon {
	/* animation: shake .5s infinite; */
}

@keyframes shake {
	0% {
		transform: translate(1px, 1px) rotate(0deg);
	}
	10% {
		transform: translate(-1px, -2px) rotate(-1deg);
	}
	20% {
		transform: translate(-3px, 0px) rotate(1deg);
	}
	30% {
		transform: translate(3px, 2px) rotate(0deg);
	}
	40% {
		transform: translate(1px, -1px) rotate(1deg);
	}
	50% {
		transform: translate(-1px, 2px) rotate(-1deg);
	}
	60% {
		transform: translate(-3px, 1px) rotate(0deg);
	}
	70% {
		transform: translate(3px, 1px) rotate(-1deg);
	}
	80% {
		transform: translate(-1px, -1px) rotate(1deg);
	}
	90% {
		transform: translate(1px, 2px) rotate(0deg);
	}
	100% {
		transform: translate(1px, -2px) rotate(-1deg);
	}
}

@media (min-width: 900px) {
	.block-wrap:not(.grid-mode) .block:not(.editing):hover .block-edit-btn {
		/* border-top-right-radius: 150px; */
		cursor: pointer;
		transform: scale(1);
		pointer-events: all;
	}
}

.block .block-icon,
.block .block-text {
	pointer-events: none;
	color: var(--color);
}

.editing .block-icon > i {
	pointer-events: all;
	cursor: pointer;
}

.block-background {
	border: 6px solid var(--color);
	box-sizing: border-box;
	background: white;
	position: absolute;
	top: 0px;
	left: 0px;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: 0.4s;
	border-radius: 24px;
}

.block-icon {
	position: absolute;
	top: 0px;
	left: 0px;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.editing .block-icon {
	color: var(--color);
}

.block-text {
	position: absolute;
	bottom: 0px;
	left: 0px;
	height: 60px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22px;
	overflow: hidden;
	font-family: "Overpass", sans-serif;
}

@media (max-width: 900px) {
	.editing {
		position: fixed;
		width: 100vw;
		height: 100%;
		transform: translate(0px, 0px);
		z-index: 10;
		transition: 0.3s cubic-bezier(0, 0.66, 0.13, 0.96);
		border-radius: 0px;
	}

	.editing .block-background {
		border-radius: 0px;
	}
}

@media (min-width: 901px) {
	.editing {
		width: 500px;
		height: 500px;
		transform: translate(calc(50vw - 250px), calc(50vh - 250px));

		z-index: 10;
		transition: 0.3s cubic-bezier(0, 0.66, 0.13, 0.96);
	}

	.editing .block-background {
	}
}

.grid-drop-zone {
	position: fixed;
	top: -90px;
	left: 0px;
	height: 90px;
	width: 100%;
	background: linear-gradient(180deg, #00000036, transparent);
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: 0.3s;
	font-size: 32px;
}

.grid-drop-zone.open {
	top: 0px;
}

.grid-drop-zone.active {
	color: red;
	font-size: 48px;
	/* background: linear-gradient(180deg, #f5737370, transparent); */
	height: 120px;
}

.tracking-clock {
	position: absolute;
	top: 160px;
	--add-scale: 0;
	left: 160px;
	width: 40px !important;
	height: 40px !important;
	padding: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background-color: transparent;
	transition: 0.3s !important;
	border-radius: 120px;
	background-color: rgb(230, 25, 25);
	color: white;
	font-weight: bold;
	font-family: "Overpass", sans-serif;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.199);
	font-size: 1em;
	z-index: 2;
	border: 4px solid rgb(255, 0, 0);
	animation: timer 4s infinite;
	/* outline: 4px solid white; */
	cursor: pointer;
	transform: translate(calc(50vw - 160px - 20px), calc(-80px));
	z-index: 9;
}

.tracking-clock:hover {
	--add-scale: 0.1;
}

@keyframes timer {
	0% {
		border: 4px solid white;
	}
	50% {
		border: 4px solid red;
	}
	100% {
		border: 4px solid white;
	}
}
</style>
