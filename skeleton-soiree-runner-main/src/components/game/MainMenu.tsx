import { useEffect, useRef } from 'react';
import { GameScreen } from '@/game/types';
import { Play, Settings, Skull } from 'lucide-react';
import AudioManager from '@/game/AudioManager';

interface MainMenuProps {
  onScreenChange: (screen: GameScreen) => void;
  highScore: number;
}

export default function MainMenu({ onScreenChange, highScore }: MainMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const audio = AudioManager.getInstance();
    audio.init();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const drawBackground = () => {
      time += 0.02;

      // Night sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(0.5, '#3d1a5c');
      gradient.addColorStop(1, '#2d1440');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated stars
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 100; i++) {
        const x = (i * 73 + time * 5) % canvas.width;
        const y = (i * 47) % (canvas.height * 0.7);
        const twinkle = Math.sin(time + i) * 0.5 + 0.5;
        const size = ((i % 3) + 1) * twinkle;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating marigold petals
      ctx.fillStyle = '#f39c12';
      for (let i = 0; i < 20; i++) {
        const x = (i * 50 + time * 30) % (canvas.width + 50) - 25;
        const y = (Math.sin(time + i) * 50 + i * 40) % canvas.height;
        const rotation = time + i;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ground with marigolds
      ctx.fillStyle = '#2d1440';
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Marigold row
      for (let i = 0; i < 15; i++) {
        const x = i * 60 + 30;
        const y = canvas.height - 60;
        const wave = Math.sin(time * 2 + i * 0.5) * 3;
        
        ctx.save();
        ctx.translate(x, y + wave);
        
        // Stem
        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 30);
        ctx.stroke();
        
        // Flower
        ctx.fillStyle = '#f39c12';
        for (let j = 0; j < 8; j++) {
          ctx.save();
          ctx.rotate((j * Math.PI) / 4);
          ctx.beginPath();
          ctx.ellipse(0, -12, 5, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      animationFrame = requestAnimationFrame(drawBackground);
    };

    drawBackground();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8 animate-bounce-in">
          <Skull className="w-16 h-16 text-primary skull-decoration" />
          <h1 className="game-title text-5xl md:text-7xl text-primary">
            Calavera Run
          </h1>
          <Skull className="w-16 h-16 text-primary skull-decoration" />
        </div>

        <p className="text-xl md:text-2xl text-foreground/80 mb-12 font-ui tracking-wide">
          Day of the Dead Runner
        </p>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => onScreenChange('game')}
            className="game-button px-8 py-4 text-2xl font-ui text-primary-foreground rounded-lg flex items-center justify-center gap-3"
          >
            <Play className="w-8 h-8" />
            Play
          </button>

          <button
            onClick={() => onScreenChange('settings')}
            className="game-button-secondary px-8 py-4 text-2xl font-ui text-secondary-foreground rounded-lg flex items-center justify-center gap-3"
          >
            <Settings className="w-8 h-8" />
            Settings
          </button>
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg text-muted-foreground font-ui">High Score</p>
            <p className="text-3xl text-accent font-ui">{highScore}</p>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-muted-foreground font-ui">
            WASD or Arrow Keys to move • Space to jump • ESC to pause
          </p>
        </div>
      </div>
    </div>
  );
}
