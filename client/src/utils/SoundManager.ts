/**
 * SoundManager - Audio system for Havoc Speedway
 * Handles game sounds, music, and audio feedback with accessibility considerations
 */

export interface SoundConfig {
  volume: number;
  enabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface Sound {
  id: string;
  url: string;
  volume: number;
  loop: boolean;
  category: 'music' | 'sfx' | 'ui';
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private config: SoundConfig = {
    volume: 0.7,
    enabled: true,
    musicEnabled: true,
    sfxEnabled: true
  };
  private isInitialized = false;

  constructor() {
    this.loadConfig();
    this.setupAudioContext();
  }

  /**
   * Initialize the audio system (requires user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('SoundManager initialized');
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  /**
   * Load a sound file
   */
  async loadSound(sound: Sound): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const audio = new Audio(sound.url);
      audio.volume = sound.volume * this.config.volume;
      audio.loop = sound.loop;
      audio.preload = 'auto';

      // Handle loading errors gracefully
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load sound: ${sound.id}`, e);
      });

      // Wait for the audio to be ready
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      this.sounds.set(sound.id, audio);
    } catch (error) {
      console.warn(`Failed to load sound ${sound.id}:`, error);
    }
  }

  /**
   * Play a sound effect
   */
  async playSound(soundId: string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    if (!this.config.enabled || !this.isInitialized) return;

    const audio = this.sounds.get(soundId);
    if (!audio) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    try {
      // Clone the audio for overlapping sounds
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = (options.volume ?? audio.volume) * this.config.volume;
      audioClone.loop = options.loop ?? audio.loop;

      // Check if this is music or SFX and if it's enabled
      const soundCategory = this.getSoundCategory(soundId);
      if (soundCategory === 'music' && !this.config.musicEnabled) return;
      if (soundCategory === 'sfx' && !this.config.sfxEnabled) return;

      await audioClone.play();
    } catch (error) {
      console.warn(`Failed to play sound ${soundId}:`, error);
    }
  }

  /**
   * Stop a sound
   */
  stopSound(soundId: string): void {
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  stopAllSounds(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Update global volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(audio => {
      audio.volume = audio.volume * this.config.volume;
    });
    this.saveConfig();
  }

  /**
   * Toggle sound system
   */
  toggleSound(): void {
    this.config.enabled = !this.config.enabled;
    if (!this.config.enabled) {
      this.stopAllSounds();
    }
    this.saveConfig();
  }

  /**
   * Toggle music
   */
  toggleMusic(): void {
    this.config.musicEnabled = !this.config.musicEnabled;
    if (!this.config.musicEnabled) {
      this.sounds.forEach((audio, soundId) => {
        if (this.getSoundCategory(soundId) === 'music') {
          audio.pause();
        }
      });
    }
    this.saveConfig();
  }

  /**
   * Toggle sound effects
   */
  toggleSFX(): void {
    this.config.sfxEnabled = !this.config.sfxEnabled;
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): SoundConfig {
    return { ...this.config };
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('havoc-speedway-audio-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load audio config:', error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('havoc-speedway-audio-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save audio config:', error);
    }
  }

  /**
   * Setup audio context
   */
  private setupAudioContext(): void {
    // Setup audio context when user interacts with the page
    const initAudio = () => {
      this.initialize();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  /**
   * Determine sound category based on sound ID
   */
  private getSoundCategory(soundId: string): 'music' | 'sfx' | 'ui' {
    if (soundId.includes('music') || soundId.includes('theme') || soundId.includes('ambient')) {
      return 'music';
    }
    if (soundId.includes('ui') || soundId.includes('button') || soundId.includes('menu')) {
      return 'ui';
    }
    return 'sfx';
  }
}

// Game-specific sound definitions
export const GAME_SOUNDS: Sound[] = [
  // UI Sounds
  { id: 'ui-button-click', url: '/sounds/ui/button-click.mp3', volume: 0.6, loop: false, category: 'ui' },
  { id: 'ui-button-hover', url: '/sounds/ui/button-hover.mp3', volume: 0.4, loop: false, category: 'ui' },
  { id: 'ui-notification', url: '/sounds/ui/notification.mp3', volume: 0.7, loop: false, category: 'ui' },
  { id: 'ui-error', url: '/sounds/ui/error.mp3', volume: 0.8, loop: false, category: 'ui' },
  
  // Card Sounds
  { id: 'card-flip', url: '/sounds/cards/card-flip.mp3', volume: 0.5, loop: false, category: 'sfx' },
  { id: 'card-deal', url: '/sounds/cards/card-deal.mp3', volume: 0.6, loop: false, category: 'sfx' },
  { id: 'card-shuffle', url: '/sounds/cards/card-shuffle.mp3', volume: 0.7, loop: false, category: 'sfx' },
  { id: 'card-select', url: '/sounds/cards/card-select.mp3', volume: 0.5, loop: false, category: 'sfx' },
  
  // Game Stage Sounds
  { id: 'dealer-selection', url: '/sounds/stages/dealer-selection.mp3', volume: 0.8, loop: false, category: 'sfx' },
  { id: 'storm-start', url: '/sounds/stages/storm-start.mp3', volume: 0.9, loop: false, category: 'sfx' },
  { id: 'storm-thunder', url: '/sounds/stages/storm-thunder.mp3', volume: 0.7, loop: false, category: 'sfx' },
  { id: 'toxic-seven', url: '/sounds/stages/toxic-seven.mp3', volume: 0.8, loop: false, category: 'sfx' },
  { id: 'lane-selection', url: '/sounds/stages/lane-selection.mp3', volume: 0.8, loop: false, category: 'sfx' },
  { id: 'coin-flip', url: '/sounds/stages/coin-flip.mp3', volume: 0.7, loop: false, category: 'sfx' },
  { id: 'race-start', url: '/sounds/racing/race-start.mp3', volume: 0.9, loop: false, category: 'sfx' },
  
  // Racing Sounds
  { id: 'horse-gallop', url: '/sounds/racing/horse-gallop.mp3', volume: 0.6, loop: true, category: 'sfx' },
  { id: 'horse-neigh', url: '/sounds/racing/horse-neigh.mp3', volume: 0.7, loop: false, category: 'sfx' },
  { id: 'finish-line', url: '/sounds/racing/finish-line.mp3', volume: 0.9, loop: false, category: 'sfx' },
  { id: 'crowd-cheer', url: '/sounds/racing/crowd-cheer.mp3', volume: 0.8, loop: false, category: 'sfx' },
  
  // Ambient/Music
  { id: 'lobby-music', url: '/sounds/music/lobby-theme.mp3', volume: 0.4, loop: true, category: 'music' },
  { id: 'game-music', url: '/sounds/music/game-theme.mp3', volume: 0.3, loop: true, category: 'music' },
  { id: 'racing-music', url: '/sounds/music/racing-theme.mp3', volume: 0.5, loop: true, category: 'music' },
];

// Singleton instance
export const soundManager = new SoundManager();

// Helper functions for common game sounds
export const GameSounds = {
  // UI Feedback
  buttonClick: () => soundManager.playSound('ui-button-click'),
  buttonHover: () => soundManager.playSound('ui-button-hover'),
  notification: () => soundManager.playSound('ui-notification'),
  error: () => soundManager.playSound('ui-error'),
  
  // Card Actions
  cardFlip: () => soundManager.playSound('card-flip'),
  cardDeal: () => soundManager.playSound('card-deal'),
  cardShuffle: () => soundManager.playSound('card-shuffle'),
  cardSelect: () => soundManager.playSound('card-select'),
  
  // Game Events
  dealerSelection: () => soundManager.playSound('dealer-selection'),
  stormStart: () => soundManager.playSound('storm-start'),
  stormThunder: () => soundManager.playSound('storm-thunder'),
  toxicSeven: () => soundManager.playSound('toxic-seven'),
  laneSelection: () => soundManager.playSound('lane-selection'),
  coinFlip: () => soundManager.playSound('coin-flip'),
  raceStart: () => soundManager.playSound('race-start'),
  
  // Racing
  horseGallop: () => soundManager.playSound('horse-gallop', { loop: true }),
  horseNeigh: () => soundManager.playSound('horse-neigh'),
  finishLine: () => soundManager.playSound('finish-line'),
  crowdCheer: () => soundManager.playSound('crowd-cheer'),
  
  // Music
  playLobbyMusic: () => soundManager.playSound('lobby-music', { loop: true }),
  playGameMusic: () => soundManager.playSound('game-music', { loop: true }),
  playRacingMusic: () => soundManager.playSound('racing-music', { loop: true }),
  
  // Stop sounds
  stopMusic: () => {
    soundManager.stopSound('lobby-music');
    soundManager.stopSound('game-music');
    soundManager.stopSound('racing-music');
  },
  
  stopAllRacing: () => {
    soundManager.stopSound('horse-gallop');
    soundManager.stopSound('racing-music');
  }
};

export default soundManager;
