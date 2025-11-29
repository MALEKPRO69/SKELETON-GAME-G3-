import { useState, useEffect } from 'react';
import { GameScreen } from '@/game/types';
import { ArrowLeft, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import AudioManager from '@/game/AudioManager';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsScreenProps {
  onScreenChange: (screen: GameScreen) => void;
}

export default function SettingsScreen({ onScreenChange }: SettingsScreenProps) {
  const audio = AudioManager.getInstance();
  
  const [musicEnabled, setMusicEnabled] = useState(audio.musicEnabled);
  const [soundEnabled, setSoundEnabled] = useState(audio.soundEnabled);
  const [musicVolume, setMusicVolume] = useState(audio.musicVolume * 100);
  const [soundVolume, setSoundVolume] = useState(audio.soundVolume * 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onScreenChange('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScreenChange]);

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    audio.setMusicEnabled(enabled);
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    audio.setSoundEnabled(enabled);
  };

  const handleMusicVolume = (value: number[]) => {
    const vol = value[0];
    setMusicVolume(vol);
    audio.setMusicVolume(vol / 100);
  };

  const handleSoundVolume = (value: number[]) => {
    const vol = value[0];
    setSoundVolume(vol);
    audio.setSoundVolume(vol / 100);
    // Play a test sound
    audio.playSound('collect');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onScreenChange('menu')}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="game-title text-4xl text-primary">Settings</h1>
        </div>

        {/* Settings card */}
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-8">
          {/* Music Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {musicEnabled ? (
                  <Music className="w-6 h-6 text-primary" />
                ) : (
                  <Music2 className="w-6 h-6 text-muted-foreground" />
                )}
                <span className="text-lg font-ui text-foreground">Music</span>
              </div>
              <Switch
                checked={musicEnabled}
                onCheckedChange={handleMusicToggle}
              />
            </div>
            
            {musicEnabled && (
              <div className="pl-9">
                <Slider
                  value={[musicVolume]}
                  onValueChange={handleMusicVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">{Math.round(musicVolume)}%</p>
              </div>
            )}
          </div>

          {/* Sound Effects Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-secondary" />
                ) : (
                  <VolumeX className="w-6 h-6 text-muted-foreground" />
                )}
                <span className="text-lg font-ui text-foreground">Sound Effects</span>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>
            
            {soundEnabled && (
              <div className="pl-9">
                <Slider
                  value={[soundVolume]}
                  onValueChange={handleSoundVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">{Math.round(soundVolume)}%</p>
              </div>
            )}
          </div>

          {/* Controls Info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-ui text-foreground mb-4">Controls</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Move Left</p>
                <p className="text-foreground font-ui">A / ←</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Move Right</p>
                <p className="text-foreground font-ui">D / →</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Jump</p>
                <p className="text-foreground font-ui">W / ↑ / Space</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Pause / Back</p>
                <p className="text-foreground font-ui">ESC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
