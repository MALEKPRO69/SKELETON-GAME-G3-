export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface GameObject extends Position, Dimensions {
  id: string;
}

export interface Player extends GameObject, Velocity {
  isJumping: boolean;
  isGrounded: boolean;
  facingRight: boolean;
  animationFrame: number;
  isDead: boolean;
}

export interface Enemy extends GameObject, Velocity {
  type: 'calavera' | 'bat';
  isDead: boolean;
  deathTimer: number;
  animationFrame: number;
}

export interface Platform extends GameObject {
  type: 'ground' | 'floating' | 'moving';
  moveRange?: number;
  moveSpeed?: number;
  startX?: number;
}

export interface Soul extends GameObject {
  collected: boolean;
  animationFrame: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  platforms: Platform[];
  souls: Soul[];
  score: number;
  lives: number;
  level: number;
  cameraX: number;
  gameOver: boolean;
  isPaused: boolean;
  levelComplete: boolean;
}

export interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  soundVolume: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  pause: boolean;
}

export type GameScreen = 'menu' | 'game' | 'settings' | 'gameover' | 'levelcomplete';
