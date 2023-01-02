import icons from "./icons.js";

const alias = {
	browsing: "globe",
	internet: "globe",
	timebar: "hourglass-half",
	sleeping: "bed",
	sleep: "bed",
	eating: "utensils",
	eat: "utensils",
	drinking: "glass-martini",
	drink: "glass-martini",
	working: "briefcase",
	work: "briefcase",
	playing: "gamepad",
	play: "gamepad",
	game: "gamepad",
	gaming: "gamepad",
	reading: "book",
	read: "book",
	coding: "code",
	code: "code",
	studying: "graduation-cap",
	study: "graduation-cap",
	shopping: "shopping-cart",
	shop: "shopping-cart",
	cooking: "kitchen-set",
	cook: "utensils",
	cleaning: "broom",
	clean: "broom",
	running: "running",
	run: "running",
	walking: "walking",
	walk: "walking",
	swimming: "swimmer",
	swim: "swimmer",
	sitting: "chair",
	sit: "chair",
	hiking: "hiking",
	hike: "hiking",
	cycling: "bicycle",
	cycle: "bicycle",
	skiing: "skiing",
	ski: "skiing",
	outdoors: "tree",
	outdoor: "tree",
	brushing: "tooth",
	bath: "bath",
	washing: "sing",
	bathroom: "toilet",
	email: "envelope",
	phone: "phone",
	meeting: "phone",
	groceries: "shopping-basket",
	grocer: "shopping-basket",
	grocery: "shopping-basket",
	dishes: "hand-sparkles",
	admin: "file-invoice",
	administration: "file-invoice",
	learning: "question",
};

export function filterIcon(icon) {
	if (typeof icon === "undefined") {
		icon = "";
	}

	return (
		icons[alias[icon.toLowerCase()] || icon.toLowerCase()] ||
		"far fa-circle"
	);
}

export function filterIconNoAlias(icon) {
	if (typeof icon === "undefined") {
		icon = "";
	}

	return icons[icon.toLowerCase()] || "far fa-circle";
}
