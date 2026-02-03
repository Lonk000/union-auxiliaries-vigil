<template>
  <div class="sidebar-page">
    <section class="sidebar-layout">
      <o-sidebar
        id="sidebar"
        position="static"
        :animate="animate"
        :mobile="mobile"
        :expand-on-hover="expandOnHover"
        :reduce="reduce"
        open>
        <router-link class="clipped-bottom-right" to="/status" @click="swapSound">
          <img src="/icons/orbital.svg" />
          <span>Status</span>
        </router-link>
        <router-link class="clipped-bottom-right" to="/pilots" @click="swapSound">
          <img src="/icons/pilot.svg" />
          <span>Pilots</span>
        </router-link>
        <router-link class="clipped-bottom-right" to="/events" @click="swapSound">
          <img src="/icons/events.svg" />
          <span>Logs</span>
        </router-link>
      </o-sidebar>
    </section>
  </div>
</template>

<script>
// IMPORT SOUND UTILITY
import { playAudio } from '@/utils/audio.js';

export default {
  props: {
    animate: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      expandOnHover: false,
      mobile: "reduced",
      reduce: false,
    };
  },
  methods: {
    swapSound() {
      playAudio('/sounds/pageswap.mp3', 0.3); // SOUND ADDED
    }
  }
};
</script>
