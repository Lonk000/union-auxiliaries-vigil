<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<div class="scanline"></div>
			<div class="boot-content">
				<img src="/faction-logos/vigil.svg" class="vigil-logo-img" alt="VIGIL OS Logo" />
				<div class="vigil-os-title">VIGIL OS</div>
				
				<div class="terminal-box">
					<p class="typewriter-text line-1">>> KERNEL_LOAD_SUCCESSFUL [OK]</p>
					<p class="typewriter-text line-2">>> MOUNTING VIRTUAL_FILESYSTEM... [DONE]</p>
					<p class="typewriter-text line-3">>> DECRYPTING_USER_PROFILE...</p>
					<p class="typewriter-text line-4">>> SYSTEM_READY</p>
				</div>

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
/* Font import adjusted to Vermin Vibes found in repo assets */
@font-face {
	font-family: 'VigilFont';
	src: url('@/assets/fonts/Vermin Vibes.ttf') format('truetype');
}

#app {
	min-height: 100vh;
	overflow: hidden !important;
	background-color: black;
}

/* OS STARTUP SCREEN */
.boot-screen {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: #000;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 10000;
	font-family: 'VigilFont', 'Courier New', monospace;
}

.vigil-logo-img {
	width: 120px;
	height: auto;
	margin-bottom: 10px;
	filter: drop-shadow(0 0 10px rgba(129, 178, 179, 0.5));
}

.vigil-os-title {
	color: #fff;
	font-size: 3.5rem;
	letter-spacing: 12px;
	margin-bottom: 30px;
	text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.terminal-box {
	text-align: left;
	width: 320px;
	margin-bottom: 50px;
}

.typewriter-text {
	color: #81B2B3; /* Tactical Teal */
	font-size: 0.8rem;
	overflow: hidden;
	white-space: nowrap;
	width: 0;
}

/* Sequence Staging */
.line-1 { animation: typing 0.6s steps(30, end) 0.2s forwards; }
.line-2 { animation: typing 0.6s steps(30, end) 0.8s forwards; }
.line-3 { animation: typing 0.6s steps(30, end) 1.4s forwards; }
.line-4 { 
    color: #fff;
    animation: typing 0.6s steps(30, end) 2.0s forwards, blink-caret 0.8s step-end infinite;
    border-right: 0.15em solid #fff;
}

.init-button {
	background: #1a2a2b;
	color: #81B2B3;
	border: 1px solid #81B2B3;
	padding: 15px 50px;
	font-size: 1rem;
	font-family: inherit;
	cursor: pointer;
	text-transform: uppercase;
	transition: all 0.2s ease;
	/* Mirrors the angled containers in the Vigil UI */
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
	z-index: 1;
	background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%);
	background-size: 100% 4px;
	pointer-events: none;
	position: absolute;
}

@keyframes typing {
	from { width: 0 }
	to { width: 100% }
}

@keyframes blink-caret {
	from, to { border-color: transparent }
	50% { border-color: #fff; }
}

.fade-leave-active { transition: opacity 1.2s ease-in-out; }
.fade-leave-to { opacity: 0; }
</style>
