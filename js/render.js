import { shared } from "./scenes/titleScene.js";
import { CONFIG } from "./config.js";
import { getLevelName } from "./util/util.js";
import { IMAGES } from "./assets.js";

// Animation state for each player
const playerAnimState = {
  player1: {
    isAnimating: false,
    animStartTime: 0,
    prevBgColor: null,
    prevLevel: 1,
  },
  player2: {
    isAnimating: false,
    animStartTime: 0,
    prevBgColor: null,
    prevLevel: 1,
  },
};

const LEVEL_ANIM_DURATION = 800; // Animation duration in milliseconds
const ARROW_PULSE_SPEED = 0.004; // Speed of arrow pulsing
const ARROW_PULSE_AMOUNT = 8; // How many pixels up/down the arrow moves

export function renderScene(player) {
  const pg = player.pg;
  const xOffset = player.key === "player1" ? 0 : width / 2;
  const levelConfig = CONFIG[getLevelName(player.level)];
  pg.rectMode(CENTER);
  pg.noStroke();

  // Check if level changed
  if (player.level !== playerAnimState[player.key].prevLevel) {
    playerAnimState[player.key].isAnimating = true;
    playerAnimState[player.key].animStartTime = millis();
    playerAnimState[player.key].prevBgColor =
      CONFIG[getLevelName(playerAnimState[player.key].prevLevel)][player.key].bgColor;
    playerAnimState[player.key].prevLevel = player.level;
  }

  // Handle background animation
  if (playerAnimState[player.key].isAnimating) {
    const currentTime = millis() - playerAnimState[player.key].animStartTime;
    const progress = constrain(currentTime / LEVEL_ANIM_DURATION, 0, 1);

    // Draw old background
    pg.background(playerAnimState[player.key].prevBgColor);

    // Draw new background sliding up from bottom
    pg.push();
    pg.fill(levelConfig[player.key].bgColor);
    const slideHeight = lerp(0, pg.height, progress);
    pg.rect(pg.width / 2, pg.height - slideHeight / 2, pg.width, slideHeight);
    pg.pop();

    if (progress >= 1) {
      playerAnimState[player.key].isAnimating = false;
    }
  } else {
    pg.background(levelConfig[player.key].bgColor);
  }

  pg.push();
  pg.translate(-xOffset, 0);

  // draw walls
  if (CONFIG.renderWalls) {
    pg.fill(CONFIG.wallColor);
    for (const wall of player.walls) {
      pg.rect(wall.position.x, wall.position.y, CONFIG.wallW, height);
    }
  }

  //draw target
  pg.fill(levelConfig.targetColor);
  pg.rect(
    shared[player.key].target.x,
    height - levelConfig.targetH / 2 - 10,
    levelConfig.targetW,
    levelConfig.targetH,
    levelConfig.targetH / 2
  );

  //draw platforms
  pg.fill(levelConfig.platformColor);
  for (const platform of player.platforms) {
    platform.draw(pg, player.ballDropped);
  }

  //draw ball
  pg.fill(CONFIG.ballColor);
  pg.ellipse(player.ball.position.x, player.ball.position.y, CONFIG.ballRadius * 2);

  // draw arrows below ball if ball hasn't been dropped
  if (!player.ballDropped) {
    const arrowsWidth = CONFIG.ballRadius * 3; // Adjust size relative to ball
    const arrowsHeight = CONFIG.ballRadius * 2;
    // Calculate pulsing offset using sin wave
    const pulseOffset = sin(millis() * ARROW_PULSE_SPEED) * ARROW_PULSE_AMOUNT;
    pg.image(IMAGES.arrows, 
      player.ball.position.x - arrowsWidth/2,
      player.ball.position.y + CONFIG.ballRadius + pulseOffset,
      arrowsWidth,
      arrowsHeight
    );
  }

  pg.pop();

  // draw p5 graphis
  image(pg, xOffset, 0);
}
