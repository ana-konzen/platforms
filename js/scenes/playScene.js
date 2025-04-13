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
    const player = playerData[playerKey];
    createWalls(playerData[playerKey]);
    const resetButton = createButton("Reset");
    const buttonX = playerKey === "player1" ? 50 : width - 50;
    resetButton.position(buttonX, 10);
    resetButton.addClass("resetButton");
    resetButton.mousePressed(() => {
      partyEmit("hostReset", { playerKey });
    });
    resetButton.style("display", "none");
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

  const resetButtons = selectAll(".resetButton");
  for (const button of resetButtons) {
    button.style("display", "block");
  }
}

export function exit() {
  const resetButtons = selectAll(".resetButton");
  for (const button of resetButtons) {
    button.style("display", "none");
  }
}

export function keyPressed() {
  const player = playerData[localPlayerKey];
  if (key === "b") {
    for (const platform of player.platforms) {
      platform.selected = false;
    }
    partyEmit("dropBall", { player: localPlayerKey });
  }
  if (keyCode === LEFT_ARROW) {
    for (const platform of player.platforms) {
      if (platform.selected) {
        partyEmit("platformRotated", {
          playerKey: localPlayerKey,
          angle: -0.1,
          id: platform.id,
        });
      }
    }
  }
  if (keyCode === RIGHT_ARROW) {
    for (const platform of player.platforms) {
      if (platform.selected) {
        partyEmit("platformRotated", {
          playerKey: localPlayerKey,
          angle: 0.1,
          id: platform.id,
        });
      }
    }
  }
}

export function mousePressed() {
  const player = playerData[localPlayerKey];
  for (const platform of player.platforms) {
    platform.selected = false;
  }
  if (player.platforms.length >= CONFIG.maxPlatforms) return;
  if (player.ballDropped) return;
  if (mouseX < player.boundaries.left || mouseX > player.boundaries.right) return;

  for (const platform of player.platforms) {
    if (platform.found) {
      platform.selected = true;
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
