<script setup>
import { computed, defineComponent, onMounted, ref } from 'vue'
import { auth as authui } from "firebaseui";
import { GoogleAuthProvider, EmailAuthProvider, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const isUILoading = ref(true)
const isStateLoading = ref(true)
const isLoading = computed(() => {
	return isUILoading.value || isStateLoading.value
})

let emit = defineEmits([
	"setUser"
])

const isLoggedIn = ref(false)

onMounted(() => {
	const auth = window.timebar.auth;
	var ui = new authui.AuthUI(auth);
	console.log(auth);

	ui.start('#firebaseui-auth-container', {
		autoUpgradeAnonymousUsers: true,
		signInOptions: [
			GoogleAuthProvider.PROVIDER_ID,
			EmailAuthProvider.PROVIDER_ID
		],
		callbacks: {
			signInFailure(err) {
				console.log(err);
				isUILoading.value = false;
			},
			signInSuccessWithAuthResult: function (authResult, redirectUrl) {
				// User successfully signed in.
				// Return type determines whether we continue the redirect automatically
				// or whether we leave that to developer to handle.
				return true;
			},
			uiShown: function () {
				isUILoading.value = false;
			}
			//document.getElementById('loader').style.display = 'none';
		},

		signInFlow: 'popup',
		signInSuccessUrl: 'https://timebar.xyz',
		tosUrl: '',
		privacyPolicyUrl: ''
	});
})

onAuthStateChanged(window.timebar.auth, (user) => {
	isStateLoading.value = false
	if (user) {
		const uid = user.uid

		emit("setUser", user)
		isLoggedIn.value = true
	} else {
		emit("setUser", null)
		isLoggedIn.value = false
	}
});


function guestLogin() {
	isUILoading.value = true 
	const auth = window.timebar.auth;
	signInAnonymously(auth).then(function (result) {
		isUILoading.value = false
		// User is signed in.
		console.log(result);
		// ...
	}).catch(function (error) {
		isUILoading.value = false

	});
}

</script>

<template>
	<div id="auth-modal" :class="{'hide-modal': isLoggedIn}">
		<img
			class="login-logo"
			:class="{ 'logo-loading': isLoading }"
			alt="Timebar Logo"
			src="../assets/logo.svg"
			style="max-width: 200px;"
		/>
		<div>
			<div class="login-box" :class="{ 'shrink-login': isLoading || isLoggedIn }" id="firebaseui-auth-container">
			</div>
			<div v-if="!isLoading && !isLoggedIn" class="login-box-bottom">
				<div class="login-btn" @click="guestLogin()">
					Sign in later
					<i class="fas fa-arrow-right"></i>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#auth-modal.hide-modal {
	top: -170vh;
	pointer-events: none;
}

.login-btn {
	cursor: pointer;
	color: dodgerblue;
}

.login-box-bottom {
	transition: 0.3s;
	background-color: rgb(241, 241, 241);
	border-radius: 24px;
	padding: 20px;
	border-top-right-radius: 0px;
	border-top-left-radius: 0px;
}

.login-box {
	transition: 0.3s;
	background-color: white;
	border-radius: 24px;
	padding: 20px;
	margin-top: 30px;
	border-bottom-right-radius: 0px;
	border-bottom-left-radius: 0px;
}

.shrink-login {
	display: none;
	height: 0px;
	overflow: hidden;
}

.login-logo {
	transition: 3s;
	transform: scale(1) rotate(0deg);
}

.logo-loading {
	animation: spin 2s ease-in-out infinite forwards;
	transform: scale(0.5) rotate(0deg);
}

@keyframes spin {
	0% {
		transform: scale(0.5) rotate(0deg);
	}
	50% {
		transform: scale(1.1) rotate(180deg);
	}
	100% {
		transform: scale(0.5) rotate(360deg);
	}
}

#auth-modal {
	position: absolute;
	top: 0vh;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 100;
	background-color: rgb(69, 157, 225);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	transition: .5s;
}
</style>