export function formatTime(t) {
	let dec = t - Math.floor(t);
	return `${Math.floor(t)}:${Math.round(dec * 60)
		.toString()
		.padStart(2, "0")}`;
}

export function formatSeconds(s) {
	if (s >= 60 * 60 * 24) {
		return (s / (60 * 60 * 24)).toFixed(1) + "d";
	} else if (s >= 60 * 60) {
		return (
			formatTime(s / (60 * 60)) + ":" + formatTime(s / 60).split(":")[1]
		); //(s / (60 * 60)).toFixed(1) + "h"
	} else if (s >= 60) {
		return formatTime(s / 60); //Math.round((s / 60 * 10)) / 10 + "m"
	} else {
		return Math.floor(s) + "s";
	}
}
