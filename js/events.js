import { randomPos, getLevelName } from "./util/util.js";
import { playerData } from "./player.js";
import { engine, Composite, Body } from "./physics.js";
import { Platform } from "./platform.js";
import { CONFIG } from "./config.js";
import { shared } from "./scenes/titleScene.js";

export function setup() {
  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
  partySubscribe("platformMoved", onPlatformMoved);
  partySubscribe("platformRotated", onPlatformRotated);
  partySubscribe("targetHit", onTargetHit);

  partySubscribe("hostReset", onHostReset);
  partySubscribe("playerReset", onPlayerReset);
}

function onHostReset({ playerKey, newLevel = true, playerLevel = null }) {
  if (!partyIsHost()) return;

  const player = playerData[playerKey];
  const level = playerLevel || player.level;
  const levelConfig = CONFIG[getLevelName(level)];

  if (newLevel) {
    shared[playerKey].ball.initialX = randomPos(player.boundaries);
    shared[playerKey].target.initialX = CONFIG.easyMode
      ? shared[playerKey].ball.initialX
      : randomPos(
          player.boundaries,
          true,
          shared[playerKey].ball.initialX,
          levelConfig.targetRange,
          levelConfig.targetW / 2
        );
  }

  shared[playerKey].ball.x = shared[playerKey].ball.initialX;

  shared[playerKey].ball.y = CONFIG.headerHeight;

  shared[playerKey].target.x = shared[playerKey].target.initialX;

  partyEmit("playerReset", {
    playerKey,
    ballX: shared[playerKey].ball.initialX,
    ballY: shared[playerKey].ball.y,
    playerLevel: level,
  });
}

function onTargetHit({ playerKey }) {
  console.log("onTargetHit", playerKey);
  const player = playerData[playerKey];
  const playerLevel = player.level + 1;
  if (playerLevel <= CONFIG.numLevels) {
    if (partyIsHost()) {
      partyEmit("hostReset", { playerKey, newLevel: true, playerLevel });
    }
  } else {
    if (partyIsHost()) {
      shared.winner = player.name;
      shared.status = "end";
    }
  }
}

function onPlayerReset({ playerKey, ballX, ballY, playerLevel = null }) {
  console.log("onPlayerReset", playerKey);
  const player = playerData[playerKey];
  Body.setPosition(player.ball, { x: ballX, y: ballY });

  player.level = playerLevel || player.level;
  player.targetSpeed = CONFIG[getLevelName(player.level)].targetSpeed;
  console.log("level up", playerKey, player.level);

  console.log("ballX", ballX);
  console.log(player.ball);
  console.log(player.ball.position.x);

  Body.setVelocity(player.ball, { x: 0, y: 0 });
  Body.setAngularVelocity(player.ball, 0);
  Body.setAngle(player.ball, 0);
  player.ballDropped = false;
  player.hitTarget = false;
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
