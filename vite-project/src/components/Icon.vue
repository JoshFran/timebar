<script setup>
import {
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
	Teleport
} from "vue";

import { filterIcon } from "../iconer.js";

const { icon } = defineProps({
	icon: String
});
</script>

<template>
	<i :class="filterIcon(icon) + ' fa-5x'">
		<slot></slot>
	</i>
</template>
