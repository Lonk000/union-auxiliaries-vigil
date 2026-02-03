<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<div class="data-stream">
				<div class="stream-column" v-for="n in 10" :key="n" :style="{ left: (n*10) + '%', animationDelay: (n*0.5) + 's' }">
					010110101101011010110101101011010110101101011010110101101011010110
				</div>
			</div>

			<div class="scanline"></div>
			
			<div class="terminal-container">
				<p class="boot-text line-1">VIGIL CORE BOOTLOADER v.4.0.1</p>
				<p class="boot-text line-2">MEMORY CHECK........................[ 65536 KB OK ]</p>
				<p class="boot-text line-3">INITIALIZING VIGIL_KERNEL_01......[ DONE ]</p>
				<p class="boot-text line-4">MOUNTING /DEV/SDA1 ON /ROOT.......[ OK ]</p>
				<p class="boot-text line-5">VERIFYING ENCRYPTED_VOLUMES.......[ VERIFIED ]</p>
				<p class="boot-text line-6">ESTABLISHING SARTAI_UPLINK........[ SIGNAL STABLE ]</p>
				<p class="boot-text line-7">LOADING PILOT_INTERFACE_MODULE....[ SUCCESS ]</p>
				<p class="boot-text line-8">>> SYSTEM READY. AWAITING USER AUTHENTICATION...</p>
			</div>

			<div class="login-ui">
				<div class="hud-bracket top-left"></div>
				<div class="hud-bracket top-right"></div>
				<div class="hud-bracket bottom-left"></div>
				<div class="hud-bracket bottom-right"></div>

				<div class="logo-wrap">
					<img src="/faction-logos/vigil.svg" class="vigil-logo-img glitch-reveal" alt="Vigil Logo" />
				</div>
				
				<h1 class="vigil-os-title">VIGIL OS</h1>
				<button class="init-button" @click="initializeSystem">
					LOG IN
				</button>
			</div>
		</div>
	</transition>

	<div v-if="isInitialized" class="app-interface">
		<div class="page-wrapper">
			<Header :planet-path="planetPath" :class="{ animate: animate }" :header="header" />
			<Sidebar :animate="animate" :class="{ animate: animate }" />
		</div>
		<div id="router-view-container">
			<router-view :animate="animate" :initial-slug="initialSlug" :missions="missions" :events="events"
				:pilots="pilots" :clocks="clocks" :reserves="reserves" />
		</div>
		<svg style="visibility: hidden; position: absolute" width="0" height="0" xmlns="http://www.w3.org/2000/svg"
			version="1.1">
			<defs>
				<filter id="round">
					<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
					<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -5"
						result="goo" />
					<feComposite in="SourceGraphic" in2="goo" operator="atop" />
				</filter>
			</defs>
		</svg>
		<audio ref="startupSound">
			<source src="/startup.ogg" type="audio/ogg" />
		</audio>
	</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

#app {
	min-height: 100vh;
	background-color: black;
	font-family: 'Roboto', sans-serif;
}

.boot-screen {
	position: fixed;
	top: 0; left: 0;
	width: 100vw; height: 100vh;
	background: #000;
	z-index: 10000;
	display: flex;
	flex-direction: column;
	padding: 40px;
}

/* --- EFFECT 1: DATA STREAM BACKGROUND --- */
.data-stream {
	position: absolute;
	top: 0; left: 0; width: 100%; height: 100%;
	overflow: hidden;
	opacity: 0.05; /* Keep it very subtle */
	pointer-events: none;
}
.stream-column {
	position: absolute;
	top: -100%;
	color: #81B2B3;
	font-size: 10px;
	writing-mode: vertical-rl;
	animation: streamFall 10s linear infinite;
}
@keyframes streamFall {
	to { transform: translateY(200%); }
}

/* --- TERMINAL TEXT --- */
.boot-text {
	color: #81B2B3;
	font-size: 0.8rem;
	font-weight: 300;
	margin-bottom: 4px;
	overflow: hidden;
	white-space: nowrap;
	width: 0;
}
.line-1 { animation: typing 0.3s steps(40) 0.1s forwards; }
.line-2 { animation: typing 0.3s steps(40) 0.4s forwards; }
.line-3 { animation: typing 0.3s steps(40) 0.7s forwards; }
.line-4 { animation: typing 0.3s steps(40) 1.0s forwards; }
.line-5 { animation: typing 0.3s steps(40) 1.3s forwards; }
.line-6 { animation: typing 0.3s steps(40) 1.6s forwards; }
.line-7 { animation: typing 0.3s steps(40) 1.9s forwards; }
.line-8 { color: #fff; animation: typing 0.5s steps(40) 2.2s forwards; }

/* --- EFFECT 2: HUD BRACKETS --- */
.login-ui {
	position: absolute;
	top: 55%; left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	padding: 60px;
	opacity: 0;
	animation: fadeIn 1s ease forwards 2.8s;
}
.hud-bracket {
	position: absolute;
	width: 30px; height: 30px;
	border: 1px solid #81B2B3;
	opacity: 0.4;
}
.top-left { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.top-right { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bottom-left { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.bottom-right { bottom: 0; right: 0; border-left: 0; border-top: 0; }

/* --- EFFECT 3: LOGO GLITCH --- */
.vigil-logo-img {
	width: 140px;
	filter: brightness(0) invert(1);
	margin-bottom: 10px;
}
.glitch-reveal {
	animation: glitchInit 0.4s cubic-bezier(.25,.46,.45,.94) 2.8s both;
}
@keyframes glitchInit {
	0% { transform: translate(0); opacity: 0; }
	20% { transform: translate(-5px, 5px); opacity: 1; }
	40% { transform: translate(-5px, -5px); }
	60% { transform: translate(5px, 5px); }
	80% { transform: translate(5px, -5px); }
	100% { transform: translate(0); opacity: 1; }
}

.vigil-os-title {
	color: #fff;
	font-size: 2.2rem;
	letter-spacing: 12px;
	margin-bottom: 40px;
}

.init-button {
	background: #1a2a2b;
	color: #81B2B3;
	border: 1px solid #81B2B3;
	padding: 15px 60px;
	cursor: pointer;
	text-transform: uppercase;
	clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}
.init-button:hover {
	background: #81B2B3;
	color: #000;
	box-shadow: 0 0 20px rgba(129, 178, 179, 0.4);
}

.scanline {
	width: 100%; height: 100%;
	z-index: 10;
	background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
	background-size: 100% 4px;
	pointer-events: none;
	position: absolute;
	top: 0; left: 0;
}

@keyframes typing { from { width: 0 } to { width: 100% } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.fade-leave-active { transition: opacity 1s ease-in-out; }
.fade-leave-to { opacity: 0; }
</style>
