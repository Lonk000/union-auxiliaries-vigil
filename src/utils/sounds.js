// src/utils/sounds.js

const createSFX = (fileName, volume = 0.4) => {
  // Points to your public/sounds/ folder
  const audio = new Audio(`/sounds/${fileName}`);
  audio.volume = volume;
  audio.preload = "auto";
  return audio;
};

const sfx = {
  // Sound for Missions, Pilots, and Mechs
  action: createSFX('click.mp3', 0.5),
  
  // Sound for Sidebar navigation
  sidebar: createSFX('pageswap.mp3', 0.3)
};

export const playSFX = (type) => {
  const sound = sfx[type];
  if (sound) {
    sound.currentTime = 0; // Allows rapid-fire clicking
    sound.play().catch(() => {
      // Prevents console errors if browser blocks autoplay
    });
  }
};
