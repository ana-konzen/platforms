import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId, randomPos } from "../util/util.js";
import { playerData } from "../local.js";
import { Platform } from "../platform.js";
import { engine, Engine, Composite, Body, Bodies } from "../physics.js";
import { RoleKeeper } from "../util/RoleKeeper.js";

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
    createWalls(player);
  }

  localPlayerKey = roleKeeper.myRole();

  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
  partySubscribe("platformMoved", onPlatformMoved);
}

export function update() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  Engine.update(engine);

  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    updateState(player);
  }

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
    const player = playerData[playerKey];
    renderScene(player);
  }
}

export function enter() {
  if (partyIsHost()) {
    shared.status = "playing";
  }
  localPlayerKey = roleKeeper.myRole();
  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    resetGame(player);
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
  if (shared[localPlayerKey].platforms.length >= CONFIG.maxPlatforms) return;
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

function createWalls(player) {
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, CONFIG.wallW, height, { isStatic: true }),
    Bodies.rectangle(player.boundaries.right, height / 2, CONFIG.wallW, height, { isStatic: true }),
  ];

  Composite.add(engine.world, player.walls);
}

function updateState(player) {
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

function resetGame(player) {
  if (partyIsHost()) {
    shared[player.key].ball.x = randomPos(player.boundaries);
    shared[player.key].ball.y = 0;
    shared[player.key].platforms = [];
    shared[player.key].target.x = randomPos(player.boundaries);
  }
  Body.setPosition(player.ball, { x: shared[player.key].ball.x, y: shared[player.key].ball.y });
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

function renderScene(player) {
  const pg = player.pg;
  const xOffset = player === playerData.player1 ? 0 : width / 2;
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
  for (const platform of shared[player.key].platforms) {
    const localPlatform = playerData[localPlayerKey].platforms.find((p) => p.id === platform.id);
    pg.push();
    if (localPlatform) localPlatform.update(pg);

    pg.translate(platform.x, platform.y);
    pg.rect(0, 0, CONFIG.platformW, CONFIG.platformH, CONFIG.platformH / 2);
    pg.pop();
  }

  pg.fill(CONFIG.ballColor);
  pg.ellipse(player.ball.position.x, player.ball.position.y, CONFIG.ballRadius * 2);

  pg.pop();

  image(pg, player === playerData.player1 ? 0 : width / 2, 0);
}

function onBallDrop({ player }) {
  Composite.add(engine.world, [playerData[player].ball]);
}

function onPlatformAdded({ playerKey, x, y, id }) {
  const platform = new Platform(x, y, id);
  playerData[playerKey].platforms.push(platform);
  if (playerKey === playerKey) shared[playerKey].platforms.push(platform.getShareData());
}

function onPlatformMoved({ playerKey, x, y, id }) {
  const localPlatform = playerData[playerKey].platforms.find((p) => p.id === id);
  const platform = shared[playerKey].platforms.find((p) => p.id === id);
  if (platform && localPlatform) {
    localPlatform.x = x;
    localPlatform.y = y;
    Body.setPosition(localPlatform.body, { x: x, y: y });
    if (partyIsHost()) {
      platform.x = localPlatform.x;
      platform.y = localPlatform.y;
    }
  }
}
