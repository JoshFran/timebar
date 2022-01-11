<script setup>
import { computed, defineComponent, onMounted, ref , defineEmits } from 'vue'

const colors = ref([
	"#f44336",
	"#ff9800",
	"#ffeb3b",
	"#8bc34a",
	"#2196f3",
	"#673ab7",
	"#9c27b0",
	"#682626",
	"#000000",
	"#ffffff",
	"#7a7a7a",
])
const { modelValue } = defineProps({
	modelValue: String
})
const emit = defineEmits([
	"update:modelValue"
])

const open = ref(false)

function doSelect(color) {
	if (open.value) {
		emit('update:modelValue', color)
		open.value = false
	}else{
		open.value = true
	}
}

</script>

<template>
	<div class="color-box" :class="{open: open}">
		<template v-for="(color, i) in colors" :key="color">
			<div class="color-box-color" @click="doSelect(color)"
				:style="{'background-color': color, '--index': i}"
				:class="{'active': color === modelValue}"
			></div>
		</template>
	</div>
</template>

<style scoped>
.color-box {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	width: 50px;
	height: 50px;
	position: relative;
	background-color: white;
	border-radius: 12px;
}

.color-box-color.active {
	z-index: 16;
	transform: scale(1.06);
}

.color-box-color {
	width: 30px;
	height: 30px;
	cursor: pointer;
	border-radius: 6px;
	position: absolute;
	top: 10px;
	left: 10px;
	transition: .3s;
}

.color-box.open .color-box-color {
	transition: .3s cubic-bezier(0.165, 0.84, 0.44, 1);
	top: calc(var(--index) * -40px + 10px);
	
	z-index: calc(15 - var(--index));
	left: 10px;
	box-shadow: 0px 3px 6px rgba(0, 0, 0, .3);
}


.color-box-color:hover {
	transform: scale(1.2);
}

@media (max-width: 900px) {
	.color-box-color {
		width: 46px;
		height: 46px;
		top: 2px;
		left: 2px;
	}

	.color-box.open .color-box-color {
		top: calc(var(--index) * -60px + 2px);
		left: 2px;
		border-radius: 40px;
	}
}
</style>