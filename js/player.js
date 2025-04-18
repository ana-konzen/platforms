import { Bodies } from "./physics.js";
import { CONFIG } from "./config.js";
import { randomPos } from "./util/util.js";
import { shared } from "./scenes/lobbyScene.js";

export const playerData = {
  player1: {
    name: "player 1",
    key: "player1",
    color: CONFIG.player1Color,
    platforms: [],
    ballDropped: false,
    level: 1,
  },
  player2: {
    name: "player 2",
    key: "player2",
    color: CONFIG.player2Color,
    platforms: [],
    ballDropped: false,
    level: 1,
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
        ball: { x: randomPos(player.boundaries), y: headerHeight },
        target: { x: randomPos(player.boundaries), y: height - CONFIG.targetH / 2 - 10 },
        color: player.color,
      };
    }
    player.ball = Bodies.circle(shared[playerKey]?.ball?.x, headerHeight, CONFIG.ballRadius, ballOptions);
    player.pg = createGraphics(width / 2, height);
  }
}
