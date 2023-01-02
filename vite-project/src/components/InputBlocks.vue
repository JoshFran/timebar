<script setup>
import Selector from "./Selector.vue";
import Dialog from "./Dialog.vue";
import Icon from "./Icon.vue";
import {
	computed,
	nextTick,
	onMounted,
	reactive,
	ref,
	toRef,
	defineEmits,
	watch,
} from "vue";

const { modelValue } = defineProps({
	modelValue: Array,
});
const emit = defineEmits(["update:modelValue"]);

let currentName = ref("");
let openDialog = ref(false);
let inputEl = ref(null);
let scrollingEl = ref(null);

let selectedIndex = ref(0);

function resizeBox() {
	let width = inputEl.value.offsetWidth;
	inputEl.value.style.width = (inputEl.value.value.length + 1) * 10 + "px";
	openDialog.value = false;
	setTimeout(() => {
		openDialog.value = true;
	}, 10);
}

function handleKeydown(e) {
	resizeBox();
	if (e.code == "ArrowUp") {
		selectedIndex.value--;
		if (selectedIndex.value < 0) selectedIndex.value = 0;
		e.preventDefault();
		return;
	}
	if (e.code == "ArrowDown") {
		selectedIndex.value++;
		if (selectedIndex.value > filtered.value.length - 1)
			selectedIndex.value = 0;
		e.preventDefault();
		return;
	}

	if (e.code == "Enter" && currentName.value.length) {
		let selectedBlock = filtered.value[selectedIndex.value];
		if (selectedBlock) {
			let found = modelValue.find((b) => b.name == selectedBlock.name);
			if (!found) {
				modelValue.push(selectedBlock);
				pushModel();
			}
		}
		currentName.value = "";
	}

	selectedIndex.value = 0;

	if (e.code == "Backspace" && !currentName.value) {
		modelValue.pop();
		pushModel();
	}
}

function pushModel() {
	emit("update:modelValue", modelValue);
}

watch(selectedIndex, (val) => {
	setTimeout(() => {
		if (scrollingEl.value) {
			let el = document.querySelector(".selected-input-item");
			if (el)
				el.scrollIntoView({
					block: "end",
					inline: "nearest",
				});
		}
	}, 1);
});

watch(currentName, (val) => {
	if (currentName.value) {
		openDialog.value = true;
	}
	resizeBox();
});

function handleClick(e) {
	if (e.target.classList.contains("input-root")) {
		inputEl.value.focus();
	}
}

const blocksSource = computed(() => {
	return window.timebar.blocks;
});

const filtered = computed(() => {
	return blocksSource.value
		.filter((item) => {
			if (!currentName.value) return true;

			if (modelValue.find((b) => b.name == item.name)) {
				return false;
			}

			if (typeof item == "string") {
				return item
					.toLowerCase()
					.includes(currentName.value.toLowerCase());
			} else {
				return item.name
					.toLowerCase()
					.includes(currentName.value.toLowerCase());
			}
		})
		.slice(0, 35);
});
</script>

<template>
	<div
		@click="handleClick"
		class="cursor-text relative input-root w-full rounded-lg min-h-12 py-2 px-3 bg-white border border-gray-200 flex flex-wrap items-center"
	>
		<template v-for="(b, i) in modelValue">
			<div
				class="cursor-pointer mr-1 mb-1 rounded-full text-xs py-1 px-2 bg-gray-200 flex items-center justify-center"
			>
				<span
					class="flex items-center justify-center"
					:style="`color: ${b.color};`"
					@click="() => (modelValue.splice(i, 1), pushModel())"
				>
					<Icon class="text-sm mr-1" :icon="b.icon || b.name" />
					<span stlye="line-height: 1em;">
						{{ b.name }}
					</span>
				</span>
			</div>
		</template>
		<div class="ml-1">
			<input
				ref="inputEl"
				type="text"
				v-model="currentName"
				class="outline-none bg-transparent font-mono"
				@keydown="handleKeydown"
			/>
		</div>

		<div
			ref="scrollingEl"
			v-if="currentName && filtered.length"
			class="cursor-pointer absolute top-full left-0 right-0 -mt-2 -ml-[1px] -mr-[1px] bg-white border border-gray-200 flex flex-wrap items-center min-h-10 rounded-b-lg py-1 max-h-80 overflow-auto z-10"
		>
			<template v-for="(block, i) in filtered">
				<button
					class="w-full py-1"
					:class="{
						'bg-gray-200 selected-input-item': selectedIndex == i,
					}"
					:style="`color: ${block.color}`"
					@click="
						() => {
							modelValue.push(block);
							pushModel();
							currentName = '';
						}
					"
				>
					<Icon class="text-xl" :icon="block.icon || block.name" />
					{{ block.name }}
				</button>
			</template>
		</div>
	</div>
</template>
