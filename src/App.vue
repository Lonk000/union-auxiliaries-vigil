<template>
  <transition name="fade">
    <div v-if="!isInitialized" class="boot-screen">
      <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
      <div class="scanline"></div>
      
      <div class="terminal-container">
        <p 
          v-for="(line, index) in bootLines" 
          :key="index"
          :class="['boot-text', `line-${index + 1}`]"
        >
          {{ line }}
        </p>
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
      bootLines: [
        "VIGIL CORE BOOTLOADER v.4.0.1",
        "MEMORY CHECK........................[ 65536_TB_OK ]",
        "INITIALIZING VIGIL_KERNEL_01......[ DONE ]",
        "MOUNTING /DEV/SDA1 ON /ROOT.......[ OK ]",
        "VERIFYING ENCRYPTED_VOLUMES.......[ VERIFIED ]",
        "DETECTING COGNITIVE_HARDWARE.....[ NEURAL_LINK_READY ]",
        "SYNCING CELESTIAL_COORDINATES.....[ SYNCED ]",
        "INITIALIZING OMNI_UPLINK........[ SIGNAL_STABLE ]",
        "PULSING OMNI_BUS_HANDSHAKE........[ ACKNOWLEDGED ]",
        "DECRYPTING_UI_ASSETS..............[ READY ]",
        "LOADING PILOT_INTERFACE_MODULE....[ SUCCESS ]",
        "CHECKING BIOMETRIC_CLEARANCE......[ CLEAR ]",
        "ESTABLISHING SECURE_TUNNEL.........[ ENCRYPTED ]",
        "REGISTERING SESSION_ID............[ #VGL-9928-X ]",
        ">> SYSTEM READY. AWAITING USER AUTHENTICATION..."
      ]
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
          audio.play().catch(() => {});
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
      };
      this.matrixInterval = setInterval(draw, 35);
    },
    setTitleFavicon(title, favicon) {
      document.title = title;
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
    async importMissions(files) {
      let filePromises = Object.keys(files).map(path => files[path]());
      let fileContents = await Promise.all(filePromises);
      this.missions = fileContents.map(content => {
        const lines = content.split("\n");
        return { slug: lines[0], name: lines[1], status: lines[2], content: lines.slice(3).join("\n") };
      }).sort((a, b) => b.slug - a.slug);
    },
    async importEvents(files) {
      let filePromises = Object.keys(files).map(path => files[path]());
      let fileContents = await Promise.all(filePromises);
      this.events = fileContents.map(content => {
        const lines = content.split("\n");
        return { title: lines[0], location: lines[1], time: lines[2], thumbnail: lines[3], content: lines.slice(4).join("\n") };
      }).reverse();
    },
    async importClocks(files) {
      let filePromises = Object.keys(files).map(path => files[path]());
      let fileContents = await Promise.all(filePromises);
      fileContents.forEach(content => { this.clocks = [...this.clocks, ...(content.default || content)]; });
    },
    async importReserves(files) {
      let filePromises = Object.keys(files).map(path => files[path]());
      let fileContents = await Promise.all(filePromises);
      fileContents.forEach(content => { this.reserves = [...this.reserves, ...(content.default || content)]; });
    },
    async importPilots(files) {
      let filePromises = Object.keys(files).map(path => files[path]());
      let fileContents = await Promise.all(filePromises);
      this.pilots = fileContents.map(content => {
        let p = content.default || content;
        p.name = p.name.replace("※", "");
        p.callsign = p.callsign.replace("※", "");
        return { ...p, ...(this.pilotSpecialInfo[p.callsign.toUpperCase()] || {}) };
      });
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

.boot-screen {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 10000;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.terminal-container {
  flex: 1;
}

.boot-text {
  font-family: 'Roboto', monospace !important;
  color: #81B2B3;
  font-size: 1rem;
  margin-bottom: 5px;
  opacity: 0;
  /* Use simple fade-in so the text is guaranteed to appear */
  animation: simpleFade 0.1s forwards;
}

/* Loop for line delays */
.line-1  { animation-delay: 0.1s; }
.line-2  { animation-delay: 0.2s; }
.line-3  { animation-delay: 0.3s; }
.line-4  { animation-delay: 0.4s; }
.line-5  { animation-delay: 0.5s; }
.line-6  { animation-delay: 0.6s; }
.line-7  { animation-delay: 0.7s; }
.line-8  { animation-delay: 0.8s; }
.line-9  { animation-delay: 0.9s; }
.line-10 { animation-delay: 1.0s; }
.line-11 { animation-delay: 1.1s; }
.line-12 { animation-delay: 1.2s; }
.line-13 { animation-delay: 1.3s; }
.line-14 { animation-delay: 1.4s; }
.line-15 { animation-delay: 1.6s; color: #fff; font-weight: bold; }

.login-ui {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0;
  animation: loginFade 0.6s ease forwards 2s;
}

.vigil-logo-img {
  width: 120px;
  filter: brightness(0) invert(1);
  margin-bottom: 20px;
}

.vigil-os-title {
  font-family: 'Roboto', sans-serif !important;
  color: #fff;
  font-size: 2.5rem;
  letter-spacing: 15px;
  margin: 0;
}

.vigil-os-subtitle {
  font-family: 'Roboto', sans-serif !important;
  color: #81B2B3;
  font-size: 0.9rem;
  letter-spacing: 5px;
  margin-bottom: 40px;
}

.init-button {
  font-family: 'Roboto', sans-serif !important;
  background: transparent;
  color: #81B2B3;
  border: 1px solid #81B2B3;
  padding: 15px 50px;
  font-size: 1.1rem;
  cursor: pointer;
  letter-spacing: 5px;
  transition: 0.3s;
  clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}

.init-button:hover {
  background: #81B2B3;
  color: #000;
}

@keyframes simpleFade {
  to { opacity: 1; }
}

@keyframes loginFade {
  from { opacity: 0; transform: translate(-50%, -48%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}

.matrix-canvas {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.3;
}
</style>
