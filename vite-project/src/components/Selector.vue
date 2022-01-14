<script setup>
import { computed, defineComponent, onMounted, ref , defineEmits, Teleport } from 'vue'
import invert from 'invert-color'
import Icon from './Icon.vue'

const query = ref("")

const { modelValue, data } = defineProps({
	modelValue: String,
	data: Array
})
const emit = defineEmits([
	"update:modelValue"
])

const filtered = computed(() => {
	return data.filter(
		item => {
			if (!query.value) return true

			if (typeof item == "string") {
				return item.toLowerCase().includes(query.value.toLowerCase())
			}else{
				return item.name.toLowerCase().includes(query.value.toLowerCase())
			}
		}
	).slice(0, 35)
})

const root = ref(null)

function selectVal(item) {
	let event = new Event('closedialog', {
		bubbles: true
	});
	root.value.dispatchEvent(event);
	emit('update:modelValue', item)
}

</script>

<template>
	<div ref="root" class="selector">
		<input type="text" placeholder="Search" v-model="query" />
		<template v-for="item in filtered">
				<div @click="selectVal(item)">
					<slot :item="item">
							<div class="selector-item" :style="{'--color': item.color ? item.color : 'white', '--contrast': item.color ? invert(item.color, true) : 'black'}">
								{{typeof item == 'string' ? item : item.name}}
								<Icon :icon="typeof item == 'string' ? item : item.name" />
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
	font-family: 'Overpass', sans-serif;
}

.selector-item {
	padding: 5px;
	font-size: 16px;
	border-radius: 5px;
	cursor: pointer;
	margin-top: 8px;
	font-family: 'Overpass', sans-serif;
	background-color: var(--color);
	color: var(--contrast);
	user-select: none;
	transition: .2s;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	transform: translate(0px, 0px);
}

.selector-item > i {
	font-size: 20px;
	margin-right: 5px;
}

.selector-item:hover {
	box-shadow: 0 3px 6px rgba(0,0,0,.2);
	transform: translate(0, -2px);
}

.selector-item:active {
	box-shadow: 0 0px 1px rgba(0,0,0,.2);
	transform: translate(0, 0px) scale(0.97);
}

</style>