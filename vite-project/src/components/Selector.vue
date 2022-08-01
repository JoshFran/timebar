<script setup>
import {
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
	Teleport
} from "vue";
import invert from "invert-color";
import Icon from "./Icon.vue";

const query = ref("");

const { modelValue, data, hideSearch } = defineProps({
	modelValue: [String, Object],
	data: Array,
	hideSearch: Boolean
});
const emit = defineEmits(["update:modelValue"]);

const inp = ref(null);

const filtered = computed(() => {
	return data
		.filter(item => {
			if (!query.value) return true;

			if (typeof item == "string") {
				return item.toLowerCase().includes(query.value.toLowerCase());
			} else {
				return item.name
					.toLowerCase()
					.includes(query.value.toLowerCase());
			}
		})
		.slice(0, 35);
});

const root = ref(null);

function selectVal(item) {
	let event = new Event("closedialog", {
		bubbles: true
	});
	root.value.dispatchEvent(event);
	emit("update:modelValue", item);
}

function isSelected(item) {
	if (!modelValue) return false;

	if (typeof item == "string") {
		return item == modelValue;
	} else {
		return item.name == modelValue.name;
	}
}

onMounted(() => {
	if (window.innerWidth > 900) {
		if (!hideSearch.value && inp.value) {
			inp.value.focus();
			root.value.parentElement.scrollTop = 0;
		}
	}
});
</script>

<template>
	<div ref="root" class="selector">
		<input
			ref="inp"
			v-if="!hideSearch"
			type="text"
			placeholder="Search"
			v-model="query"
		/>
		<template v-for="item in filtered">
			<div @click="selectVal(item)">
				<slot :item="item">
					<div
						class="selector-item"
						:class="{ selected: isSelected(item) }"
						:style="{
							'--color': item.color ? item.color : 'white',
							'--contrast': item.color
								? invert(item.color, true)
								: 'black'
						}"
					>
						{{ typeof item == "string" ? item : item.name }}
						<Icon
							:icon="
								typeof item == 'string'
									? item
									: item.icon || item.name
							"
						/>
					</div>
				</slot>
			</div>
		</template>
	</div>
</template>

<style scoped>
.selector {
	display: flex;
	flex-direction: column;
	padding: 10px;
}

.selector input {
	padding: 5px;
	font-size: 16px;
	border: none;
	border-radius: 5px;
	outline: none;
	background-color: rgb(240, 240, 240);
	font-family: "Overpass", sans-serif;
}

.dialog-box-inner .selector-item {
	font-size: 18px !important;
}

.selector-item {
	padding: 5px;
	font-size: 16px;
	border-radius: 5px;
	cursor: pointer;
	margin-top: 8px;
	font-family: "Overpass", sans-serif;
	background-color: var(--color);
	color: var(--contrast);
	user-select: none;
	transition: 0.2s;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	transform: translate(0px, 0px);
}

.selector-item.selected {
	background-color: dodgerblue;
	color: white;
}

.selector-item > i {
	font-size: 20px;
	margin-right: 5px;
}

.selector-item:hover {
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
	transform: translate(0, -2px);
	background-color: #f5f5f5;
}

.selector-item:active {
	box-shadow: 0 0px 1px rgba(0, 0, 0, 0.2);
	transform: translate(0, 0px) scale(0.97);
}
</style>
