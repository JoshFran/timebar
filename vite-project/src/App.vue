<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import Splash from "./components/Splash.vue";
</script>

<template>
	<!-- <img alt="Timebar Logo" src="./assets/logo.svg" style="max-width: 100px;"/> -->
	<!-- <HelloWorld msg="Timebar" /> -->
	<!-- <Splash /> -->
	<router-view></router-view>
</template>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin: 0px;
}
</style>
