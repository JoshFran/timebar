// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import LitepieDatepicker from "litepie-datepicker";

import HelloWorld from "./components/HelloWorld.vue";
import Splash from "./components/Splash.vue";

import { createRouter, createWebHistory } from "vue-router";

import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBIaIfAXOgyg3C1W8drd5lZJnNBVulkYDc",
	authDomain: "timebar-xyz.firebaseapp.com",
	projectId: "timebar-xyz",
	storageBucket: "timebar-xyz.appspot.com",
	messagingSenderId: "626575089341",
	appId: "1:626575089341:web:c2fdb31b41b693b952e1d4",
	measurementId: "G-49HX705VBQ",
};

// Initialize Firebase
const fapp = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(fapp);
const auth = getAuth(fapp);

window.timebar = {
	auth,
	analytics,
	fapp,
};

const routes = [
	{ path: "/", component: Splash },
	{ path: "/app", component: HelloWorld },
];

const router = createRouter({
	// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
	history: createWebHistory(),
	routes, // short for `routes: routes`
});

import { createApp } from "vue";
import { MotionPlugin } from "@vueuse/motion";
import App from "./App.vue";

let app = createApp(App);
app.use(LitepieDatepicker);
app.use(MotionPlugin);
app.use(router);

app.mount("#app");
