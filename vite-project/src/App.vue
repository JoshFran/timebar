<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import Splash from "./components/Splash.vue";
import "./style.css";
</script>

<template>
	<!-- <img alt="Timebar Logo" src="./assets/logo.svg" style="max-width: 100px;"/> -->
	<!-- <HelloWorld msg="Timebar" /> -->
	<!-- <Splash /> -->
	<router-view></router-view>
</template>

<style>
/* @import "./style.css"; */
#app {
	font-family: Overpass, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin: 0px;
}

html,
body {
	height: 100%;
}
</style>
