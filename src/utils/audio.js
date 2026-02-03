// src/utils/audio.js
export const playAudio = (path, volume = 0.4) => {
  const sound = new Audio(path);
  sound.volume = volume;
  // .catch prevents errors if the user hasn't interacted with the page yet
  sound.play().catch(() => {
    /* Silent fail to keep the console clean */
  });
};
