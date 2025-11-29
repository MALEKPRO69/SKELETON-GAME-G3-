import { useState, useEffect, useCallback } from 'react';
import { GameScreen } from '@/game/types';
import MainMenu from './MainMenu';
import SettingsScreen from './SettingsScreen';
import GameCanvas from './GameCanvas';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';

export default function Game() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('calaveraHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('calaveraHighScore', score.toString());
    }
  }, [score, highScore]);

  const handleScreenChange = useCallback((screen: GameScreen) => {
    setCurrentScreen(screen);
    if (screen === 'game') {
      setLevel(1);
      setScore(0);
    }
  }, []);

  const handleLevelComplete = useCallback(() => {
    setCurrentScreen('levelcomplete');
  }, []);

  const handleNextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    setCurrentScreen('game');
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setCurrentScreen('gameover');
  }, []);

  const handleRestart = useCallback(() => {
    setLevel(1);
    setScore(0);
    setCurrentScreen('game');
  }, []);

  switch (currentScreen) {
    case 'menu':
      return <MainMenu onScreenChange={handleScreenChange} highScore={highScore} />;
    case 'settings':
      return <SettingsScreen onScreenChange={handleScreenChange} />;
    case 'game':
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-2">
          <GameCanvas
            onScreenChange={handleScreenChange}
            level={level}
            onLevelComplete={handleLevelComplete}
            onGameOver={handleGameOver}
          />
        </div>
      );
    case 'gameover':
      return (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onScreenChange={handleScreenChange}
          onRestart={handleRestart}
        />
      );
    case 'levelcomplete':
      return (
        <LevelCompleteScreen
          level={level}
          score={score}
          onNextLevel={handleNextLevel}
          onScreenChange={handleScreenChange}
        />
      );
    default:
      return <MainMenu onScreenChange={handleScreenChange} highScore={highScore} />;
  }
}
