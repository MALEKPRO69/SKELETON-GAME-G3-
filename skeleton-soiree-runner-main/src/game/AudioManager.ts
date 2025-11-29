class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private soundGain: GainNode | null = null;
  private isMusicPlaying = false;
  
  public musicEnabled = true;
  public soundEnabled = true;
  public musicVolume = 0.5;
  public soundVolume = 0.7;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init() {
    if (this.audioContext) return;
    
    this.audioContext = new AudioContext();
    this.musicGain = this.audioContext.createGain();
    this.soundGain = this.audioContext.createGain();
    
    this.musicGain.connect(this.audioContext.destination);
    this.soundGain.connect(this.audioContext.destination);
    
    this.musicGain.gain.value = this.musicVolume;
    this.soundGain.gain.value = this.soundVolume;

    // Generate all sounds
    await this.generateSounds();
  }

  private async generateSounds() {
    if (!this.audioContext) return;

    // Jump sound - quick upward sweep
    this.sounds.set('jump', this.createTone(220, 0.15, 'sine', 880));
    
    // Collect soul sound - magical chime
    this.sounds.set('collect', this.createChime([523, 659, 784], 0.3));
    
    // Enemy death sound - descending tone
    this.sounds.set('enemyDeath', this.createTone(440, 0.3, 'square', 110));
    
    // Player death sound
    this.sounds.set('death', this.createTone(200, 0.5, 'sawtooth', 50));
    
    // Level complete sound
    this.sounds.set('levelComplete', this.createChime([523, 659, 784, 1047], 0.8));
    
    // Background music
    this.sounds.set('music', this.createBackgroundMusic());
  }

  private createTone(startFreq: number, duration: number, type: OscillatorType, endFreq?: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const samples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const freq = endFreq ? startFreq + (endFreq - startFreq) * (t / duration) : startFreq;
      const envelope = Math.exp(-3 * t / duration);
      
      let sample = 0;
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * freq * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          sample = 2 * (freq * t % 1) - 1;
          break;
      }
      
      data[i] = sample * envelope * 0.3;
    }
    
    return buffer;
  }

  private createChime(frequencies: number[], duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const samples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      frequencies.forEach((freq, idx) => {
        const delay = idx * 0.08;
        if (t > delay) {
          const localT = t - delay;
          const envelope = Math.exp(-2 * localT);
          sample += Math.sin(2 * Math.PI * freq * localT) * envelope;
        }
      });
      
      data[i] = sample * 0.2 / frequencies.length;
    }
    
    return buffer;
  }

  private createBackgroundMusic(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 8; // 8 second loop
    const samples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Day of the Dead style melody
    const melody = [
      { freq: 293.66, start: 0, dur: 0.5 },    // D4
      { freq: 329.63, start: 0.5, dur: 0.5 },  // E4
      { freq: 349.23, start: 1, dur: 0.5 },    // F4
      { freq: 392, start: 1.5, dur: 0.5 },     // G4
      { freq: 440, start: 2, dur: 1 },         // A4
      { freq: 392, start: 3, dur: 0.5 },       // G4
      { freq: 349.23, start: 3.5, dur: 0.5 },  // F4
      { freq: 329.63, start: 4, dur: 1 },      // E4
      { freq: 293.66, start: 5, dur: 0.5 },    // D4
      { freq: 261.63, start: 5.5, dur: 0.5 },  // C4
      { freq: 293.66, start: 6, dur: 1 },      // D4
      { freq: 329.63, start: 7, dur: 1 },      // E4
    ];
    
    // Bass line
    const bass = [
      { freq: 146.83, start: 0, dur: 2 },   // D3
      { freq: 174.61, start: 2, dur: 2 },   // F3
      { freq: 196, start: 4, dur: 2 },      // G3
      { freq: 146.83, start: 6, dur: 2 },   // D3
    ];
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Add melody
      melody.forEach(note => {
        if (t >= note.start && t < note.start + note.dur) {
          const localT = t - note.start;
          const envelope = Math.sin(Math.PI * localT / note.dur);
          sample += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.15;
          // Add harmonics for richer sound
          sample += Math.sin(2 * Math.PI * note.freq * 2 * t) * envelope * 0.05;
        }
      });
      
      // Add bass
      bass.forEach(note => {
        if (t >= note.start && t < note.start + note.dur) {
          const localT = t - note.start;
          const envelope = Math.min(1, localT * 10) * Math.exp(-0.5 * localT);
          sample += Math.sin(2 * Math.PI * note.freq * t) * envelope * 0.2;
        }
      });
      
      // Add percussion (simple beat)
      const beatTime = t % 0.5;
      if (beatTime < 0.05) {
        sample += (Math.random() * 2 - 1) * (1 - beatTime / 0.05) * 0.1;
      }
      
      data[i] = sample;
    }
    
    return buffer;
  }

  playSound(name: string) {
    if (!this.audioContext || !this.soundEnabled || !this.soundGain) return;
    
    const buffer = this.sounds.get(name);
    if (!buffer) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.soundGain);
    source.start();
  }

  playMusic() {
    if (!this.audioContext || !this.musicEnabled || !this.musicGain || this.isMusicPlaying) return;
    
    const buffer = this.sounds.get('music');
    if (!buffer) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.musicSource = this.audioContext.createBufferSource();
    this.musicSource.buffer = buffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start();
    this.isMusicPlaying = true;
  }

  stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
    this.isMusicPlaying = false;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  setSoundVolume(volume: number) {
    this.soundVolume = volume;
    if (this.soundGain) {
      this.soundGain.gain.value = volume;
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (this.audioContext) {
      this.playMusic();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }
}

export default AudioManager;
