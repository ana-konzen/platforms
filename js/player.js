import { Bodies } from "./physics.js";
import { CONFIG } from "./config.js";
import { randomPos } from "./util/util.js";
import { shared } from "./scenes/titleScene.js";

export const playerData = {
  player1: {
    name: "player 1",
    key: "player1",
    color: CONFIG.player1Color,
    platforms: [],
    ballDropped: false,
    hitTarget: false,
    level: 1,
    targetSpeed: 0,
  },
  player2: {
    name: "player 2",
    key: "player2",
    color: CONFIG.player2Color,
    platforms: [],
    ballDropped: false,
    hitTarget: false,
    level: 1,
    targetSpeed: 0,
  },
};

const ballOptions = {
  restitution: 0.7,
};

export function setup() {
  playerData.player1.boundaries = {
    left: CONFIG.wallW / 2,
    right: width / 2 - CONFIG.wallW / 2,
  };
  playerData.player2.boundaries = {
    left: width / 2 + CONFIG.wallW / 2,
    right: width - CONFIG.wallW / 2,
  };

  const headerHeight = 40; // Match the header height in playScene.js

  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    if (partyIsHost()) {
      shared[playerKey] = {
        ball: { initialX: randomPos(player.boundaries), y: headerHeight },
        target: {
          y: height - CONFIG.targetH / 2 - 10,
        },
        color: player.color,
      };
    }

    shared[playerKey].target.initialX = CONFIG.easyMode
      ? shared[playerKey].ball.initialX
      : randomPos(
          player.boundaries,
          true,
          shared[playerKey].ball.initialX,
          CONFIG["level1"].targetRange,
          CONFIG["level1"].targetW / 2
        );

    player.ball = Bodies.circle(
      shared[playerKey]?.ball?.initialX,
      headerHeight,
      CONFIG.ballRadius,
      ballOptions
    );
    player.pg = createGraphics(width / 2, height);
  }
}
