<template>
	<transition name="fade">
		<div v-if="!isInitialized" class="boot-screen">
			<canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
			
			<div class="scanline"></div>
			
			<div class="terminal-container">
				<p class="boot-text line-1">VIGIL CORE BOOTLOADER v.4.0.1</p>
				<p class="boot-text line-2">MEMORY CHECK........................[ 65536 TB OK ]</p>
				<p class="boot-text line-3">INITIALIZING VIGIL_KERNEL_01......[ DONE ]</p>
				<p class="boot-text line-4">MOUNTING /DEV/SDA1 ON /ROOT.......[ OK ]</p>
				<p class="boot-text line-5">VERIFYING ENCRYPTED_VOLUMES.......[ VERIFIED ]</p>
				<p class="boot-text line-6">DETECTING COGNITIVE_HARDWARE.....[ NEURAL_LINK READY ]</p>
				<p class="boot-text line-7">SYNCING CELESTIAL_COORDINATES.....[ SYNCED ]</p>
				<p class="boot-text line-8">INITIALIZING OMNI_UPLINK........[ SIGNAL STABLE ]</p>
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
			<source src="/startup 1.mp3" type="audio/mpeg" />
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

			for (let i = 0; i < columns; i++) {
				drops[i] = Math.random() * -100;
			}

			if (this.matrixInterval) clearInterval(this.matrixInterval);

			const draw = () => {
				ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.fillStyle = "#81B2B3"; 
				ctx.font = fontSize + "px Roboto";

				for (let i = 0; i < drops.length; i++) {
					const text = letters.charAt(Math.floor(Math.random() * letters.length));
					ctx.globalAlpha = 0.12; 
					ctx.fillText(text, i * fontSize, drops[i] * fontSize);

					if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
						drops[i] = 0;
					}
					drops[i]++;
				}
				ctx.globalAlpha = 1.0;
			};

			this.matrixInterval = setInterval(draw, 35);
		},
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

.matrix-canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	pointer-events: none;
}

.terminal-container {
	flex: 1;
	text-align: left;
	z-index: 5;
}

.boot-text {
	color: #81B2B3;
	/* Increased from 0.8rem to 1.1rem (adjust as needed) */
	font-size: 1.2rem; 
	font-weight: 300;
	/* Increased spacing between lines for readability */
	margin-bottom: 8px; 
	overflow: hidden;
	white-space: nowrap;
	width: 0;
	text-shadow: 0 0 5px rgba(129, 178, 179, 0.4);
}

/* Fast-paced scrolling terminal sequence */
.line-1  { animation: typing 0.15s steps(30) 0.1s forwards; }
.line-2  { animation: typing 0.15s steps(30) 0.2s forwards; }
.line-3  { animation: typing 0.15s steps(30) 0.3s forwards; }
.line-4  { animation: typing 0.15s steps(30) 0.4s forwards; }
.line-5  { animation: typing 0.15s steps(30) 0.5s forwards; }
.line-6  { animation: typing 0.15s steps(30) 0.6s forwards; }
.line-7  { animation: typing 0.15s steps(30) 0.7s forwards; }
.line-8  { animation: typing 0.15s steps(30) 0.8s forwards; }
.line-9  { animation: typing 0.15s steps(30) 0.9s forwards; }
.line-10 { animation: typing 0.15s steps(30) 1.0s forwards; }
.line-11 { animation: typing 0.15s steps(30) 1.1s forwards; }
.line-12 { animation: typing 0.15s steps(30) 1.2s forwards; }
.line-13 { animation: typing 0.15s steps(30) 1.3s forwards; }
.line-14 { animation: typing 0.15s steps(30) 1.4s forwards; }
.line-15 { 
	color: #fff; 
	animation: typing 0.4s steps(40) 1.6s forwards; 
}

/* CENTERED LOGIN UI */
.login-ui {
	position: absolute;
	top: 55%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	opacity: 0;
	z-index: 20;
	/* Fades in after text block finishes */
	animation: fadeIn 1s ease forwards 2.0s;
}

.logo-wrap {
	position: relative;
	display: inline-block;
	margin-bottom: 10px;
}

.vigil-logo-img {
	width: 140px;
	display: block;
	filter: brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
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
