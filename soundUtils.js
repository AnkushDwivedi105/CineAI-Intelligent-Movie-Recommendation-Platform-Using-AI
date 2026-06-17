const sounds = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
  hover: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
};

export const playSound = (type) => {
  try {
    // Create audio instance
    const audio = new Audio(sounds[type] || sounds.click);
    
    // Set a very subtle volume so it sounds "Normal"
    audio.volume = 0.3; 
    
    // Pre-load and play
    audio.load();
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Sound playback blocked by browser until user interaction.");
      });
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
