<script setup>
import {
	computed,
	defineComponent,
	onMounted,
	ref,
	defineEmits,
	Teleport,
} from "vue";

import { filterIcon, filterIconNoAlias } from "../iconer.js";

const { icon, noFilter } = defineProps({
	icon: String,
	noFilter: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<i
		:class="
			noFilter ? filterIconNoAlias(icon) : filterIcon(icon) + ' fa-5x'
		"
	>
		<slot></slot>
	</i>
</template>
