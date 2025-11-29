import { GameState, Player, Enemy, Platform, Soul } from './types';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number
) {
  const { cameraX } = state;
  
  // Clear and draw background
  drawBackground(ctx, canvasWidth, canvasHeight, cameraX);
  
  // Save context and apply camera transform
  ctx.save();
  ctx.translate(-cameraX, 0);
  
  // Draw platforms
  state.platforms.forEach(platform => drawPlatform(ctx, platform));
  
  // Draw souls
  state.souls.forEach(soul => {
    if (!soul.collected) {
      drawSoul(ctx, soul);
    }
  });
  
  // Draw enemies
  state.enemies.forEach(enemy => drawEnemy(ctx, enemy));
  
  // Draw player
  drawPlayer(ctx, state.player);
  
  ctx.restore();
  
  // Draw UI
  drawUI(ctx, state, canvasWidth);
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) {
  // Night sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a0a2e');
  gradient.addColorStop(0.5, '#3d1a5c');
  gradient.addColorStop(1, '#2d1440');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 73 + cameraX * 0.1) % width;
    const y = (i * 47) % (height * 0.6);
    const size = (i % 3) + 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Moon
  const moonX = ((cameraX * 0.05) % width + width) % width;
  ctx.beginPath();
  ctx.arc(moonX + 100, 80, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#ffeaa7';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 115, 75, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#1a0a2e';
  ctx.fill();
  
  // Distant marigold flowers (parallax)
  for (let i = 0; i < 20; i++) {
    const x = (i * 100 - cameraX * 0.2 + 1000) % (width + 100);
    const y = height - 100 - (i % 3) * 20;
    drawMarigold(ctx, x, y, 15 + (i % 3) * 5);
  }
}

function drawMarigold(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  
  // Petals
  ctx.fillStyle = '#f39c12';
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.6, size * 0.3, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Center
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#e67e22';
  ctx.fill();
  
  ctx.restore();
}

function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform) {
  const { x, y, width, height, type } = platform;
  
  // Platform body
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  
  if (type === 'ground') {
    gradient.addColorStop(0, '#8b6914');
    gradient.addColorStop(1, '#5c4510');
  } else if (type === 'moving') {
    gradient.addColorStop(0, '#9b59b6');
    gradient.addColorStop(1, '#6c3483');
  } else {
    gradient.addColorStop(0, '#b8860b');
    gradient.addColorStop(1, '#8b6914');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Decorative pattern (Day of the Dead style)
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 2;
  
  // Border
  ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
  
  // Dots pattern
  ctx.fillStyle = '#f39c12';
  const dotSpacing = 20;
  for (let dx = dotSpacing; dx < width - 5; dx += dotSpacing) {
    ctx.beginPath();
    ctx.arc(x + dx, y + height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const { x, y, width, height, facingRight, animationFrame, isDead, isGrounded, vx } = player;
  
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  
  if (!facingRight) {
    ctx.scale(-1, 1);
  }
  
  if (isDead) {
    ctx.rotate(Date.now() / 100);
    ctx.globalAlpha = Math.max(0, 1 - (Date.now() % 1000) / 1000);
  }
  
  // Walking animation bobbing
  const walkBob = isGrounded && vx !== 0 ? Math.sin(animationFrame * Math.PI) * 3 : 0;
  ctx.translate(0, walkBob);
  
  // Body (ribcage)
  ctx.fillStyle = '#f5f5dc';
  ctx.beginPath();
  ctx.ellipse(0, 5, width * 0.35, height * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ribs
  ctx.strokeStyle = '#d4c896';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(0, -5 + i * 8, 12 - i, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  
  // Head (skull)
  ctx.fillStyle = '#f5f5dc';
  ctx.beginPath();
  ctx.ellipse(0, -height * 0.35, width * 0.35, width * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye sockets (Day of the Dead style)
  ctx.fillStyle = '#1a0a2e';
  ctx.beginPath();
  ctx.ellipse(-8, -height * 0.38, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -height * 0.38, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Decorative eye patterns
  ctx.strokeStyle = '#e91e63';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-8, -height * 0.38, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(8, -height * 0.38, 10, 0, Math.PI * 2);
  ctx.stroke();
  
  // Eye pupils
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.arc(-8, -height * 0.38, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -height * 0.38, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#1a0a2e';
  ctx.beginPath();
  ctx.moveTo(-3, -height * 0.28);
  ctx.lineTo(3, -height * 0.28);
  ctx.lineTo(0, -height * 0.22);
  ctx.closePath();
  ctx.fill();
  
  // Mouth
  ctx.strokeStyle = '#1a0a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -height * 0.15);
  ctx.lineTo(10, -height * 0.15);
  ctx.stroke();
  
  // Teeth
  for (let i = -8; i <= 8; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -height * 0.15);
    ctx.lineTo(i, -height * 0.12);
    ctx.stroke();
  }
  
  // Decorative forehead flower
  ctx.fillStyle = '#f39c12';
  drawMiniFlower(ctx, 0, -height * 0.5, 6);
  
  // Legs with walking animation
  const legAngle = isGrounded && vx !== 0 ? Math.sin(animationFrame * Math.PI * 2) * 0.3 : 0;
  
  ctx.strokeStyle = '#f5f5dc';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  
  // Left leg
  ctx.save();
  ctx.rotate(-legAngle);
  ctx.beginPath();
  ctx.moveTo(-8, height * 0.15);
  ctx.lineTo(-10, height * 0.45);
  ctx.stroke();
  ctx.restore();
  
  // Right leg
  ctx.save();
  ctx.rotate(legAngle);
  ctx.beginPath();
  ctx.moveTo(8, height * 0.15);
  ctx.lineTo(10, height * 0.45);
  ctx.stroke();
  ctx.restore();
  
  // Arms with swing
  const armAngle = legAngle * 0.5;
  
  ctx.save();
  ctx.rotate(armAngle);
  ctx.beginPath();
  ctx.moveTo(-width * 0.35, -5);
  ctx.lineTo(-width * 0.55, 15);
  ctx.stroke();
  ctx.restore();
  
  ctx.save();
  ctx.rotate(-armAngle);
  ctx.beginPath();
  ctx.moveTo(width * 0.35, -5);
  ctx.lineTo(width * 0.55, 15);
  ctx.stroke();
  ctx.restore();
  
  ctx.restore();
}

function drawMiniFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  ctx.fillStyle = '#e67e22';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const { x, y, width, height, isDead, animationFrame, vx } = enemy;
  
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  
  if (isDead) {
    const scale = Math.max(0, 1 - enemy.deathTimer / 30);
    ctx.rotate(enemy.deathTimer * 0.3);
    ctx.scale(scale, scale);
  }
  
  // Bounce animation
  const bounce = Math.sin(animationFrame * Math.PI) * 2;
  ctx.translate(0, bounce);
  
  // Flip based on direction
  if (vx < 0) {
    ctx.scale(-1, 1);
  }
  
  // Enemy body (smaller skull/calavera)
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.4, height * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Skull face
  ctx.fillStyle = '#f5f5dc';
  ctx.beginPath();
  ctx.ellipse(0, -5, width * 0.35, width * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#1a0a2e';
  ctx.beginPath();
  ctx.ellipse(-6, -8, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -8, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Evil eye glow
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(-6, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Angry eyebrows
  ctx.strokeStyle = '#1a0a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, -15);
  ctx.lineTo(-3, -12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, -15);
  ctx.lineTo(3, -12);
  ctx.stroke();
  
  // Nose
  ctx.fillStyle = '#1a0a2e';
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.lineTo(2, -3);
  ctx.lineTo(0, 1);
  ctx.closePath();
  ctx.fill();
  
  // Evil grin
  ctx.beginPath();
  ctx.arc(0, 5, 8, 0, Math.PI);
  ctx.stroke();
  
  // Teeth
  for (let i = -6; i <= 6; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 5);
    ctx.lineTo(i, 8);
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawSoul(ctx: CanvasRenderingContext2D, soul: Soul) {
  const { x, y, width, animationFrame } = soul;
  const float = Math.sin(animationFrame * 0.1) * 5;
  
  ctx.save();
  ctx.translate(x + width / 2, y + width / 2 + float);
  
  // Glow effect
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width);
  gradient.addColorStop(0, 'rgba(46, 204, 113, 0.8)');
  gradient.addColorStop(0.5, 'rgba(46, 204, 113, 0.4)');
  gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, width, 0, Math.PI * 2);
  ctx.fill();
  
  // Soul core
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner glow
  ctx.fillStyle = '#a8e6cf';
  ctx.beginPath();
  ctx.arc(-3, -3, width * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Face (ghostly)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(-4, -2, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -2, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.beginPath();
  ctx.arc(0, 4, 3, 0, Math.PI);
  ctx.stroke();
  
  ctx.restore();
}

function drawUI(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number) {
  // Score
  ctx.fillStyle = '#f39c12';
  ctx.font = 'bold 24px Bangers';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${state.score}`, 20, 40);
  
  // Souls collected
  const totalSouls = state.souls.length;
  const collected = state.souls.filter(s => s.collected).length;
  ctx.fillStyle = '#2ecc71';
  ctx.fillText(`Souls: ${collected}/${totalSouls}`, 20, 70);
  
  // Lives
  ctx.fillStyle = '#e74c3c';
  ctx.fillText(`Lives: ${state.lives}`, canvasWidth - 120, 40);
  
  // Level
  ctx.fillStyle = '#9b59b6';
  ctx.fillText(`Level ${state.level}`, canvasWidth - 120, 70);
  
  // Pause indicator
  if (state.isPaused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, 600);
    
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 48px Creepster';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvasWidth / 2, 280);
    ctx.font = 'bold 24px Bangers';
    ctx.fillText('Press ESC to resume', canvasWidth / 2, 330);
  }
}
