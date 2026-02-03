<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<div class="scanline"></div>
			
			<div class="terminal-container">
				<p class="boot-text line-1">VIGIL CORE BOOTLOADER v.4.0.1</p>
				<p class="boot-text line-2">MEMORY CHECK........................[ 65536 KB OK ]</p>
				<p class="boot-text line-3">INITIALIZING VIGIL_KERNEL_01......[ DONE ]</p>
				<p class="boot-text line-4">MOUNTING /DEV/SDA1 ON /ROOT.......[ OK ]</p>
				<p class="boot-text line-5">VERIFYING ENCRYPTED_VOLUMES.......[ VERIFIED ]</p>
				<p class="boot-text line-6">ESTABLISHING OMNI_UPLINK........[ SIGNAL STABLE ]</p>
				<p class="boot-text line-7">LOADING PILOT_INTERFACE_MODULE....[ SUCCESS ]</p>
				<p class="boot-text line-8">>> SYSTEM READY. AWAITING USER AUTHENTICATION...</p>
			</div>

			<div class="login-ui">
				<div class="logo-scanner-wrap">
					<img src="/faction-logos/vigil.svg" class="vigil-logo-img" alt="Vigil Logo" />
					<div class="scanning-bar"></div>
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

<script>
import Header from "./components/layout/Header.vue";
import Sidebar from "./components/layout/Sidebar.vue";
import Config from "@/assets/info/general-config.json";

export default {
	components: {
		Header,
		Sidebar,
	},

	data() {
		return {
			isInitialized: false,
			animate: Config.animate,
			initialSlug: Config.initialSlug,
			planetPath: Config.planetPath,
			header: Config.header,
			pilotSpecialInfo: Config.pilotSpecialInfo,
			clocks: [],
			events: [],
			missions: [],
			pilots: [],
			reserves: [],
			bonds: [],
		};
	},
	created() {
		this.setTitleFavicon(Config.defaultTitle + " MISSION BRIEFING", Config.icon);
		this.importMissions(import.meta.glob("@/assets/missions/*.md", { query: '?raw', import: 'default' }));
		this.importEvents(import.meta.glob("@/assets/events/*.md", { query: '?raw', import: 'default' }));
		this.importClocks(import.meta.glob("@/assets/clocks/*.json"));
		this.importReserves(import.meta.glob("@/assets/reserves/*.json"));
		this.importPilots(import.meta.glob("@/assets/pilots/*.json"));
	},
	methods: {
		initializeSystem() {
			this.isInitialized = true;
			this.$nextTick(() => {
				const audio = this.$refs.startupSound;
				if (audio) {
					audio.volume = 0.5;
					audio.play().catch(e => console.warn("Audio blocked:", e));
				}
			});
			this.$router.push("/status");
		},
		setTitleFavicon(title, favicon) {
			document.title = title;
			let headEl = document.querySelector('head');
			let faviconEl = document.createElement('link');
			faviconEl.setAttribute('rel', 'shortcut icon');
			faviconEl.setAttribute('href', favicon);
			headEl.appendChild(faviconEl);
		},
		async importMissions(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				let mission = {};
				mission["slug"] = content.split("\n")[0];
				mission["name"] = content.split("\n")[1];
				mission["status"] = content.split("\n")[2];
				mission["content"] = content.split("\n").splice(3).join("\n");
				this.missions = [...this.missions, mission];
			});
			this.missions = this.missions.sort((a, b) => b["slug"] - a["slug"]);
		},
		async importEvents(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				let event = {};
				event["title"] = content.split("\n")[0];
				event["location"] = content.split("\n")[1];
				event["time"] = content.split("\n")[2];
				event["thumbnail"] = content.split("\n")[3];
				event["content"] = content.split("\n").splice(4).join("\n");
				this.events = [...this.events, event];
			});
			this.events = this.events.reverse();
		},
		async importClocks(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				this.clocks = JSON.parse(JSON.stringify(content)).default;
			});
		},
		async importReserves(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				this.reserves = JSON.parse(JSON.stringify(content)).default;
			});
		},
		async importPilots(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				let pilotFromJson = JSON.parse(JSON.stringify(content));
				pilotFromJson.name = pilotFromJson.name.replace("※", "");
				pilotFromJson.callsign = pilotFromJson.callsign.replace("※", "");
				let pilotFromVue = this.pilotSpecialInfo[pilotFromJson.callsign.toUpperCase()];
				let pilot = { ...pilotFromJson, ...pilotFromVue };
				this.pilots = [...this.pilots, pilot];

				pilot.clocks.forEach(c => {
					this.clocks = [...this.clocks, {
						type: `Pilot Project // ${pilot.callsign}`,
						result: "",
						name: c.title,
						description: c.description,
						value: c.progress,
						max: c.segments,
						color: "#81B2B3" 
					}];
				});

				pilot.reserves.forEach(r => {
					this.reserves = [...this.reserves, {
						...r,
						callsign: pilot.callsign.toUpperCase()
					}];
				});
			});
		},
	},
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

#app {
	min-height: 100vh;
	overflow: hidden !important;
	background-color: black;
	font-family: 'Roboto', sans-serif;
}

/* BOOT SCREEN */
.boot-screen {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: #000;
	z-index: 10000;
	display: flex;
	flex-direction: column;
	padding: 40px;
	overflow: hidden;
}

.terminal-container {
	flex: 1;
	text-align: left;
}

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

/* CENTERED LOGIN UI */
.login-ui {
	position: absolute;
	top: 55%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	opacity: 0;
	animation: fadeIn 1s ease forwards 2.8s;
}

.logo-scanner-wrap {
	position: relative;
	display: inline-block;
	margin-bottom: 10px;
}

.vigil-logo-img {
	width: 140px;
	display: block;
	filter: brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

/* THE SCANNER EFFECT */
.scanning-bar {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 10px;
	background: linear-gradient(to bottom, transparent, rgba(129, 178, 179, 0.5), transparent);
	box-shadow: 0 0 15px rgba(129, 178, 179, 0.3);
	animation: scanMove 3s infinite linear;
}

@keyframes scanMove {
	0% { top: -10%; }
	100% { top: 110%; }
}

.vigil-os-title {
	color: #fff;
	font-size: 2.2rem;
	font-weight: 700;
	letter-spacing: 12px;
	margin-bottom: 40px;
	text-transform: uppercase;
}

.init-button {
	background: #1a2a2b;
	color: #81B2B3;
	border: 1px solid #81B2B3;
	padding: 15px 60px;
	font-size: 1rem;
	cursor: pointer;
	text-transform: uppercase;
	letter-spacing: 3px;
	transition: all 0.2s ease;
	clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}

.init-button:hover {
	background: #81B2B3;
	color: #000;
	box-shadow: 0 0 20px rgba(129, 178, 179, 0.4);
}

.scanline {
	width: 100%;
	height: 100%;
	z-index: 10;
	background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
	background-size: 100% 4px;
	pointer-events: none;
	position: absolute;
	top: 0;
	left: 0;
}

@keyframes typing { from { width: 0 } to { width: 100% } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.fade-leave-active { transition: opacity 1.2s ease; }
.fade-leave-to { opacity: 0; }
</style>
