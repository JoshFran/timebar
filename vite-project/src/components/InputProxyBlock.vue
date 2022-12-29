<script setup>
import Selector from "./Selector.vue";
import Dialog from "./Dialog.vue";
import Color from "./Color.vue";
import Icon from "./Icon.vue";
import icons from "../icons";
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

let iconActive = ref(false);
let inputEl = ref(null);

let value = ref({
	icon: "circle",
	name: "Untitled",
	color: "#2196f3",
});
const emit = defineEmits(["update:modelValue"]);

const selectorIcons = computed(() => {
	return Object.keys(icons).map((i) => ({
		name: i,
	}));
});

function handleClick(e) {
	if (e.target.classList.contains("input-wrap")) {
		inputEl.value.focus();
	}
}
</script>

<template>
	<div
		@click="handleClick"
		class="input-wrap cursor-text relative input-root w-full rounded-lg min-h-12 bg-white border border-gray-200 flex items-center"
	>
		<span
			class="text-lg cursor-pointer flex ml-2"
			@click="() => (iconActive = !iconActive)"
		>
			<Icon
				class="text-lg flex"
				:style="`color: ${value.color};`"
				:icon="value.icon"
			>
				<Dialog>
					<Selector
						@update:modelValue="value.icon = $event.name"
						:data="selectorIcons"
					></Selector>
				</Dialog>
			</Icon>
		</span>
		<input
			ref="inputEl"
			type="text"
			style="line-height: 1em"
			class="ml-2 h-10 w-full outline-none pt-[3px]"
			v-model="value.name"
		/>
		<Color
			class="block-color-box scale-50 mr-3"
			v-model="value.color"
			@update:modelValue="emit('update:modelValue', value)"
		></Color>
	</div>
</template>
