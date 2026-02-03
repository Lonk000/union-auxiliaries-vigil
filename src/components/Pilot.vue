<template>
  <div class="grid-item pilot-identity" style="color:white!important">
    <div class="header">
      <div class="col grow-max">
        <div class="heading h1">{{ pilot.callsign }}</div>
        <div class="heading h2">({{ pilot.name }}) </div>
      </div>
      <div class="col"><img src="/faction-logos/vigil.svg"></div>
    </div>
    <div class="body">
      <div class="add-padding"> Union Administrative RM-4 Pilot Identification Protocol (IDENT) Record
        {{ pilot.id }} </div>
      <div class="flex-container-rows">
        <div class="row add-padding">
          {{ reverse(this.pilot.name) }}:{{ pilot.id }}//NDL-C-BLIND-REACH
        </div>
        <div class="row flex-container-cols add-padding">
          <div class="col grow-max flex-container-rows" style="padding-top:5px">
            <div class="row flex-container-cols">
              <div class="col col-primary"><span class="flavor-text"> Callsign: <b class="accent--text">{{
                capitalize(pilot.callsign) }}</b><br> Name (or legal alias): <b class="accent--text">{{ pilot.name
                    }}</b><br> Background: <b class="accent--text"> {{ pilot.background }} </b></span></div>
              <div class="col">CALLSIGN AVAILABLE <br> IDENTITY
                VERIFIED <br> PH/HR DATA REGISTERED</div>
            </div>
            <div style="padding-top:5px"> FRAME CONFIGURATION OPTIONS <span class="subtle--text">("H.A.S.E"
                OMNINET VAULT REMIT)</span></div>
            <div class="row" style="padding-top:5px"><span style="font-size: 22px; line-height: 15px;"> [
                HULL: <span class="stat-text accent--text" style="font-size: 24px;"> {{ pilot.mechSkills[0] }} </span>
                AGI: <span class="stat-text accent--text" style="font-size: 24px;"> {{ pilot.mechSkills[1] }} </span>
                SYS: <span class="stat-text accent--text" style="font-size: 24px;"> {{ pilot.mechSkills[2] }} </span>
                ENG: <span class="stat-text accent--text" style="font-size: 24px;"> {{ pilot.mechSkills[3] }} </span> ]
              </span></div>
            <div class="row flex-container-cols">
              <div class="col col-share">
                <span>PILOT SKILL TRIGGER AUDIT</span>
                <br>
                <div class="chip-container" v-for="skill in pilot.skills" :key="skill.id">
                  <span class="chip"><i aria-hidden="true" class="notranslate cci cci-skill"></i>{{ getSkill(skill)
                  }}</span>
                </div>
              </div>
              <div class="col col-share">
                <span>PILOT TALENT AUDIT</span>
                <br>
                <div class="chip-container" v-for="talent in pilot.talents" :key="talent.id">
                  <span class="chip"><i aria-hidden="true" class="notranslate cci cci-talent"></i>{{
                    getTalent(talent.id, talent.rank) }}</span>
                </div>
              </div>
            </div>
            <div v-if="pilot.level > 0" class="row flex-container-cols">
              <div class="col" style="padding-top:5px">
                <span>PROCUREMENT LICENSE AUDIT: LEVEL {{ pilot.level }}</span>
                <br>
                <div class="chip-container" v-for="license in pilot.licenses" :key="license.id">
                  <span class="chip"><i aria-hidden="true" class="notranslate cci cci-license"></i>{{
                    getLicense(license.id, license.rank) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="pilot-image-container">
              <div class="pilot-image-border">
                <img :src="pilotPortrait" class="portrait" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-container-cols modal-buttons">
        <div class="row biometrics-container">
          <div class="biometrics flex-container-cols" @click="pilotModal">
            <div>
              <i aria-hidden="true" class="v-icon notranslate mdi mdi-fingerprint theme--dark grey--text text--darken-2"
                style="font-size: 36px; margin-top:36px;"></i>
            </div>
            <div style="width:100%">
              BIOMETRIC RECORD VALID [[{{ randomNumber(14, 22) }}PB]]<br />
              OHM C//{{ timeStamp(pilot.lastModified) }}
            </div>
          </div>
        </div>
        <div class="row biometrics-container">
          <div class="mech-record flex-container-cols" @click="mechModal">
            <div style="width:100%">
              MECHANICAL BLUEPRINT VALID [[{{ randomNumber(14, 22) }}TB]] <br />
              {{ activeMech.manufacturer.toUpperCase() }}-{{ activeMech.frame_name.toUpperCase() }} :: "{{ activeMech.name.toUpperCase() }}"
            </div>
            <div>
              <i aria-hidden="true"
                class="v-icon notranslate cci cci-reserve-mech theme--dark grey--text text--darken-2 larger"
                style="font-size: 42px; margin-top:1em;"></i>
            </div>
          </div>
        </div>
      </div>
      <hr role="separator" aria-orientation="horizontal" class="ma-2 v-divider theme--dark">
      <div class="row row--dense"><span class="overline" style="line-height: 13px !important; opacity: 0.4;">
          Improper use of this IDENT record and/or its constituent data by the record holder or any other
          persons is punishable under the DoJ/HR A-645-c. This record is the property of the Union
          Administrative Office and the information herein must be transmitted on request under
          NDL-C-DISCORDANT-BREATH encryption protocols. This RM-4 record must be updated every five (5)
          Cradle
          Standard Years of objective time to retain GMS licensing rights. Far-field operatives that
          anticipate deployments lasting longer than five Cradle Standard Years that have not been issued
          a
          man-portable Omninet Hook should apply for the RM-11-B IDENT Supplemental (b) Extension. Contact
          your local Union Adminstrative Officer for any other matters regarding this
          record.  V-CDL//M-265-114-831 (A) </span></div>
    </div>
  </div>
</template>

<script>
import 'external-svg-loader'
import lancerData from '@massif/lancer-data'
import ktbData from 'lancer-ktb-data'
import nrfawData from 'lancer-nrfaw-data'
import longrimData from 'lancer-longrim-data'
import wallflowerData from '@/assets/LCPs/wallflower-data-2.0.5'

import PilotModal from '@/components/modals/PilotModal.vue'
import MechModal from '@/components/modals/MechModal.vue'
import Typer from '@/components/Typer.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import Burden from '@/components/Burden.vue'

// IMPORT SOUND UTILITY
import { playAudio } from '@/utils/audio.js'

export default {
  components: {
    Burden,
    ProgressBar,
    Typer,
  },
  props: {
    animate: { type: Boolean, required: true },
    pilot: { type: Object, required: true },
  },
  data() {
    return {
      activeMech: {},
      bond: {},
    }
  },
  computed: {
    pilotPortrait() { return `/pilots/${this.pilot.callsign.toUpperCase()}.webp` },
    pilotGear() { return [...lancerData.pilot_gear] },
    mechWeapons() { return [...lancerData.weapons, ...ktbData.weapons, ...nrfawData.weapons, ...longrimData.weapons] },
    mechSystems() { return [...lancerData.systems, ...ktbData.systems, ...nrfawData.systems, ...longrimData.systems] },
    talents() { return [...lancerData.talents, ...ktbData.talents, ...nrfawData.talents, ...longrimData.talents] },
    skills() { return [...lancerData.skills] },
    bonds() { return [...ktbData.bonds] },
    frames() { return [...lancerData.frames, ...ktbData.frames, ...nrfawData.frames, ...longrimData.frames] },
  },
  created() {
    this.getActiveMech();
    this.getBond();
  },
  methods: {
  pilotModal() {
    playAudio('/sounds/click.mp3', 0.5); // This fires the preloaded 'click' singleton
    this.$oruga.modal.open({
      component: PilotModal,
      custom: true,
      trapFocus: true,
      props: {
        pilot: this.pilot,
        talents: this.talents,
        skills: this.skills,
        frames: this.frames,
      },
      class: 'custom-modal',
      width: 1920,
    })
  },
  mechModal() {
    playAudio('/sounds/click.mp3', 0.5); // This fires the preloaded 'click' singleton
    this.$oruga.modal.open({
      component: MechModal,
      custom: true,
      trapFocus: true,
      props: {
        animate: this.animate,
        mech: this.activeMech,
        systemsData: this.mechSystems,
        weaponsData: this.mechWeapons,
        pilot: this.pilot,
      },
      class: 'custom-modal',
      width: 1920,
    })
  },
    // ... rest of your existing methods (getActiveMech, getBond, capitalize, etc.) remain unchanged
    getBond() { this.bond = this.bonds.find((obj) => obj.id === this.pilot.bondId) },
    getActiveMech() {
      const activeMechID = this.pilot.state.active_mech_id;
      const mech = this.pilot.mechs.find((obj) => obj.id === activeMechID);
      this.activeMech = mech ? mech : (this.pilot.mechs[0] || lancerData.frames.find((obj) => obj.id === 'missing_frame'));
      let frame = this.frames.find((obj) => obj.id === this.activeMech.frame) || lancerData.frames[0];
      this.activeMech.frame_description = frame.description;
      this.activeMech.frame_name = frame.name;
      this.activeMech.manufacturer = frame.source;
      this.activeMech.mechtype = frame.mechtype.join(' // ');
    },
    getSkill(skill) {
      let sk = this.skills.find((x) => x.id == skill.id);
      return sk.name + " +" + (skill.rank * 2)
    },
    getTalent(id, value) {
      let talent = this.talents.find((x) => x.id == id);
      let response = talent.name + " ";
      for (let i = 0; i < value; i++) { response += "I" }
      return response;
    },
    getLicense(id, value) {
      let frame = this.frames.find((x) => x.id == id);
      let response = frame.source + " " + frame.name + " ";
      for (let i = 0; i < value; i++) { response += "I" }
      return response;
    },
    capitalize(str) { return str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' '); },
    reverse(str) { return str.split(' ').reverse().join('.'); },
    randomNumber(max, min) { return Math.floor((Math.random() * (max - min) + min) * 100) / 100; },
    timeStamp(str) {
      let date = new Date(str);
      let y = date.getFullYear() + 2990;
      return new Date(y, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString();
    },
  },
}
</script>
