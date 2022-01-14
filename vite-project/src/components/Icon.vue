<script setup>
import { computed, defineComponent, onMounted, ref , defineEmits, Teleport } from 'vue'
import icons from "../icons"

const { icon } = defineProps({
	icon: String
})


const alias = ref({
	"browsing": "globe",
	"internet": "globe",
	"timebar": "hourglass-half",
	"sleeping": "bed",
	"sleep": "bed",
	"eating": "utensils",
	"eat": "utensils",
	"drinking": "glass-martini",
	"drink": "glass-martini",
	"working": "briefcase",
	"work": "briefcase",
	"playing": "gamepad",
	"play": "gamepad",
	"game": "gamepad",
	"gaming": "gamepad",
	"reading": "book",
	"read": "book",
	"coding": "code",
	"code": "code",
	"studying": "graduation-cap",
	"study": "graduation-cap",
	"shopping": "shopping-cart",
	"shop": "shopping-cart",
	"cooking": "utensils",
	"cook": "utensils",
	"cleaning": "broom",
	"clean": "broom",
	"running": "running",
	"run": "running",
	"walking": "walking",
	"walk": "walking",
	"swimming": "swimmer",
	"swim": "swimmer",
	"sitting": "chair",
	"sit": "chair",
	"hiking": "hiking",
	"hike": "hiking",
	"cycling": "bicycle",
	"cycle": "bicycle",
	"skiing": "skiing",
	"ski": "skiing",
	"outdoors": "tree",
	"outdoor": "tree",
	"brushing": "tooth",
	"bath": "bath",
	"washing": "sing",
	"bathroom": "toilet",
	"email": "envelope",
	"phone": "phone",
	"meeting": "phone",
	"groceries": "shopping-basket",
	"grocer": "shopping-basket",
	"grocery": "shopping-basket",
	"dishes": "hand-sparkles",
	"admin": "file-invoice",
	"administration": "file-invoice",
	"learning": "question"
})

</script>

<template>
	<i :class="(icons[alias[icon.toLowerCase()] || icon.toLowerCase()] || 'far fa-circle') + ' fa-5x'">
	<slot></slot>
	</i>
</template>