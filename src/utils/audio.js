// src/utils/audio.js
const audioCache = {
  click: new Audio('/sounds/click.mp3'),
  pageswap: new Audio('/sounds/pageswap.mp3'),
  close: new Audio('/sounds/close.mp3') // Make sure this file exists in public/sounds/
};

export const playAudio = (keyOrPath, volume = 0.4) => {
  // 1. Try to find by exact key (e.g., 'close', 'click')
  // 2. Fallback: check if the path string contains a keyword
  let sound = audioCache[keyOrPath];
  
  if (!sound) {
    if (keyOrPath.includes('pageswap')) sound = audioCache.pageswap;
    else if (keyOrPath.includes('close')) sound = audioCache.close;
    else sound = audioCache.click;
  }

  if (sound) {
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch(() => {});
  }
};