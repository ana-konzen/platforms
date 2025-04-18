import { randomPos } from "./util/util.js";
import { playerData } from "./player.js";
import { engine, Composite, Body } from "./physics.js";
import { Platform } from "./platform.js";
import { CONFIG } from "./config.js";
import { shared } from "./scenes/lobbyScene.js";

export function setup() {
  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
  partySubscribe("platformMoved", onPlatformMoved);
  partySubscribe("platformRotated", onPlatformRotated);

  partySubscribe("hostReset", onHostReset);
  partySubscribe("playerReset", onPlayerReset);
}

function onHostReset({ playerKey }) {
  if (!partyIsHost()) return;

  const player = playerData[playerKey];

  shared[playerKey].ball.x = randomPos(player.boundaries);
  shared[playerKey].ball.y = CONFIG.headerHeight;
  shared[playerKey].target.x = CONFIG.easyMode ? shared[playerKey].ball.x : randomPos(player.boundaries);

  partyEmit("playerReset", { playerKey, ballX: shared[playerKey].ball.x, ballY: shared[playerKey].ball.y });
}

function onPlayerReset({ playerKey, ballX, ballY }) {
  console.log("onPlayerReset", playerKey);
  const player = playerData[playerKey];
  Body.setPosition(player.ball, { x: ballX, y: ballY });

  console.log("ballX", ballX);
  console.log(player.ball.position.x);

  Body.setVelocity(player.ball, { x: 0, y: 0 });
  Body.setAngularVelocity(player.ball, 0);
  Body.setAngle(player.ball, 0);
  player.ballDropped = false;
  Composite.remove(engine.world, player.ball);
  for (const platform of player.platforms) {
    Composite.remove(engine.world, platform.body);
  }
  player.platforms = [];
}

function onBallDrop({ player }) {
  if (playerData[player].ballDropped) return;
  playerData[player].ballDropped = true;
  Composite.add(engine.world, playerData[player].ball);
}

function onPlatformAdded({ playerKey, x, y, id }) {
  const platform = new Platform(x, y, id, playerData[playerKey].level);
  playerData[playerKey].platforms.push(platform);
}

function onPlatformMoved({ playerKey, x, y, id }) {
  const platform = playerData[playerKey].platforms.find((p) => p.id === id);
  if (platform) {
    platform.move(x, y);
  }
}

function onPlatformRotated({ playerKey, id, angle }) {
  const platform = playerData[playerKey].platforms.find((p) => p.id === id);
  if (platform) {
    platform.rotate(angle);
  }
}
