import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId } from "../util/util.js";
import { playerData } from "../local.js";
import { engine, Engine, Composite, Bodies } from "../physics.js";
import { RoleKeeper } from "../util/RoleKeeper.js";
import { renderScene } from "../render.js";

let shared;

let localPlayerKey;

export let roleKeeper;

export function preload() {
  shared = partyLoadShared("globals");
  roleKeeper = new RoleKeeper(["player1", "player2"], "unassigned");
  roleKeeper.setAutoAssign(false);
}

export function setup() {
  rectMode(CENTER);

  for (const playerKey in playerData) {
    createWalls(playerData[playerKey]);
  }

  localPlayerKey = roleKeeper.myRole();
}

export function update() {
  Engine.update(engine);

  updateState();
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (!player1 || !player2) {
    if (partyIsHost()) {
      shared.status = "waiting";
    }
    changeScene(scenes.title);
  }

  if (shared.status === "end") {
    changeScene(scenes.end);
  }
}

export function draw() {
  rectMode(CENTER);

  for (const playerKey in playerData) {
    renderScene(playerData[playerKey], shared);
  }
}

export function enter() {
  if (partyIsHost()) {
    shared.status = "playing";
  }
  localPlayerKey = roleKeeper.myRole();
  for (const playerKey in playerData) {
    if (partyIsHost()) {
      partyEmit("hostReset", { playerKey });
    }
  }
}

export function windowResized() {
  playerData.player1.boundaries = {
    left: CONFIG.wallW / 2,
    right: width / 2 - CONFIG.wallW / 2,
  };
  playerData.player2.boundaries = {
    left: width / 2 + CONFIG.wallW / 2,
    right: width - CONFIG.wallW / 2,
  };
}

export function keyPressed() {
  if (key === "b") {
    partyEmit("dropBall", { player: localPlayerKey });
  }
}

export function mousePressed() {
  const player = playerData[localPlayerKey];
  if (player.platforms.length >= CONFIG.maxPlatforms) return;
  if (player.ballDropped) return;
  if (mouseX < player.boundaries.left || mouseX > player.boundaries.right) return;

  for (const platform of player.platforms) {
    if (platform.found) {
      return;
    }
  }

  partyEmit("addPlatform", {
    playerKey: localPlayerKey,
    x: mouseX,
    y: mouseY,
    id: makeId(),
  });
}

export function mouseDragged() {
  const player = playerData[localPlayerKey];
  if (player.ballDropped) return;
  for (const platform of player.platforms) {
    if (platform.found) {
      partyEmit("platformMoved", {
        playerKey: localPlayerKey,
        x: mouseX,
        y: mouseY,
        id: platform.id,
      });
    }
  }
}

function updateState() {
  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    if (player.ball.position.y > height) {
      if (partyIsHost()) {
        if (
          player.ball.position.x - CONFIG.ballRadius >= shared[player.key].target.x - CONFIG.targetW / 2 &&
          player.ball.position.x + CONFIG.ballRadius <= shared[player.key].target.x + CONFIG.targetW / 2
        ) {
          shared.winner = player.key;
          shared.status = "end";
        }
        partyEmit("hostReset", { playerKey });
      }
    }
  }
}

function createWalls(player) {
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, CONFIG.wallW, height, { isStatic: true }),
    Bodies.rectangle(player.boundaries.right, height / 2, CONFIG.wallW, height, { isStatic: true }),
  ];

  Composite.add(engine.world, player.walls);
}
