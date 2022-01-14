<script setup>
import { format, getDay, getTime, getWeek, startOfWeek, endOfWeek, subWeeks, addWeeks, startOfDay, subDays, addDays } from 'date-fns'

import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, updateDoc, arrayRemove, arrayUnion, deleteField } from "firebase/firestore";

import { DoughnutChart, useDoughnutChart } from "vue-chart-3"
import { Chart, registerables } from "chart.js"
import ChartDataLabels from 'chartjs-plugin-datalabels'
Chart.register(ChartDataLabels)
Chart.register(...registerables)

import Color from './Color.vue'
import Icon from './Icon.vue'
import Selector from './Selector.vue'
import Dialog from './Dialog.vue'
import LoginBox from './LoginBox.vue'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import interact from 'interactjs'

import invert from 'invert-color'

import icons from "../icons"


defineProps({
	msg: String
})

const selectorIcons = computed(() => {
	return Object.keys(icons).map((i) => ({
		name: i
	}))
})

const profileData = ref(null)

const gridMode = ref(false)

const currentTab = ref("tracking")

const db = getFirestore()

const rootEl = ref(null)

const blockSize = ref(200)
const editing = ref("")

const user = ref(null)
const isInitialized = ref(false)
const isProfileWatched = ref(false)

const position = ref({
	x: 0,
	y: 0
})

const snappedPosition = ref({
	x: 0,
	y: 0
})

watch(snappedPosition, (nv) => {
	startTracking(getClosestBlock(snappedPosition.value.x, snappedPosition.value.y))
}, {deep: true})

const blocks = ref([
	
])

const blockMap = computed(() => {
	let map = {}
	for (let i = 0; i < blocks.value.length; i++) {
		let x = blocks.value[i].x
		let y = blocks.value[i].y
		map[x + "," + y] = blocks.value[i]
	}

	return map
})

function getBlockDirections(b) {
	let openSpots = []
	let directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
	]
	for (let d of directions) {
		let x = b.x + d[0]
		let y = b.y + d[1]
		let key = x + "," + y
		if (!(key in blockMap.value)) {
			openSpots.push({
				x: x,
				y: y,
				relx: d[0],
				rely: d[1]
			})
		}
	}

	return openSpots
}

const blockDirections = computed(() => {
	return blocks.value.map(block => {
		return getBlockDirections(block)
	})
})

const addBlocks = computed((nv) => {
	return []
	let adds = []
	let directions = [
		[-1, 0],
		[-1, -1],
		[1, 0],
		[1, -1],
		[0, -1],
		[1, 1],
		[0, 1],
		[-1, 1]
	]

	for (let dir of directions) {
		let x = snappedPosition.value.x + dir[0]
		let y = snappedPosition.value.y + dir[1]
		let key = x + "," + y
		if (!blockMap.value[key]) {
			adds.push({
				id: key,
				x: x,
				y: y
			})
		}
	}

	return adds
})

const profile = ref(null)

// Generates blocks in a radius
function generateBlocks(radius) {
	const blocks = []
	for (let i = -radius + 1; i < radius; i++) {
		for (let j = -radius + 1; j < radius; j++) {
			if (i * i + j * j <= radius * radius)
			blocks.push({
				id: `${i}-${j}`,
				x: i,
				y: j,
				name: `${i}-${j}`,
				color: '#0000ee',
			})
		}
	}
	return blocks
}

//blocks.value = generateBlocks(3) 

const computedTransforms = computed(() => {
	return blocks.value.map(block => {
		return getBlockTransform(block)
	})
})

const computedAddTransforms = computed(() => {
	return addBlocks.value.map(block => {
		return getBlockTransform(block)
	})
})

const container = ref({
	width: window.innerWidth,
	height: window.innerHeight,
})

window.onresize = () => {
	container.value = {
		width: window.innerWidth,
		height: window.innerHeight,
	};
	centerCalendar()
};


const enableTransition = ref(true)

const blockEls = ref([])

const currentChunk = ref(null)



const count = ref(0)

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}

function updateBlocks() {
	blockEls.value
}

let focusBlock = null
let focusScaleLerp = ref(0)

let oldTransforms = {}

function getBlockTransform(block) {
	let dist = Math.max(Math.abs(block.y - position.value.y), Math.abs(block.x - position.value.x))
	let xdist = Math.abs(block.x - position.value.x);
	let ydist = Math.abs(block.y - position.value.y);
	let realDist = Math.sqrt(Math.pow(block.x - position.value.x, 2) + Math.pow(block.y - position.value.y, 2))
	let centerX = container.value.width / 2;
	let centerY = container.value.height / 2;
	let scale = Math.min(1, Math.max(.3, lerp(1, .3, realDist / 3)))
	let xs = Math.sign(block.x - position.value.x)
	let ys = Math.sign(block.y - position.value.y)
	let x = centerX - blockSize.value / 2 + (block.x - position.value.x) * blockSize.value
	let y = centerY - blockSize.value / 2 + (block.y - position.value.y) * blockSize.value

	let xd = centerX - blockSize.value / 2
	let yd = centerY - blockSize.value / 2

	//x += (position.value.x - block.x)
	if (block.x == snappedPosition.value.x && block.y == snappedPosition.value.y) {
		//scale = 1
	}

	//x += xs * (realDist * blockSize.value / 8)
	//y += ys * (realDist * blockSize.value / 8)

	if (dist >= 1) {
		//scale = 0.5
	}

	// y += scale * (position.value.y - block.y) * blockSize.value
	let oldX = 0;
	let oldY = 0;
	if (oldTransforms[block.id]) {
		oldX = oldTransforms[block.id]["data-x"]
		oldY = oldTransforms[block.id]["data-y"]
	}
	let distx = Math.sqrt(Math.pow(x - oldX, 2) + Math.pow(y - oldY, 2))
	let dur = 0.3 + realDist / 5
	
	if (gridMode.value) {
		scale = .9
	}
	let shouldtrans = true
	if (currentHolding.value && currentHolding.value.id == block.id) {
		shouldtrans = false
	}
	if (isZooming.value) {
		shouldtrans = false
	}
	let cube = `cubic-bezier(0.32, 0.86, .5, ${.9 + Math.min(distx / 1000, .1)})`;
	let trs = {
		"data-x": x,
		"data-y": y,
		transform: `translate(${x}px, ${y}px) scale(calc(${scale} + var(--add-scale)))`,
		width: `${blockSize.value}px`,
		height: `${blockSize.value}px`,
		opacity: 1,
		transition: (enableTransition.value && shouldtrans) ? `width ${dur}s ${cube}, height ${dur}s ${cube}, transform ${dur}s ${cube}` : 'none'
	}

	oldTransforms[block.id] = trs

	if (block.id == editing.value) {
		return {
			// width: "100%",
			// height: "100%",
			// transform: `translate(${centerX - 250}px, ${centerY - 250}px) scale(1)`,
			// zIndex: 10,
			// transition: `.3s`
		}
	}

	return trs
}


document.addEventListener("keydown", e => {
	if (e.key == "Enter") {
		if (!editing.value)
			editBlock(getClosestBlock(position.value.x, position.value.y))
	}
});

document.addEventListener("keyup", e => {
	// Arrow keys for position movement
	let t = false
	if (e.keyCode === 37) {
		position.value.x--
		t = true
	} else if (e.keyCode === 38) {
		position.value.y--
		t = true
	} else if (e.keyCode === 39) {
		position.value.x++
		t = true
	} else if (e.keyCode === 40) {
		position.value.y++
		t = true
	}

	if (t) setTimeout(() => {
		snapPosition()
		updateGlobal()
	}, 10)
})

function getClosestBlock(x, y, ignore) {
	let closest = null
	let minDist = Infinity
	for (let block of blocks.value) {
		if (ignore && ignore.id == block.id) continue
		let dist = Math.sqrt(Math.pow(block.x - x, 2) + Math.pow(block.y - y, 2))
		if (dist < minDist) {
			minDist = dist
			closest = block
		}
	}

	return closest
}

function getBlockAt(x, y, ignore) {
	if (displaced.value) {
		if (displacedPos.value.x == x && displacedPos.value.y == y) {
			return displaced.value
		}
	}
	for (let block of blocks.value) {
		if (ignore && ignore.id == block.id) continue
		if (block.x == x && block.y == y) {
			return block
		}
	}

	return null
}

function formatDate(d) {
	if (selectedWeek.value.start.getYear() == selectedWeek.value.end.getYear())
		return format(d, "MMM d")
	else
		return format(d, "MMM d yyyy")
}

const actions = []
let actionTimeout = null

function enqueueDBAction(fn) {
	clearTimeout(actionTimeout)
	actions.push(fn)

	actionTimeout = setTimeout(() => {
		for (let a of actions)
			a()
		
		actions.splice(0, actions.length)
	}, 500)
}

function getSetting(name, defaultValue) {
	let profData = profileData.value // This will subscribe to profile data so that we notify computed props that this func has updated
	if (profData && profData.settings) {

	}
	if (!isInitialized.value) return defaultValue

	if (profData.settings && profData.settings[name]) {
		return profData.settings[name]
	} else {
		return defaultValue
	}
}

let settingTimeout = null

function setSetting(name, value) {
	if (!isInitialized.value) return

	if (profileData.value) {
		if (!profileData.value.settings) profileData.value.settings = {}
		profileData.value.settings[name] = value
	}

	let dRef = getProfRef()
	enqueueDBAction(() => {
		updateDoc(dRef, {
			[["settings." + name]]: value
		})
	});
}

async function deleteBlock(block) {
	if (blocks.value.length == 1) {
		return
	}

	for (let i = updates.length - 1; i >= 0; i--) {
		if (updates[i].block.id == block.id) {
			updates.splice(i, 1)
		}
	}

	let dRef = getProfRef()
	await updateDoc(dRef, {
		[["blocks." + block.id]]: deleteField()
	})
}

function updateGlobal() {
	let b = getClosestBlock(position.value.x, position.value.y)
	snappedPosition.value.x = b.x
	snappedPosition.value.y = b.y
}

function snapPosition() {
	let b = getClosestBlock(position.value.x, position.value.y)
	position.value.x = b.x
	position.value.y = b.y
}

function selectTab(t) {
	currentTab.value = t
	gridMode.value = false
}

function selectBlock(block) {
	if (editing.value || gridMode.value) return

	position.value.x = block.x
	position.value.y = block.y

	updateGlobal()
}

function editBlock(block) {
	editing.value = block.id
	setTimeout(() => {
		if (window.innerWidth > 900)
			document.querySelector("#focus-input").focus()
	}, 1)
}

let holdTimeout = null

const currentHolding = ref(null)

function startHold(block, isClick) {
	if (gridMode.value) {
		currentHolding.value = block
		return
	}

	if (isClick || window.innerWidth > 901) {
		return
	}

	clearTimeout(holdTimeout)
	holdTimeout = setTimeout(() => {
		editing.value = block.id
		setTimeout(() => {
			//document.querySelector("#focus-input").focus()
		}, 1)
	}, 500)
}

function endHold() {
	clearTimeout(holdTimeout)
}

function getBlockById(id) {
	for (let block of blocks.value) {
		if (block.id == id) {
			return block
		}
	}

	return null
}

function getBlockIndex(id) {
	for (let [i, block] of blocks.value.entries()) {
		if (block.id == id) {
			return i
		}
	}

	return null
}

function initChunk() {
	let c = getCurrentChunk()
	let cref = getChunkRef()
	setDoc(cref, {
		created: Date.now(),
		log: {}
	})
}

function refreshConnection(u) {
	user.value = u;
	if (u) {
		const unsubscribe = onSnapshot(doc(db, "users", user.value.uid), snapshot => {
			isProfileWatched.value = true
			let d = snapshot.data()
			
			if (d) {
				isInitialized.value = true
				blocks.value = Object.keys(d.blocks).map(id => d.blocks[id])
				profileData.value = d
			}
		});

		let cref = getChunkRef()

		let justStarted = true

		const unsub2 = onSnapshot(cref, snapshot => {
			isProfileWatched.value = true
			let d = snapshot.data()
			
			if (d) {
				currentChunk.value = d

				if (currentTracking.value) {
					let b = getBlockById(currentTracking.value.block)
					if (justStarted) {
						justStarted = false
						if (b) {
							selectBlock(b)
						}
					}
				}
			}else{
				initChunk()
			}
		});
	}
}

let scale = ref(1)

function findMiddle() {
	let x = 0
	let y = 0
	for (let block of blocks.value) {
		x += block.x
		y += block.y
	}
	x /= blocks.value.length
	y /= blocks.value.length
	return {
		x,
		y
	}
}

function enterGridMode() {
	gridMode.value = true
	/*let p = findMiddle()
	position.value.x = p.x
	position.value.y = p.y
	snapPosition()
	updateGlobal()*/
	isDeleting.value = false
}

function exitGridMode() {
	gridMode.value = false
	isDeleting.value = false
	if (currentHolding.value) {
		currentHolding.value = null
	}
	updateGlobal()
}

let saveTimeout = null

let updates = []

function updateBlock(block, v) {
	clearTimeout(saveTimeout)
	updates.push({block, value: v})
	for (let k of Object.keys(v)) {
		block[k] = v[k]
	}
	
	saveTimeout = setTimeout(() => {
		let dRef = getProfRef()
		let updateMap = {};
		for (let update of updates) {
			for (let k of Object.keys(update.value)) {
				updateMap[["blocks." + update.block.id + "." + k]] = update.value[k]
			}
		}
		updates = []
		updateDoc(dRef, updateMap)
	}, 1000)
}

watch(scale, () => {
	if (editing.value) {
		scale.value = 1
	}

	if (scale.value < 0) {
		scale.value = 0
	}
	if (scale.value > 1) {
		scale.value = 1
	}

	if (scale.value > 0.5) {
		if (gridMode.value) {
			exitGridMode()
		}
	}else{
		if (!gridMode.value) {
			enterGridMode()
		}
	}

	blockSize.value = lerp(80, 200, scale.value)
})

setInterval(() => {

	if (!isZooming.value)
		if (gridMode.value) {
			scale.value = lerp(scale.value, 0, 0.7)
		} else {
			scale.value = lerp(scale.value, 1, 0.7)
		}
}, 200)

const calendarScale = ref(1)

const dayNames = ref(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])

window.addEventListener("mousewheel", (e) => {
	if (currentTab.value == "tracking") {
		scale.value -= e.deltaY / 1000
	} else {
		if (!e.target.closest(".calendar")) return
		let oldScale = calendarScale.value
		let py = e.clientY
		let ty = (py - calendarY.value) / calendarScale.value
		
		calendarScale.value -= (e.deltaY / 1000) * calendarScale.value
		calendarScale.value = Math.min(90, Math.max(1, calendarScale.value))
		
		calendarY.value = -ty * calendarScale.value + py//calendarY.value - (e.clientY / window.innerHeight) * (600 * calendarScale.value - 600 * oldScale)

		if (600 * calendarScale.value < window.innerHeight) {
			centerCalendar()
		}
	}
});

const calendarInfo = computed(() => {
	let d = new Date()

	return {
		week: getWeek(d),
		day: getDay(d)
	}
})

function centerCalendar() {
	
	calendarX.value = (window.innerWidth - (window.innerWidth * .8)) / 2
	calendarY.value = (window.innerHeight - (600 * calendarScale.value)) / 2
}


const isZooming = ref(false)

const startGridPosition = ref({x: 0, y: 0})
const displaced = ref(null)
const displacedPos = ref(null)

const calendarDragging = ref(false)

onMounted(() => {
	interact(document.querySelector("#calendar-area"))
	.gesturable({
		listeners: {
			start(event) {
			},
			move(event) {
				//calendarScale.value += event.ds
				let py = event.client.y
				let ty = (py - calendarY.value) / calendarScale.value

				calendarScale.value -= (event.ds * -1) * calendarScale.value
				calendarScale.value = Math.min(90, Math.max(1, calendarScale.value))
				
				calendarY.value = -ty * calendarScale.value + py

				if (600 * calendarScale.value < window.innerHeight) {
					centerCalendar()
				}
			},
			end(event) {
			}
		}
	})
	.draggable({
		//lockAxis: "start",
		listeners: {
			start (event) {
				calendarDragging.value = true
			},
			move (event) {
				if (isResizing.value) {
					setResizeTarget(event.client.y)
					return
				}
				//calendarX.value += event.dx * calendarScale.value
				if (600 * calendarScale.value > window.innerHeight) {
					calendarY.value += event.dy
				}

				if (calendarY.value + 600 * calendarScale.value < 100) {
					calendarY.value = 100 - 600 * calendarScale.value
				}

				if (calendarY.value > window.innerHeight - 100) {
					calendarY.value = window.innerHeight - 100
				}

				//calendarSwipeX.value += event.dx
			},
			end (event) {
				calendarDragging.value = false
				if (isResizing.value) {
					confirmResize()
					isResizing.value = false
				}
				calendarSwipeX.value = 0
			}
		}
	})

	interact(rootEl.value)
	.gesturable({
		listeners: {
			start(event) {
				isZooming.value = true
			},
			move(event) {
				clearTimeout(holdTimeout)
				scale.value += event.ds
			},
			end(event) {
				//scale.value += event.ds
				isZooming.value = false
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
			start (event) {
				if (gridMode.value) {
					if (currentHolding.value) {
						startGridPosition.value.x = currentHolding.value.x
						startGridPosition.value.y = currentHolding.value.y
					}
					
					return
				}
				enableTransition.value = false
				//console.log(event.type, event.target)
			},
			move (event) {
				if (gridMode.value) {
					if (event.client.y < 90) {
						isDeleting.value = true
					}else{
						isDeleting.value = false
					}
					if (currentHolding.value) {
						currentHolding.value.x += event.dx / 80
						currentHolding.value.y += event.dy / 80
						let rx = Math.round(currentHolding.value.x)
						let ry = Math.round(currentHolding.value.y)
						let closest = getBlockAt(rx, ry, currentHolding.value)
						if (rx == startGridPosition.value.x && ry == startGridPosition.value.y) {
							closest = null
						}
						if (!closest) {
							if (displaced.value) {
								updateBlock(displaced.value, {
									x: displacedPos.value.x,
									y: displacedPos.value.y
								})
								displaced.value = null
							}
							return
						}
						if (displaced.value) {
							if (displaced.value.id != closest.id) {
								updateBlock(displaced.value, {
									x: displacedPos.value.x,
									y: displacedPos.value.y
								})
								displaced.value = null
							}
						}

						if (!displaced.value && closest.id != currentHolding.value.id) {
							displaced.value = closest
							displacedPos.value = {
								x: displaced.value.x,
								y: displaced.value.y
							}
						}

						if (displaced.value) {
							updateBlock(displaced.value, {
								x: startGridPosition.value.x,
								y: startGridPosition.value.y
							})
						}
					}
					
					return
				}
				clearTimeout(holdTimeout)
				if (!editing.value) {
					position.value.x -= event.dx / 150
					position.value.y -= event.dy / 150
					updateGlobal()
				}
				//console.log(event.type, event.target)
			}

		}
	}).on("dragend", (event) => {
		if (gridMode.value) {
			if (event.client.y < 90) {
				if (currentHolding.value) {
					deleteBlock(currentHolding.value)
					currentHolding.value = null
				}
			}

			if (currentHolding.value) {
				updateBlock(currentHolding.value, {
					x: Math.round(currentHolding.value.x),
					y: Math.round(currentHolding.value.y)
				})
			}

			if (displaced.value) {
				updateBlock(displaced.value, {
					x: startGridPosition.value.x,
					y: startGridPosition.value.y
				})
				displaced.value = null
			}
			currentHolding.value = null
			return
		}
		
		enableTransition.value = true
		snapPosition()
		//console.log(event.type, event.target)
	})
})

const creatingUser = ref(false)

function getProfRef() {
	return doc(db, "users", user.value.uid)
}

let linearLog = computed(() => {
	if (currentChunk.value)
		return Object.keys(currentChunk.value.log).map(key => [parseInt(key), currentChunk.value.log[key]]).sort((a, b) => a[0] - b[0])

	return []
})

function getLogItemIndex(time) {
	return linearLog.value.findIndex(item => item[0] == time)
}

function getCurrentChunk() {
	let n = Date.now()
	return (Math.floor(n / (1000 * 60 * 60 * 24 * 14)) * (60 * 60 * 24 * 14)).toString()
}

function getCurrentTime() {
	let c = getCurrentChunk()
	let n = Date.now()
	return Math.floor(n / 1000) - c
}

const currentTracking = computed(() => {
	let log = linearLog.value
	if (log.length == 0) {
		return null
	}
	let last = log[log.length - 1]

	return {
		time: last[0],
		block: last[1]
	}
})

let trackingTimeout = null

function startTracking(block) {
	let cref = getChunkRef()
	let log = linearLog.value
	let t = getCurrentTime()
	
	if (log.length > 0) {
		let last = log[log.length - 1]
		if (last[1] == block.id) {
			return
		}

		if (last[0] + 15 > t) {
			t = last[0]
		}
	}

	if (currentChunk.value) {
		currentChunk.value.log[t.toString()] = block.id
	}

	if (trackingTimeout)
		clearTimeout(trackingTimeout)
	
	trackingTimeout = setTimeout(() => {
		updateDoc(cref, {
			[["log." + t.toString()]]: block.id
		})
	}, 1000)
}

function getChunkRef() {
	let m = getCurrentChunk()
	return doc(db, "users", user.value.uid, "chunks", m)
}

function initUser(useTemplate) {
	creatingUser.value = true
	setTimeout(async () => {
		
		let dRef = getProfRef()
		await setDoc(dRef, {
			name: "",
			blocks: {
				"aa": {
					id: 'aa',
					x: 0,
					y: 0,
					name: "Internet",
					color: "#2196f3",
				}
			},
			created: Date.now(),
		})
		creatingUser.value = false
		isInitialized.value = true

		console.log("initialized")
	}, 300);
}

function formatTime(t) {
	let dec = t - Math.floor(t)
	return `${Math.floor(t)}:${Math.round(dec * 60).toString().padStart(2, "0")}`
}

function formatTimeClockMode(t) {
	let dec = t - Math.floor(t)
	let suffix = ""
	if (clockMode.value == "12h") {

		if (t >= 12) {
			t -= 12
			suffix = "p"
		} else {
			suffix = "a"
		}

		if (Math.floor(t) == 0) {
			t = 12
		}
	}
	return `${Math.floor(t)}:${Math.round(dec * 60).toString().padStart(2, "0")}${suffix}`
}

function getNewId() {
	let id = (Math.random() * 100000).toString(36).slice(-2)
	while (blocks.value.find(b => b.id == id)) {
		id = (Math.random() * 100000).toString(36).slice(-2)
	}
	return id
}

async function addBlock(x, y) {
	let dRef = getProfRef()
	let id = getNewId()
	await updateDoc(dRef, {
		[["blocks." + id]]: {
			id: id,
			x: x,
			y: y,
			name: "Activity",
			color: "#9c27b0"
		}
	})
	if (window.innerWidth < 900) {
		position.value.x = x
		position.value.y = y
		updateGlobal()
	}
}

const isDeleting = ref(false)
const currentTimeUpdating = ref(getCurrentTime())

setInterval(() => {
	currentTimeUpdating.value = getCurrentTime()
}, 1000)

document.addEventListener("mouseup", () => {
	currentHolding.value = null
	isResizing.value = false
})


function formatSeconds(s) {
	if (s >= 60 * 60 * 24) {
		return (s / (60 * 60 * 24)).toFixed(1) + "d"
	} else if (s >= 60 * 60) {
		return formatTime(s / (60 * 60)) + ":" + formatTime(s / 60).split(":")[1] //(s / (60 * 60)).toFixed(1) + "h"
	} else if (s >= 60) {
		return formatTime(s / 60)//Math.round((s / 60 * 10)) / 10 + "m"
	} else {
		return s + "s"
	}
}

const calendarX = ref(0)
const calendarY = ref(0)
const calendarSwipeX = ref(0)

centerCalendar()

const chunkCache = ref({})

function floorToChunk(t) {
	let n = t
	let cid = (Math.floor(n / (1000 * 60 * 60 * 24 * 14)) * (60 * 60 * 24 * 14))
	return cid
}

async function getChunkForTime(t) {
	let cid = floorToChunk(t).toString()

	if (cid == getCurrentChunk()) {
		return currentChunk.value
	}

	let cRef = doc(db, "users", user.value.uid, "chunks", cid)
	if (chunkCache.value[cid]) {
		return chunkCache.value[cid]
	}else{
		let c = await getDoc(cRef)
		if (c && c.exists()) {
			chunkCache.value[cid] = c.data()
			return c
		}
	}

	return null
}

function setKeyWithDotsInObj(obj, key, value) {
	let keys = key.split(".")
	let last = keys.pop()
	let o = obj
	for (let k of keys) {
		if (!o[k]) {
			o[k] = {}
		}
		o = o[k]
	}
	o[last] = value
}

function deleteKeyWithDotsInObj(obj, key) {
	let keys = key.split(".")
	let last = keys.pop()
	let o = obj
	for (let k of keys) {
		if (!o[k]) {
			return
		}
		o = o[k]
	}
	delete o[last]
}

async function setKeyInChunk(time, key, value) {
	let cid = floorToChunk(time).toString()
	let cRef = doc(db, "users", user.value.uid, "chunks", cid)
	let c = await getChunkForTime(time)
	
	if (c) {
		setKeyWithDotsInObj(c, key, value)
	}

	enqueueDBAction(() => {
		updateDoc(cRef, {
			[[key]]: value
		})
	})
}

async function deleteKeyInChunk(time, key) {
	let cid = floorToChunk(time).toString()
	let cRef = doc(db, "users", user.value.uid, "chunks", cid)
	let c = await getChunkForTime(time)

	if (c) {
		deleteKeyWithDotsInObj(c, key)
	}

	enqueueDBAction(() => {
		updateDoc(cRef, {
			[[key]]: deleteField()
		})
	})
}

async function getLatestTimeLog(time) {
	let c = await getChunkForTime(time)
	let ctime = floorToChunk(time)
	if (c) {
		let log = Object.keys(c.log).map(v => [parseInt(v), c.log[v]]).sort((a, b) => a[0] - b[0])
		if (log.length > 0) {
			return {
				log: log[log.length - 1],
				chunk: ctime
			}
		}
	}

	let cBack = await getChunkForTime(time - (1000 * 60 * 60 * 24 * 14))
	ctime = floorToChunk(time - (1000 * 60 * 60 * 24 * 14))
	if (cBack) {
		let log = Object.keys(cBack.log).map(v => [parseInt(v), cBack.log[v]]).sort((a, b) => a[0] - b[0])
		if (log.length > 0) {
			return {
				log: log[log.length - 1],
				chunk: ctime
			}
		}
	}

	return null
}

async function getLogForDay(day) {
	let chunk = await getChunkForTime(day)
	let chunkStart = floorToChunk(day)
	let dayInSeconds = day / 1000

	let fakeData = false
	if (fakeData) {
		let a = []
		let n = 24 * 60
		for (let i = 0; i < n; i++) {
			let rng = Math.floor(Math.random() * blocks.value.length)
			let size = Math.floor(Math.random() * 10)
			if (Math.random() > 0.9)
			size = Math.floor(Math.random() * 100)

			i += size
			a.push([
				dayInSeconds - chunkStart + (i / n) * 60 * 60 * 24,
				blocks.value[rng].id
			])
		}
		return a
	}

	if (chunk && chunk.log) {
		let logs = Object.keys(chunk.log).map(v => [parseInt(v), chunk.log[v]]).sort((a, b) => a[0] - b[0]).filter(v => {
			let vi = v[0] + chunkStart
			if (vi >= dayInSeconds && vi < dayInSeconds + 60 * 60 * 24) {
				return true
			}
		})

		if (logs.length == 0) {
			let lastActivity = await getLatestTimeLog(day)
			if (lastActivity) {
				if (lastActivity.chunk + lastActivity.log[0] > dayInSeconds) {
					return []
				}

				if (day > Date.now()) {
					return []
				}
				
				if (lastActivity.chunk + lastActivity.log[0] > dayInSeconds + 24 * 60 * 60) {
					return [
						[dayInSeconds - chunkStart, lastActivity.log[1]],
						[dayInSeconds - chunkStart + 60 * 60 * 24, lastActivity.log[1]],
					]
				}else{
					console.log(lastActivity)
					return [
						[dayInSeconds - chunkStart, lastActivity.log[1]],
						//[dayInSeconds - chunkStart + (Date.now() - day) / 1000, lastActivity.log[1]]
					]
				}
			}
			return []
		}else{
			return logs
		}
	}else{
		return []
	}
}

const selectedTime = ref(new Date())

const selectedWeek = computed(() => {
	let time = selectedTime.value
	if (window.innerWidth <= 900) {
		return {
			start: startOfDay(time),
			end: startOfDay(time),
		}
	}
	return {
		start: startOfWeek(time),
		end: endOfWeek(time),
	}
})

const calendarAnimating = ref(false)
const calendarAnimatingTo = ref(0)

const weekTimeChunks = ref([[], [], [], [], [], [], []])

function prevWeek() {
	calendarAnimating.value = true
	calendarAnimatingTo.value = 1
	setTimeout(() => {
		weekTimeChunks.value = [[], [], [], [], [], [], []]
		if (window.innerWidth <= 900) {
			selectedTime.value = subDays(selectedTime.value, 1)
		}else{
			selectedTime.value = subWeeks(selectedTime.value, 1)
		}
		calendarAnimating.value = false
	}, 300)
}

function nextWeek() {
	calendarAnimatingTo.value = -1
	calendarAnimating.value = true
	setTimeout(() => {
		weekTimeChunks.value = [[], [], [], [], [], [], []]
		if (window.innerWidth <= 900) {
			selectedTime.value = addDays(selectedTime.value, 1)
		}else{
			selectedTime.value = addWeeks(selectedTime.value, 1)
		}
		calendarAnimating.value = false
	}, 300)
}

const weekList = computed(() => {
	let x = []
	let d = new Date()
	for (let i = 0; i < 24; i++) {
		let t = subWeeks(d, i)
		x.push({
			time: t,
			name: format(t, "dd MMMM yyyy"),
		})
	}
	return x
})

function selectWeek(time) {
	selectedTime.value = time.time
}

const chartRange = ref(1)

watch([selectedWeek, currentChunk], async () => {
	let sow = getTime(selectedWeek.value.start)
	let days = []
	let dbefore = await getLogForDay(sow - 24 * 60 * 60 * 1000)
	for (let i = 0; i < 7; i++) {
		let startOfDay = sow + i * 24 * 60 * 60 * 1000
		let startOfDayChunk = startOfDay / 1000 - floorToChunk(startOfDay)
		let d = await getLogForDay(startOfDay)
		if (d.length > 0) {
			if (d[0][0] != startOfDay / 1000) {
				if (dbefore.length > 0)
					d.unshift([startOfDayChunk, dbefore[dbefore.length - 1][1]])
			}
		}

		let parts = []
		for (let j = 0; j < d.length; j++) {
			let e = Math.min(Date.now() / 1000 - floorToChunk(startOfDay), startOfDayChunk + 24 * 60 * 60)
			if (j < d.length - 1) {
				e = d[j + 1][0]
			}
			parts.push({
				start: d[j][0] - startOfDayChunk,
				end: e - startOfDayChunk,
				block: getBlockById(d[j][1]) || {color: "white", name: "Unknown"},
			})
		}

		days.push(parts.sort((a, b) => (b.end - b.start) - (a.end - a.start)))

		dbefore = d
	}
	weekTimeChunks.value = days
}, {deep: true})

const weekTimeChunksInView = computed(() => {
	let chunks = weekTimeChunks.value

	let sizeInPixels = 600 * calendarScale.value

	let sy = Math.abs(Math.min(0, calendarY.value / sizeInPixels))
	let ey = sy + innerHeight / sizeInPixels
	let dayInSeconds = 24 * 60 * 60

	sy *= dayInSeconds
	ey *= dayInSeconds

	return chunks.map(
		day => day.filter(v => (sy < v.start && v.start < ey) || (sy < v.end && v.end < ey) || (v.start < sy && ey < v.end))
	).map(
		day => day.length > 50 ? day.slice(0, 50) : day
	)
})

const divisions = ref([
	[0, 24],
	[1, 24],
	[2, 24 * 2],
	[3, 24 * 4],
	[10, 24 * 6],
	[15, 24 * 12],
])

const currentDivision = computed(() => {
	for (let i = 0; i < divisions.value.length; i++) {
		if (divisions.value[i][0] >= calendarScale.value) {
			return divisions.value[i - 1][1]
		}
	}

	return divisions.value[divisions.value.length - 1][1]
})

const resizingDay = ref(null)
const resizingBlockA = ref(null)
const resizingBlockB = ref(null)
const resizingEdge = ref(null)
const resizingEdgeChunkTime = ref(null)
const resizingBlockTarget = ref(0)
const isResizing = ref(false)

function setResizeTarget(clientY) {
	let i = getLogItemIndex(resizingEdgeChunkTime.value)
	let prev = null
	let next = null
	if (i > 0) prev = linearLog.value[i - 1]
	if (i + 1 < linearLog.value.length) next = linearLog.value[i + 1]

	if (i == -1) {
		return false
	}

	let sizeInPixels = 600 * calendarScale.value
	let sy = Math.abs(Math.min(0, calendarY.value / sizeInPixels))
	let ey = sy + innerHeight / sizeInPixels

	if (calendarY.value > 0) {
		clientY -= calendarY.value
	}
	let dayInSeconds = 24 * 60 * 60

	let dec = sy + (clientY / window.innerHeight) * (ey - sy)
	dec *= dayInSeconds

	if (dec < 0)
		dec = 0

	if (dec > dayInSeconds)
		dec = dayInSeconds
	
	let offset = currentWeekdayAndTimeToChunkTime(resizingDay.value, 0)

	if (prev && dec < prev[0] - offset)
		dec = prev[0] - offset

	if (next && dec > next[0] - offset)
		dec = next[0] - offset

	resizingBlockTarget.value = Math.floor(dec)

	return true
}

function confirmResize() {
	let i = getLogItemIndex(resizingEdgeChunkTime.value)
	let key = resizingEdgeChunkTime.value.toString()

	let activity = currentChunk.value.log[key]
	deleteKeyInChunk(getTime(selectedTime.value), "log." + key)
	//delete currentChunk.value.log[key]
	let offset = currentWeekdayAndTimeToChunkTime(resizingDay.value, 0)
	let r = offset + resizingBlockTarget.value

	if (r - resizingEdgeChunkTime.value != 0) {
		//currentChunk.value.log[r.toString()] = activity
		setKeyInChunk(getTime(selectedTime.value), "log." + r.toString(), activity)
	}
}

function currentWeekdayAndTimeToChunkTime(day, time) {
	let sow = getTime(startOfWeek(new Date()))
	let d = sow + day * 24 * 60 * 60 * 1000
	let chunk = floorToChunk(sow)
	return ((sow / 1000) - chunk) + day * 24 * 60 * 60 + time
}

function startResize(e, d, start, end) {
	let rect = e.currentTarget.getBoundingClientRect()
	let direction = false
	if (e.clientY < rect.top + 8) {
		direction = false
	}else if (e.clientY > rect.bottom - 8) {
		direction = true
	}else{
		return
	}
	
	if (!direction) {
		resizingBlockA.value = start
		resizingBlockB.value = start
		resizingEdge.value = start
	}else{
		resizingBlockA.value = end
		resizingBlockB.value = end
		resizingEdge.value = end
	}

	resizingEdgeChunkTime.value = currentWeekdayAndTimeToChunkTime(d, resizingEdge.value)

	resizingDay.value = d

	isResizing.value = true

	let v = setResizeTarget(e.clientY)
	if (!v) {
		isResizing.value = false
	}
}

const clockMode = computed(() => {
	profileData.value
	return getSetting("clockMode", "24h")
})

function toggleClockMode() {
	if (clockMode.value == "24h") {
		setSetting("clockMode", "12h")
	}else{
		setSetting("clockMode", "24h")
	}
}

function addLogBlock(time, blockId) {
	currentChunk.value.log[Math.floor(time).toString()] = blockId
}

function addTimeBlock(d, start, end, direction) {
	let chunkTime = currentWeekdayAndTimeToChunkTime(d, start)
	let i = getLogItemIndex(chunkTime)
	if (direction) {
		setKeyInChunk(getTime(selectedTime.value), "log." + Math.floor(chunkTime + (end - start) * 0.9).toString(), linearLog.value[i][1])
	}else{
		setKeyInChunk(getTime(selectedTime.value), "log." + Math.floor(chunkTime + (end - start) * 0.1).toString(), linearLog.value[i][1])
	}
}

function updateTimeBlock(d, start, blockId) {
	let chunkTime = currentWeekdayAndTimeToChunkTime(d, start)
	//currentChunk.value.log[chunkTime.toString()] = blockId
	setKeyInChunk(getTime(selectedTime.value), "log." + chunkTime.toString(), blockId)
}

const dataValues = ref([30, 40, 60, 70, 5]);
const toggleLegend = ref(true);

const testData = ref(null)
watch([chartRange, currentChunk], async () => {

	let times = {}
	let range = chartRange.value
	let start = getTime(subWeeks(startOfWeek(new Date()), range))
	let end = getTime(endOfWeek(new Date()))

	let chunks = {}

	for (let i = start; i < end; i += 1000 * 60 * 60 * 24) {
		let c = floorToChunk(i)
		if (!chunks[c]) {
			let cdata = await getChunkForTime(i)
			if (cdata)
				chunks[c] = cdata
		}
	}

	let timer = start
	let activity = "blank"
	let total = 0

	for (let key of Object.keys(chunks)) {
		let chunkTime = parseInt(key) * 1000
		for (let block of Object.keys(chunks[key].log)) {
			let time = chunkTime + parseInt(block) * 1000

			if (activity == "blank") {
				activity = chunks[key].log[block]
				timer = time
				continue
			}

			if (!times[activity]) {
				times[activity] = 0
			}

			times[activity] += time - timer
			total += time - timer

			timer = time
			activity = chunks[key].log[block]
		}
	}
	let labels = Object.keys(times)
	let labelsData = labels.map(l => l == "blank" ? "blank" : blocks.value.find(b => b.id == l).name)
	let colorData = labels.map(l => l == "blank" ? "white" : blocks.value.find(b => b.id == l).color)
	let numData = labels.map(l => times[l] / 1000)
	console.log(labelsData, colorData, numData)
	testData.value = {
		labels: labelsData,
		datasets: [
			{
				data: numData,
				backgroundColor: colorData,
			},
		],
	}
	console.log(testData.value)
}, {deep: true})

const chartOptions = ref({
      responsive: true,
	  
      plugins: {
		  tooltip: {
			  callbacks: {
				  label: function(context) {
					  return formatSeconds(context.dataset.data[context.dataIndex])
				  }
			  }
		  },
		datalabels: {
			formatter: (value) => {
				return formatSeconds(value);
			}
		},
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Chart.js Doughnut Chart',
        },
      },
    });

</script>

<template>
	<login-box @setUser="refreshConnection($event)"></login-box>
	
	<div class="grid-drop-zone" :class="{'open': currentHolding, 'active': isDeleting}"><i class="fas fa-trash"></i></div>
	<div class="back-drop" :class="{'active': !!editing}" @click="editing = ''"></div>
	<div class="init-modal modal" :class="{'open': isProfileWatched && !isInitialized}">
		<div class="modal-content">
			<h1 class="big-title">Get Started</h1>
			<div class="btn-bar">
				<div class="big-btn" :class="{'disabled': creatingUser}" @click="initUser()">
					<i class="far fa-square fa-3x"></i>
					<div>Empty</div>
				</div>
				<div class="big-btn" :class="{'disabled': creatingUser}" @click="initUser(true)">
					<i class="fas fa-shapes fa-3x"></i>
					<div>Template</div>
				</div>
			</div>
		</div>
	</div>
	<div class="block-wrap" :class="{'grid-mode': gridMode}" ref="rootEl">
		<template v-for="(block, i) in blocks" :key="block.id">
			<div
				class="block"
				:class="{'editing': block.id == editing, 'active': block.x == snappedPosition.x && block.y == snappedPosition.y}"
				:style="{
					'--color': block.color,
					'--contrast': invert(block.color, true),
					...computedTransforms[i]
				}"
				:data-block="block.id"
				@contextmenu="$event.preventDefault()"
			>
				<template v-for="(dir, j) in blockDirections[i]">
					<div class="add-block-direction" @click="addBlock(dir.x, dir.y)" :style="{'--x': dir.relx, '--y': dir.rely}">
						<i class="fas fa-add"></i>
					</div>
				</template>

				<div v-if="editing == block.id" @click="editing = ''" class="bad-btn"><i class="fas fa-times"></i></div>
				<div @click="selectBlock(block)" @mousedown="startHold(block, true)" @touchstart="startHold(block)" @touchend="endHold()" class="block-background"></div>
				
				<div class="block-icon">
					<Icon :icon="block.icon || block.name">
						<Dialog v-if="editing">
							<Selector @update:modelValue="block.icon = $event.name, updateBlock(block, {icon: block.icon})" :data="selectorIcons"></Selector>
						</Dialog>
					</Icon>
				</div>
				<div v-if="block.id != editing" class="block-text">{{block.name}}</div>
				<input v-else id="focus-input" @keypress.enter="editing = ''" class="block-text" style="pointer-events: all;" v-model="block.name" @change="updateBlock(block, {name: block.name})" />
				<Color class="block-color-box" v-model="block.color" @update:modelValue="updateBlock(block, {color: block.color})"></Color>
				<div @click="editBlock(block)" class="block-edit-btn"><i class="fas fa-edit"></i></div>
			</div>
		</template>

		<template v-if="currentTracking !== null && !gridMode">
			<div class="tracking-clock"
				:style="{
					...computedTransforms[getBlockIndex(currentTracking.block)]
				}">
				{{formatSeconds(currentTimeUpdating - currentTracking.time)}}
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
				<div @click="addBlock(block.x, block.y)" class="block-background"></div>
				<div class="block-icon">
					<i class="fas fa-add fa-5x"></i>
				</div>
			</div>
		</template>
	</div>

	<div class="calendar" :style="{'--calendar-direction': calendarAnimatingTo}" :class="{'calendar-animating': calendarAnimating, 'active': currentTab == 'calendar'}" id="calendar-area">
		<div class="week">
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
								<div @mousedown="startResize($event, d - 1, c.start, c.end)" class="time-chunk" :style="{
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
		</div>
	</div>

	<div class="charts" :class="{'active': currentTab == 'chart'}" id="charts-area">
		<DoughnutChart v-if="testData" :options="chartOptions" :chartData="testData" />
	</div>

	<div class="tabs-container">
	<div class="tabs">
		<div class="tab" @click="selectTab('tracking')" :class="{'active': currentTab == 'tracking'}">
			<div class="tab-icon"><i class="fas fa-stopwatch"></i></div>
			<div class="tab-text">Tracking</div>
		</div>
		<div class="tab" @click="selectTab('calendar')" :class="{'active': currentTab == 'calendar'}">
			<div class="tab-icon"><i class="fas fa-calendar-week"></i></div>
			<div class="tab-text">Log</div>
		</div>
		<div class="tab" @click="selectTab('chart')" :class="{'active': currentTab == 'chart'}">
			<div class="tab-icon"><i class="fas fa-chart-pie"></i></div>
			<div class="tab-text">Charts</div>
		</div>
		<div @click="gridMode ? exitGridMode() : enterGridMode()" class="tab" :class="{'active': gridMode}">
			<div class="tab-icon"><i class="fas fa-edit"></i></div>
		</div>
	</div>
	</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Overpass&display=swap');

.clock-24-12 {
	cursor: pointer;
	transition: .2s;
	position: absolute;
	bottom: -32px;
	width: 40px;
	text-align: center;
	font-family: 'Overpass', sans-serif;
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
	transition: .3s;
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
	transition: .3s;
	
	--add-x: calc(var(--calendar-direction) * 100vw);
}

.calendar-animating .days.swiper {
	animation: days-grow .3s ease-in-out forwards;
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
	transition: .3s;
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
	transition: .3s;
	height: 100%;
	padding: 10px;
	border-radius: 6px;
}

.week-box > *:hover {
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
	transition: .3s;
	opacity: 0;
	pointer-events: none;

	display: block;
	
	overflow: hidden;
	touch-action: none;
}

.calendar.active {
	opacity: 1;
	pointer-events: all;
}

.charts {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: white;
	z-index: 19;
	transition: .3s;
	opacity: 0;
	pointer-events: none;

	display: block;
	
	overflow: hidden;
	touch-action: none;

	display: flex;
	flex-direction: column;
	/* align-items: center; */
	justify-content: flex-start;
}

.charts.active {
	opacity: 1;
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

.time-chunk::after, .time-chunk::before {
	content: '';
	transition: .3s;
	transform: scale(0, 1);
}

.days:not(.resizing) .time-chunk:hover::after, .days:not(.resizing) .time-chunk:hover::before {
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
	content: '';
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
	content: '';
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
	font-family: 'Overpass', sans-serif;
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
	height: calc(((var(--end) - var(--start) - 4) / var(--total-seconds)) * 100%);

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
	font-family: 'Overpass', sans-serif;
}

.time-chunk-name {
	width: 100%;
	height: 100%;
	z-index: 10;
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
	content: '';
	position: absolute;
	bottom: 0;
	left: -10px;
	width: calc(100vw * 0.8 + 10px);
	border-bottom: 1px solid rgb(0 0 0 / 7%);
	z-index: 10
}

.tabs {
	background-color: white;
	box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
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
	transition: .3s;
	cursor: pointer;
	user-select: none;
}

.tab:hover {
	background-color: #dadada;
}

.tab.active {
	background-color: rgb(119, 187, 255);
	color: black;
	box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
}

.tab-icon:not(:only-child) {
	margin-right: 20px;
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
		padding: 15px 10px;
		margin: 0px;
		font-size: 20px;
		border-radius: 0px;
		flex: 1;
	}

	.tab-icon:not(:only-child) {
		margin-right: 5px;
	}
}

@media (max-width: 394px) {
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
	transition: .3s;

	background-color: rgb(72, 167, 88);
	border-radius: 12px;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, .2);
	--scale: 1;
}

.add-block-direction:hover {
	--scale: 1.2;
}

.block.active .add-block-direction, .block:hover .add-block-direction, .block.active:hover .add-block-direction {
	transform: translate(calc(var(--x) * 100% + var(--x) * 80px), calc(var(--y) * 100% + var(--y) * 80px)) scale(var(--scale));
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
	--add-scale: -.4;
	
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
	box-shadow: 0px 3px 16px rgba(0,0,0,0.2);
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
	box-shadow: 0px 6px 16px rgba(0,0,0,0.2);
}

.big-btn:active {
	box-shadow: 0px 3px 3px rgba(0,0,0,0.2);
	transition: .05s;
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
	box-shadow: 0 0 24px 0 rgba(0,0,0,0.2);
	z-index: 40;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	transform: scale(0);
	transition: .3s;
	pointer-events: none;
}

.modal {
	position: fixed;
	top: 0%;
	left: 0%;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.295);
	z-index: 30;
	opacity: 0;
	transition: .3s;
	pointer-events: none;
}

.modal.open {
	opacity: 1;
	transition: .3s;
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
		bottom:0%;
		height: unset;
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
	transition: .3s;
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
	transition: opacity .3s;
	pointer-events: none;
}

.back-drop.active {
	opacity: 1;
	pointer-events: all;
}

.editing .block-background {
	transform: scale(0);
	/* opacity: 0; */
	border-radius: 50%;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, .3);
	cursor: default;
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
	transition: .3s;
	border-radius: 120px;
	background-color: #42b983;
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
	background-color: rgb(93, 202, 135);
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
}

.block:hover {
	--add-scale: .1;
}

.grid-mode .block, .grid-mode .block .block-background {
	font-size: 10px;
	border-radius: 12px !important;
	cursor: grab;
}

.grid-mode .block:active {
	cursor: grabbing;
	--add-scale: -0.1;
	z-index: 2;
}

.grid-mode .block:active, .grid-mode .block:active .block-background {
	cursor: grabbing;
}

.grid-mode .block .block-text {
	font-size: 12px;
	height: 15px;
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

.block .block-icon, .block .block-text {
	pointer-events: none;
	color: var(--contrast);
}

.editing .block-icon > i {
	pointer-events: all;
	cursor: pointer;
}

.block-background {
	background-color: var(--color);
	position: absolute;
	top: 0px;
	left: 0px;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: .4s;
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
	font-family: 'Overpass', sans-serif;
}

@media (max-width: 900px) {
	.editing {
		position: fixed;
		width: 100vw;
		height: 100%;
		transform: translate(0px, 0px);
		z-index: 10;
		transition: .3s;
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
		transition: .3s;
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
	transition: .3s;
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
	transition: .3s !important;
	border-radius: 120px;
	background-color: rgb(230, 25, 25);
	color: white;
	font-weight: bold;
	font-family: 'Overpass', sans-serif;
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
	--add-scale: .1;
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
