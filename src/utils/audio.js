// src/utils/audio.js

// Pre-create the audio objects so they are ready instantly
const audioCache = {
  click: new Audio('/sounds/click.mp3'),
  pageswap: new Audio('/sounds/pageswap.mp3'),
  close: new Audio('/sounds/close.mp3') 
};

export const playAudio = (path, volume = 0.4) => {
  // Determine which sound to play based on the string passed
  const key = path.includes('pageswap') ? 'pageswap' : 'click';
  const sound = audioCache[key];

  if (sound) {
    sound.currentTime = 0; // Snap to start so rapid clicks work
    sound.volume = volume;
    sound.play().catch(() => {
      /* Browser blocked until first user gesture */
    });
  }
};