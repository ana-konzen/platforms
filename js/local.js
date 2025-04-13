import { Bodies } from "./physics.js";
import { CONFIG } from "./config.js";
import { randomPos } from "./util/util.js";

export const playerData = {
  player1: {
    name: "player 1",
    key: "player1",
    color: CONFIG.player1Color,
    platforms: [],
    ballDropped: false,
  },
  player2: {
    name: "player 2",
    key: "player2",
    color: CONFIG.player2Color,
    platforms: [],
    ballDropped: false,
  },
};

const ballOptions = {
  restitution: 0.7,
};

let shared;

export function preload() {
  shared = partyLoadShared("globals");
}

export function setup() {
  playerData.player1.boundaries = {
    left: CONFIG.wallW / 2,
    right: width / 2 - CONFIG.wallW / 2,
  };
  playerData.player2.boundaries = {
    left: width / 2 + CONFIG.wallW / 2,
    right: width - CONFIG.wallW / 2,
  };

  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    if (partyIsHost()) {
      shared[playerKey] = {
        ball: { x: randomPos(player.boundaries), y: 0 },
        target: { x: randomPos(player.boundaries), y: height - CONFIG.targetH / 2 - 10 },
        color: player.color,
      };
    }
    player.ball = Bodies.circle(shared[playerKey].ball.x, 0, CONFIG.ballRadius, ballOptions);
    player.pg = createGraphics(width / 2, height);
    console.log(shared[playerKey].ball.x);
    console.log(player.ball.position.x);
  }
}
