import { useEffect } from 'react';
import { GameScreen } from '@/game/types';
import { RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onScreenChange: (screen: GameScreen) => void;
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScore, onScreenChange, onRestart }: GameOverScreenProps) {
  const isNewHighScore = score > 0 && score >= highScore;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onRestart();
      } else if (e.key === 'Escape') {
        onScreenChange('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart, onScreenChange]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center animate-bounce-in">
        {/* Skull decoration */}
        <div className="flex justify-center mb-6">
          <Skull className="w-24 h-24 text-destructive animate-pulse" />
        </div>

        <h1 className="game-title text-5xl md:text-6xl text-destructive mb-4">
          Game Over
        </h1>

        <div className="bg-card rounded-xl p-8 mb-8 shadow-lg border border-border">
          <p className="text-2xl font-ui text-foreground mb-2">Your Score</p>
          <p className="text-5xl font-ui text-primary mb-4">{score}</p>
          
          {isNewHighScore && (
            <div className="bg-primary/20 rounded-lg p-3 mb-4 animate-pulse">
              <p className="text-xl font-ui text-primary">🎉 New High Score! 🎉</p>
            </div>
          )}

          <p className="text-lg text-muted-foreground font-ui">
            Best: <span className="text-accent">{Math.max(score, highScore)}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="game-button px-8 py-4 text-xl font-ui text-primary-foreground rounded-lg flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            Try Again
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
          Press ENTER to restart • ESC for menu
        </p>
      </div>
    </div>
  );
}
