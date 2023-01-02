const path = require("path");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,vue,tsx,jsx}",
		path.resolve(__dirname, "./node_modules/litepie-datepicker/**/*.js"),
	],
	darkMode: "class", // or 'media' or 'class'
	theme: {
		fontFamily: {
			sans: ["open-sans", "sans-serif"],
		},
		extend: {
			colors: {
				// Change with you want it
				"litepie-primary": { ...colors.sky, 500: "#77bbff" }, // color system for light mode
				"litepie-secondary": colors.coolGray, // color system for dark mode
			},
		},
	},
	variants: {
		extend: {
			cursor: ["disabled"],
			textOpacity: ["disabled"],
			textColor: ["disabled"],
		},
	},
	plugins: [],
};
