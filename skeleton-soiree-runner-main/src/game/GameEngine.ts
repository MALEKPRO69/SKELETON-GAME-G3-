import { GameState, Player, Enemy, Platform, Soul, InputState } from './types';
import AudioManager from './AudioManager';

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 5;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;

export function createInitialState(level: number = 1): GameState {
  const platforms = generateLevel(level);
  const enemies = generateEnemies(level, platforms);
  const souls = generateSouls(level, platforms);
  
  return {
    player: {
      id: 'player',
      x: 100,
      y: 300,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      isJumping: false,
      isGrounded: false,
      facingRight: true,
      animationFrame: 0,
      isDead: false,
    },
    enemies,
    platforms,
    souls,
    score: 0,
    lives: 3,
    level,
    cameraX: 0,
    gameOver: false,
    isPaused: false,
    levelComplete: false,
  };
}

function generateLevel(level: number): Platform[] {
  const platforms: Platform[] = [];
  
  // Ground platforms
  for (let i = 0; i < 50 + level * 10; i++) {
    // Add gaps occasionally
    if (Math.random() > 0.15 || i < 3) {
      platforms.push({
        id: `ground-${i}`,
        x: i * 120,
        y: 500,
        width: 120,
        height: 40,
        type: 'ground',
      });
    }
  }
  
  // Floating platforms
  for (let i = 0; i < 20 + level * 5; i++) {
    const x = 300 + i * 200 + Math.random() * 100;
    const y = 250 + Math.random() * 150;
    
    platforms.push({
      id: `float-${i}`,
      x,
      y,
      width: 80 + Math.random() * 60,
      height: 25,
      type: 'floating',
    });
  }
  
  // Moving platforms
  for (let i = 0; i < 5 + level * 2; i++) {
    const x = 500 + i * 400;
    const y = 300 + Math.random() * 100;
    
    platforms.push({
      id: `moving-${i}`,
      x,
      y,
      width: 100,
      height: 25,
      type: 'moving',
      moveRange: 100,
      moveSpeed: 1 + Math.random(),
      startX: x,
    });
  }
  
  return platforms;
}

function generateEnemies(level: number, platforms: Platform[]): Enemy[] {
  const enemies: Enemy[] = [];
  const groundPlatforms = platforms.filter(p => p.type === 'ground');
  
  for (let i = 0; i < 10 + level * 3; i++) {
    const platform = groundPlatforms[Math.floor(Math.random() * groundPlatforms.length)];
    if (platform && platform.x > 400) {
      enemies.push({
        id: `enemy-${i}`,
        x: platform.x + Math.random() * (platform.width - 30),
        y: platform.y - 50,
        width: 40,
        height: 50,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1 + level * 0.3),
        vy: 0,
        type: 'calavera',
        isDead: false,
        deathTimer: 0,
        animationFrame: 0,
      });
    }
  }
  
  return enemies;
}

function generateSouls(level: number, platforms: Platform[]): Soul[] {
  const souls: Soul[] = [];
  
  // Souls on platforms
  platforms.forEach((platform, idx) => {
    if (Math.random() > 0.5 && platform.x > 200) {
      souls.push({
        id: `soul-${idx}`,
        x: platform.x + platform.width / 2 - 15,
        y: platform.y - 50,
        width: 30,
        height: 30,
        collected: false,
        animationFrame: 0,
      });
    }
  });
  
  // Extra souls in air
  for (let i = 0; i < 15 + level * 5; i++) {
    souls.push({
      id: `soul-air-${i}`,
      x: 400 + i * 150 + Math.random() * 50,
      y: 200 + Math.random() * 200,
      width: 30,
      height: 30,
      collected: false,
      animationFrame: 0,
    });
  }
  
  return souls;
}

export function updateGame(state: GameState, input: InputState, deltaTime: number): GameState {
  if (state.isPaused || state.gameOver || state.levelComplete) {
    return state;
  }
  
  const audio = AudioManager.getInstance();
  let newState = { ...state };
  
  // Update player
  newState.player = updatePlayer(newState.player, input, newState.platforms, audio);
  
  // Update camera
  newState.cameraX = Math.max(0, newState.player.x - 300);
  
  // Update platforms (moving ones)
  newState.platforms = newState.platforms.map(platform => {
    if (platform.type === 'moving' && platform.startX !== undefined && platform.moveRange && platform.moveSpeed) {
      const time = Date.now() / 1000;
      return {
        ...platform,
        x: platform.startX + Math.sin(time * platform.moveSpeed) * platform.moveRange,
      };
    }
    return platform;
  });
  
  // Update enemies
  newState.enemies = updateEnemies(newState.enemies, newState.platforms);
  
  // Update souls animation
  newState.souls = newState.souls.map(soul => ({
    ...soul,
    animationFrame: (soul.animationFrame + 0.1) % 360,
  }));
  
  // Check collisions
  newState = checkCollisions(newState, audio);
  
  // Check level complete
  const levelEndX = (50 + state.level * 10) * 120 - 200;
  if (newState.player.x > levelEndX && !newState.player.isDead) {
    newState.levelComplete = true;
    audio.playSound('levelComplete');
  }
  
  // Check death by falling
  if (newState.player.y > 700 && !newState.player.isDead) {
    newState.player.isDead = true;
    newState.lives -= 1;
    audio.playSound('death');
    
    if (newState.lives <= 0) {
      newState.gameOver = true;
    }
  }
  
  return newState;
}

function updatePlayer(player: Player, input: InputState, platforms: Platform[], audio: AudioManager): Player {
  if (player.isDead) return player;
  
  let { x, y, vx, vy, isJumping, isGrounded, facingRight, animationFrame } = player;
  
  // Horizontal movement
  vx = 0;
  if (input.left) {
    vx = -MOVE_SPEED;
    facingRight = false;
  }
  if (input.right) {
    vx = MOVE_SPEED;
    facingRight = true;
  }
  
  // Jumping
  if (input.jump && isGrounded && !isJumping) {
    vy = JUMP_FORCE;
    isJumping = true;
    isGrounded = false;
    audio.playSound('jump');
  }
  
  // Apply gravity
  vy += GRAVITY;
  
  // Apply velocities
  x += vx;
  y += vy;
  
  // Platform collision
  isGrounded = false;
  for (const platform of platforms) {
    if (checkPlatformCollision(x, y, player.width, player.height, platform, vy)) {
      y = platform.y - player.height;
      vy = 0;
      isGrounded = true;
      isJumping = false;
    }
  }
  
  // Update animation
  if (vx !== 0 && isGrounded) {
    animationFrame = (animationFrame + 0.3) % 4;
  } else if (!isGrounded) {
    animationFrame = 2; // Jump frame
  } else {
    animationFrame = 0; // Idle
  }
  
  // Prevent going off left side
  x = Math.max(0, x);
  
  return { ...player, x, y, vx, vy, isJumping, isGrounded, facingRight, animationFrame };
}

function checkPlatformCollision(
  px: number, py: number, pw: number, ph: number,
  platform: Platform, vy: number
): boolean {
  const playerBottom = py + ph;
  const playerLeft = px;
  const playerRight = px + pw;
  
  const platTop = platform.y;
  const platLeft = platform.x;
  const platRight = platform.x + platform.width;
  
  // Only collide when falling onto platform
  if (vy >= 0 &&
      playerBottom >= platTop &&
      playerBottom <= platTop + 20 &&
      playerRight > platLeft &&
      playerLeft < platRight) {
    return true;
  }
  
  return false;
}

function updateEnemies(enemies: Enemy[], platforms: Platform[]): Enemy[] {
  return enemies.map(enemy => {
    if (enemy.isDead) {
      return {
        ...enemy,
        deathTimer: enemy.deathTimer + 1,
      };
    }
    
    let { x, y, vx, vy, animationFrame } = enemy;
    
    // Simple patrol behavior
    x += vx;
    
    // Turn around at platform edges
    const onPlatform = platforms.find(p => 
      x > p.x && x < p.x + p.width - enemy.width &&
      y + enemy.height >= p.y - 5 && y + enemy.height <= p.y + 10
    );
    
    if (!onPlatform || x < 0) {
      vx = -vx;
    }
    
    animationFrame = (animationFrame + 0.2) % 4;
    
    return { ...enemy, x, y, vx, vy, animationFrame };
  }).filter(e => e.deathTimer < 30);
}

function checkCollisions(state: GameState, audio: AudioManager): GameState {
  let { player, enemies, souls, score } = state;
  
  if (player.isDead) return state;
  
  // Player vs Enemies
  enemies = enemies.map(enemy => {
    if (enemy.isDead) return enemy;
    
    const playerRect = { x: player.x, y: player.y, w: player.width, h: player.height };
    const enemyRect = { x: enemy.x, y: enemy.y, w: enemy.width, h: enemy.height };
    
    if (rectsIntersect(playerRect, enemyRect)) {
      // Check if player is jumping on enemy
      if (player.vy > 0 && player.y + player.height - enemy.y < 20) {
        audio.playSound('enemyDeath');
        player = { ...player, vy: JUMP_FORCE * 0.7 };
        score += 100;
        return { ...enemy, isDead: true };
      } else {
        // Player takes damage
        if (!player.isDead) {
          audio.playSound('death');
          player = { ...player, isDead: true };
          state.lives -= 1;
          if (state.lives <= 0) {
            state.gameOver = true;
          }
        }
      }
    }
    return enemy;
  });
  
  // Player vs Souls
  souls = souls.map(soul => {
    if (soul.collected) return soul;
    
    const playerRect = { x: player.x, y: player.y, w: player.width, h: player.height };
    const soulRect = { x: soul.x, y: soul.y, w: soul.width, h: soul.height };
    
    if (rectsIntersect(playerRect, soulRect)) {
      audio.playSound('collect');
      score += 50;
      return { ...soul, collected: true };
    }
    return soul;
  });
  
  return { ...state, player, enemies, souls, score };
}

function rectsIntersect(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function respawnPlayer(state: GameState): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      x: Math.max(0, state.cameraX + 100),
      y: 300,
      vx: 0,
      vy: 0,
      isDead: false,
      isGrounded: false,
      isJumping: false,
    },
  };
}
