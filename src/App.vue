<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
			<div class="scanline"></div>
			
			<div class="terminal-container">
				<p class="boot-text line-1">VIGIL CORE BOOTLOADER v.4.0.1</p>
				<p class="boot-text line-2">MEMORY CHECK........................[ 65536_TB_OK ]</p>
				<p class="boot-text line-3">INITIALIZING VIGIL_KERNEL_01......[ DONE ]</p>
				<p class="boot-text line-4">MOUNTING /DEV/SDA1 ON /ROOT.......[ OK ]</p>
				<p class="boot-text line-5">VERIFYING ENCRYPTED_VOLUMES.......[ VERIFIED ]</p>
				<p class="boot-text line-6">DETECTING COGNITIVE_HARDWARE.....[ NEURAL_LINK_READY ]</p>
				<p class="boot-text line-7">SYNCING CELESTIAL_COORDINATES.....[ SYNCED ]</p>
				<p class="boot-text line-8">INITIALIZING OMNI_UPLINK........[ SIGNAL_STABLE ]</p>
				<p class="boot-text line-9">PULSING OMNI_BUS_HANDSHAKE........[ ACKNOWLEDGED ]</p>
				<p class="boot-text line-10">DECRYPTING_UI_ASSETS..............[ READY ]</p>
				<p class="boot-text line-11">LOADING PILOT_INTERFACE_MODULE....[ SUCCESS ]</p>
				<p class="boot-text line-12">CHECKING BIOMETRIC_CLEARANCE......[ CLEAR ]</p>
				<p class="boot-text line-13">ESTABLISHING SECURE_TUNNEL.........[ ENCRYPTED ]</p>
				<p class="boot-text line-14">REGISTERING SESSION_ID............[ #VGL-9928-X ]</p>
				<p class="boot-text line-15">>> SYSTEM READY. AWAITING USER AUTHENTICATION...</p>
			</div>

			<div class="login-ui">
				<div class="logo-wrap">
					<img src="/faction-logos/vigil.svg" class="vigil-logo-img" alt="Vigil Logo" />
				</div>
				<h1 class="vigil-os-title">VIGIL OS</h1>
				<h2 class="vigil-os-subtitle">Vanguard Initiative for Galactic Intervention and Logistics</h2>
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
		<svg style="visibility: hidden; position: absolute" width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
			<defs>
				<filter id="round">
					<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
					<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -5" result="goo" />
					<feComposite in="SourceGraphic" in2="goo" operator="atop" />
				</filter>
			</defs>
		</svg>
		<audio ref="startupSound">
			<source src="/sounds/startup 1.mp3" type="audio/mpeg" />
		</audio>
	</div>
</template>

<script>
import Header from "./components/layout/Header.vue";
import Sidebar from "./components/layout/Sidebar.vue";
import Config from "@/assets/info/general-config.json";

export default {
	components: { Header, Sidebar },
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
			matrixInterval: null,
		};
	},
	mounted() {
		this.initMatrix();
		window.addEventListener('resize', this.initMatrix);
	},
	beforeUnmount() {
		clearInterval(this.matrixInterval);
		window.removeEventListener('resize', this.initMatrix);
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
		initMatrix() {
			const canvas = this.$refs.matrixCanvas;
			if (!canvas) return;
			const ctx = canvas.getContext('2d');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			const letters = "01ABCDEF<>[]{}/\\|+=*&^%$#@!";
			const fontSize = 14;
			const columns = canvas.width / fontSize;
			const drops = [];
			for (let i = 0; i < columns; i++) { drops[i] = Math.random() * -100; }
			if (this.matrixInterval) clearInterval(this.matrixInterval);
			const draw = () => {
				ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = "#81B2B3"; 
				ctx.font = fontSize + "px Roboto, monospace";
				for (let i = 0; i < drops.length; i++) {
					const text = letters.charAt(Math.floor(Math.random() * letters.length));
					ctx.globalAlpha = 0.12; 
					ctx.fillText(text, i * fontSize, drops[i] * fontSize);
					if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) { drops[i] = 0; }
					drops[i]++;
				}
				ctx.globalAlpha = 1.0;
			};
			this.matrixInterval = setInterval(draw, 35);
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
			let tempMissions = [];
			fileContents.forEach(content => {
				let mission = {};
				const lines = content.split("\n");
				mission["slug"] = lines[0];
				mission["name"] = lines[1];
				mission["status"] = lines[2];
				mission["content"] = lines.slice(3).join("\n");
				tempMissions.push(mission);
			});
			this.missions = tempMissions.sort((a, b) => b["slug"] - a["slug"]);
		},
		async importEvents(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			let tempEvents = [];
			fileContents.forEach(content => {
				let event = {};
				const lines = content.split("\n");
				event["title"] = lines[0];
				event["location"] = lines[1];
				event["time"] = lines[2];
				event["thumbnail"] = lines[3];
				event["content"] = lines.slice(4).join("\n");
				tempEvents.push(event);
			});
			this.events = tempEvents.reverse();
		},
		async importClocks(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				this.clocks = [...this.clocks, ...(content.default || content)];
			});
		},
		async importReserves(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			fileContents.forEach(content => {
				this.reserves = [...this.reserves, ...(content.default || content)];
			});
		},
		async importPilots(files) {
			let filePromises = Object.keys(files).map(path => files[path]());
			let fileContents = await Promise.all(filePromises);
			let tempPilots = [];
			fileContents.forEach(content => {
				let pilotFromJson = content.default || content;
				pilotFromJson.name = pilotFromJson.name.replace("※", "");
				pilotFromJson.callsign = pilotFromJson.callsign.replace("※", "");
				let pilotFromVue = this.pilotSpecialInfo[pilotFromJson.callsign.toUpperCase()] || {};
				let pilot = { ...pilotFromJson, ...pilotFromVue };
				tempPilots.push(pilot);
				if (pilot.clocks) {
					pilot.clocks.forEach(c => {
						this.clocks = [...this.clocks, {
							type: `Pilot Project // ${pilot.callsign}`,
							name: c.title,
							description: c.description,
							value: c.progress,
							max: c.segments,
							color: "#81B2B3" 
						}];
					});
				}
			});
			this.pilots = tempPilots;
		}
	}
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

#app {
	background: #000;
	font-family: 'Roboto', sans-serif;
}

.boot-screen {
	position: fixed;
	inset: 0;
	background: #000;
	z-index: 10000;
	display: flex;
	flex-direction: column;
	padding: 40px;
}

.terminal-container {
	position: relative;
	z-index: 5;
}

.boot-text {
	font-family: 'Roboto', monospace !important;
	color: #81B2B3;
	font-size: 1rem; 
	font-weight: 300;
	margin-bottom: 6px; 
	white-space: nowrap;
	overflow: hidden;
	width: 0;
	/* The "forwards" ensures it stays at 100% width after animating */
	animation: typing 0.4s steps(40) forwards;
}

/* Hard-coded delays to ensure they fire in sequence */
.line-1  { animation-delay: 0.1s; }
.line-2  { animation-delay: 0.3s; }
.line-3  { animation-delay: 0.5s; }
.line-4  { animation-delay: 0.7s; }
.line-5  { animation-delay: 0.9s; }
.line-6  { animation-delay: 1.1s; }
.line-7  { animation-delay: 1.3s; }
.line-8  { animation-delay: 1.5s; }
.line-9  { animation-delay: 1.7s; }
.line-10 { animation-delay: 1.9s; }
.line-11 { animation-delay: 2.1s; }
.line-12 { animation-delay: 2.3s; }
.line-13 { animation-delay: 2.5s; }
.line-14 { animation-delay: 2.7s; }
.line-15 { animation-delay: 3.0s; color: #fff; font-weight: 700; }

.login-ui {
	position: absolute;
	top: 55%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	z-index: 20;
	opacity: 0;
	animation: fadeIn 0.8s ease forwards 3.5s;
}

.vigil-logo-img {
	width: 120px;
	filter: brightness(0) invert(1);
	margin-bottom: 15px;
}

.vigil-os-title {
	font-family: 'Roboto', sans-serif;
	color: #fff;
	font-size: 2rem;
	letter-spacing: 10px;
	margin: 5px 0;
}

.vigil-os-subtitle {
	font-family: 'Roboto', sans-serif;
	color: #81B2B3;
	font-size: 0.8rem;
	letter-spacing: 4px;
	margin-bottom: 30px;
}

.init-button {
	font-family: 'Roboto', sans-serif !important;
	background: transparent;
	color: #81B2B3;
	border: 1px solid #81B2B3;
	padding: 12px 50px;
	font-size: 1rem;
	cursor: pointer;
	letter-spacing: 3px;
	transition: 0.3s;
	/* Clip path for that Sci-Fi look */
	clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}

.init-button:hover {
	background: #81B2B3;
	color: #000;
	box-shadow: 0 0 15px rgba(129, 178, 179, 0.5);
}

@keyframes typing { 
	from { width: 0; } 
	to { width: 100%; } 
}

@keyframes fadeIn { 
	from { opacity: 0; transform: translate(-50%, -45%); } 
	to { opacity: 1; transform: translate(-50%, -50%); } 
}

.fade-leave-active { transition: opacity 0.5s; }
.fade-leave-to { opacity: 0; }
</style>
