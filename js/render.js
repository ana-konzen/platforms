import { CONFIG } from "./config.js";

export function renderScene(player, shared) {
  const pg = player.pg;
  const xOffset = player.key === "player1" ? 0 : width / 2;
  pg.rectMode(CENTER);
  pg.noStroke();
  pg.background(player.color);
  pg.textFont("Helvetica");
  pg.textSize(18);
  pg.textAlign(CENTER);
  pg.fill("white");
  pg.text(player.name, pg.width / 2, 30);

  pg.push();
  pg.translate(-xOffset, 0);

  if (CONFIG.renderWalls) {
    pg.fill(CONFIG.wallColor);
    for (const wall of player.walls) {
      pg.rect(wall.position.x, wall.position.y, CONFIG.wallW, height);
    }
  }

  pg.fill(CONFIG.targetColor);
  pg.rect(
    shared[player.key].target.x,
    shared[player.key].target.y,
    CONFIG.targetW,
    CONFIG.targetH,
    CONFIG.targetH / 2
  );

  pg.fill(CONFIG.platformColor);
  for (const platform of player.platforms) {
    platform.draw(pg, player.ballDropped);
  }

  pg.fill(CONFIG.ballColor);
  pg.ellipse(player.ball.position.x, player.ball.position.y, CONFIG.ballRadius * 2);

  pg.pop();

  image(pg, xOffset, 0);
}
