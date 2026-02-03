// src/utils/audio.js

// Pre-load the sounds into memory
const sounds = {
  click: new Audio('/sounds/click.mp3'),
  pageswap: new Audio('/sounds/pageswap.mp3')
};

// Set volumes and preload attributes
Object.values(sounds).forEach(s => {
  s.preload = 'auto';
  s.load();
});

export const playAudio = (key, volume = 0.4) => {
  const sound = sounds[key];
  if (!sound) return;

  // KEY FIX: Reset the playhead to 0 so it can "re-trigger" instantly
  // even if the previous sound hasn't finished.
  sound.pause();
  sound.currentTime = 0;
  
  sound.volume = volume;
  sound.play().catch(() => {});
};
