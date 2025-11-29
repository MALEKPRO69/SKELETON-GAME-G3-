import { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, InputState, GameScreen } from '@/game/types';
import { createInitialState, updateGame, respawnPlayer } from '@/game/GameEngine';
import { renderGame } from '@/game/Renderer';
import AudioManager from '@/game/AudioManager';
import MobileControls from './MobileControls';

interface GameCanvasProps {
  onScreenChange: (screen: GameScreen) => void;
  level: number;
  onLevelComplete: () => void;
  onGameOver: (score: number) => void;
}

export default function GameCanvas({ onScreenChange, level, onLevelComplete, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState(level));
  const inputRef = useRef<InputState>({ left: false, right: false, jump: false, pause: false });
  const animationFrameRef = useRef<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    if (key === 'escape') {
      e.preventDefault();
      if (gameStateRef.current.gameOver || gameStateRef.current.levelComplete) {
        onScreenChange('menu');
      } else {
        gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
        setIsPaused(gameStateRef.current.isPaused);
      }
      return;
    }

    if (key === 'a' || key === 'arrowleft') {
      inputRef.current.left = true;
    }
    if (key === 'd' || key === 'arrowright') {
      inputRef.current.right = true;
    }
    if (key === 'w' || key === 'arrowup' || key === ' ') {
      inputRef.current.jump = true;
    }
  }, [onScreenChange]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    
    if (key === 'a' || key === 'arrowleft') {
      inputRef.current.left = false;
    }
    if (key === 'd' || key === 'arrowright') {
      inputRef.current.right = false;
    }
    if (key === 'w' || key === 'arrowup' || key === ' ') {
      inputRef.current.jump = false;
    }
  }, []);

  const handleMobileInput = useCallback((direction: 'left' | 'right' | 'jump', pressed: boolean) => {
    if (direction === 'left') {
      inputRef.current.left = pressed;
    } else if (direction === 'right') {
      inputRef.current.right = pressed;
    } else if (direction === 'jump') {
      inputRef.current.jump = pressed;
    }
  }, []);

  useEffect(() => {
    const audio = AudioManager.getInstance();
    audio.init().then(() => {
      audio.playMusic();
    });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audio.stopMusic();
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    gameStateRef.current = createInitialState(level);
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let respawnTimer = 0;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Update game state
      gameStateRef.current = updateGame(gameStateRef.current, inputRef.current, deltaTime);

      // Handle player death respawn
      if (gameStateRef.current.player.isDead && !gameStateRef.current.gameOver) {
        respawnTimer += deltaTime;
        if (respawnTimer > 1500) {
          gameStateRef.current = respawnPlayer(gameStateRef.current);
          respawnTimer = 0;
        }
      }

      // Check for game over
      if (gameStateRef.current.gameOver) {
        onGameOver(gameStateRef.current.score);
        return;
      }

      // Check for level complete
      if (gameStateRef.current.levelComplete) {
        onLevelComplete();
        return;
      }

      // Render
      renderGame(ctx, gameStateRef.current, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onGameOver, onLevelComplete]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="max-w-full border-4 border-primary rounded-lg shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {isMobile && (
        <MobileControls 
          onInput={handleMobileInput}
          onPause={() => {
            gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
            setIsPaused(gameStateRef.current.isPaused);
          }}
        />
      )}

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => onScreenChange('menu')}
            className="game-button px-6 py-3 text-xl font-ui text-primary-foreground rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}
