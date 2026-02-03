<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<div class="scanline"></div>
			<div class="boot-content">
				<div class="glitch-text">TERMINAL STANDBY</div>
				<div class="typewriter-container">
					<span class="system-status">>> UNION-VIGIL // OS_ENCRYPTED_V.2.0.1</span>
				</div>
				<button class="init-button" @click="initializeSystem">
					INITIALIZE MISSION BRIEFING
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
			// Audio context must be resumed/played within the user-click handler
			this.$nextTick(() => {
				const audio = this.$refs.startupSound;
				if (audio) {
					audio.volume = 0.6;
					audio.play().catch(e => console.warn("Audio blocked:", e));
				}
			});
			// Move the router logic here so it happens AFTER the click
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
						color: "#3CB043"
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
/* Global App Constraints */
#app {
	min-height: 100vh;
	overflow: hidden !important;
	background-color: black;
}

/* BOOT SCREEN */
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
	font-family: 'Courier New', Courier, monospace;
}

.boot-content {
	text-align: center;
	z-index: 2;
}

.glitch-text {
	color: #ffff00; /* Yellow from your site theme */
	font-size: 2.5rem;
	font-weight: bold;
	margin-bottom: 5px;
	letter-spacing: 8px;
	text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
}

/* Typewriter Effect Styling */
.typewriter-container {
	display: inline-block;
	margin-bottom: 50px;
}

.system-status {
	color: #3CB043; /* Green from your site theme */
	font-size: 0.9rem;
	overflow: hidden;
	border-right: .15em solid #3CB043;
	white-space: nowrap;
	margin: 0 auto;
	display: block;
	animation: 
		typing 3s steps(40, end),
		blink-caret .75s step-end infinite;
}

.init-button {
	background: transparent;
	color: #ffff00;
	border: 1px solid #ffff00;
	padding: 18px 36px;
	font-size: 1rem;
	font-family: inherit;
	cursor: pointer;
	text-transform: uppercase;
	transition: all 0.2s ease;
	letter-spacing: 2px;
}

.init-button:hover {
	background: rgba(255, 255, 0, 0.1);
	box-shadow: 0 0 20px rgba(255, 255, 0, 0.3);
	color: #fff;
	border-color: #fff;
}

/* Retro Scanline Layer */
.scanline {
	width: 100%;
	height: 100%;
	z-index: 1;
	background: linear-gradient(0deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 50%);
	background-size: 100% 4px;
	pointer-events: none;
	position: absolute;
}

/* Animations */
@keyframes typing {
	from { width: 0 }
	to { width: 100% }
}

@keyframes blink-caret {
	from, to { border-color: transparent }
	50% { border-color: #3CB043; }
}

.fade-leave-active {
	transition: opacity 1.2s ease;
}
.fade-leave-to {
	opacity: 0;
}
</style>
