import { useEffect } from 'react';
import { GameScreen } from '@/game/types';
import { ArrowRight, Home, Trophy } from 'lucide-react';

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  onNextLevel: () => void;
  onScreenChange: (screen: GameScreen) => void;
}

export default function LevelCompleteScreen({ level, score, onNextLevel, onScreenChange }: LevelCompleteScreenProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onNextLevel();
      } else if (e.key === 'Escape') {
        onScreenChange('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextLevel, onScreenChange]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center animate-bounce-in">
        {/* Trophy decoration */}
        <div className="flex justify-center mb-6">
          <Trophy className="w-24 h-24 text-primary animate-pulse-glow" />
        </div>

        <h1 className="game-title text-5xl md:text-6xl text-primary mb-4">
          Level {level} Complete!
        </h1>

        <div className="bg-card rounded-xl p-8 mb-8 shadow-lg border border-border">
          <p className="text-2xl font-ui text-foreground mb-2">Score</p>
          <p className="text-5xl font-ui text-accent mb-4">{score}</p>
          
          <div className="flex justify-center gap-2">
            {[...Array(Math.min(level, 5))].map((_, i) => (
              <span key={i} className="text-3xl">💀</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNextLevel}
            className="game-button px-8 py-4 text-xl font-ui text-primary-foreground rounded-lg flex items-center justify-center gap-3"
          >
            Level {level + 1}
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => onScreenChange('menu')}
            className="game-button-secondary px-8 py-4 text-xl font-ui text-secondary-foreground rounded-lg flex items-center justify-center gap-3"
          >
            <Home className="w-6 h-6" />
            Main Menu
          </button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground font-ui">
          Press ENTER for next level • ESC for menu
        </p>
      </div>
    </div>
  );
}
