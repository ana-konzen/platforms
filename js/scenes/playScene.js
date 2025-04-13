import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId, randomPos } from "../util/util.js";
import { playerData } from "../local.js";
import { Platform } from "../platform.js";
import { engine, Engine, Composite, Body, Bodies } from "../physics.js";
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

  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
  partySubscribe("platformMoved", onPlatformMoved);
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
    resetGame(playerData[playerKey]);
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
          checkWinner(player.key);
        }
      }
      resetGame(player);
    }
  }
}

function resetGame(player) {
  if (roleKeeper.myRole() === "player1") {
    shared[player.key].ball.x = randomPos(player.boundaries);
    shared[player.key].ball.y = 0;
    shared[player.key].target.x = randomPos(player.boundaries);
  }
  Body.setPosition(player.ball, { x: shared[player.key].ball.x, y: shared[player.key].ball.y });
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

function checkWinner(playerKey) {
  if (!partyIsHost()) return;

  shared.winner = playerKey;
  shared.status = "end";
}

function onBallDrop({ player }) {
  if (playerData[player].ballDropped) return;
  playerData[player].ballDropped = true;
  Composite.add(engine.world, playerData[player].ball);
}

function onPlatformAdded({ playerKey, x, y, id }) {
  const platform = new Platform(x, y, id);
  playerData[playerKey].platforms.push(platform);
}

function onPlatformMoved({ playerKey, x, y, id }) {
  const platform = playerData[playerKey].platforms.find((p) => p.id === id);
  if (platform) {
    platform.move(x, y);
  }
}

function createWalls(player) {
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, CONFIG.wallW, height, { isStatic: true }),
    Bodies.rectangle(player.boundaries.right, height / 2, CONFIG.wallW, height, { isStatic: true }),
  ];

  Composite.add(engine.world, player.walls);
}
