import { shared } from "./scenes/titleScene.js";
import { CONFIG } from "./config.js";
import { getLevelName } from "./util/util.js";

export function renderScene(player) {
  const pg = player.pg;
  const xOffset = player.key === "player1" ? 0 : width / 2;
  const levelConfig = CONFIG[getLevelName(player.level)];
  pg.rectMode(CENTER);
  pg.noStroke();

  pg.background(levelConfig[player.key].bgColor);

  pg.push();
  pg.translate(-xOffset, 0);

  if (CONFIG.renderWalls) {
    pg.fill(CONFIG.wallColor);
    for (const wall of player.walls) {
      pg.rect(wall.position.x, wall.position.y, CONFIG.wallW, height);
    }
  }

  pg.fill(levelConfig.targetColor);
  pg.rect(
    shared[player.key].target.x,
    shared[player.key].target.y,
    levelConfig.targetW,
    levelConfig.targetH,
    levelConfig.targetH / 2
  );

  pg.fill(levelConfig.platformColor);
  for (const platform of player.platforms) {
    platform.draw(pg, player.ballDropped);
  }

  pg.fill(CONFIG.ballColor);
  pg.ellipse(player.ball.position.x, player.ball.position.y, levelConfig.ballRadius * 2);

  pg.pop();

  image(pg, xOffset, 0);
}
