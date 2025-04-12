import { STYLE } from "./style.js";
import { changeScene, scenes } from "./main.js";

//config
const maxPlatforms = 5;
const platformW = 40;
const platformH = 10;
const wallW = 5;
const ballRadius = 10;
const targetW = 50;
const targetH = 10;

const renderWalls = false;

// matter.js setup
const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;

const engine = Engine.create();

const localPlayerData = {
  player1: { name: "player 1", key: "player1", color: STYLE.player1Color, platforms: [] },
  player2: { name: "player 2", key: "player2", color: STYLE.player2Color, platforms: [] },
};

let currentPlayer;
let shared;

export function preload() {
  shared = partyLoadShared("globals");
}

export function setup() {
  localPlayerData.player1.pg = createGraphics(width / 2, height);
  localPlayerData.player2.pg = createGraphics(width / 2, height);

  noStroke();

  localPlayerData.player1.boundaries = {
    left: wallW / 2,
    right: width / 2 - wallW / 2,
  };
  localPlayerData.player2.boundaries = {
    left: width / 2 + wallW / 2,
    right: width - wallW / 2,
  };

  for (const playerKey in localPlayerData) {
    const player = localPlayerData[playerKey];
    createWalls(player);
    setPlayerData(player);
    player.ball = Bodies.circle(randomPos(player.boundaries), 0, ballRadius, { restitution: 0.7 });
  }

  shared.player1.color = localPlayerData.player1.color;
  shared.player2.color = localPlayerData.player2.color;

  currentPlayer = partyIsHost() ? localPlayerData.player1 : localPlayerData.player2;

  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
}

export function update() {
  if (shared.status === "end") {
    changeScene(scenes.end);
  }
}

export function draw() {
  rectMode(CENTER);

  Engine.update(engine);

  for (const playerKey in localPlayerData) {
    const player = localPlayerData[playerKey];
    updateState(player);
    renderScene(player);
  }
}

export function enter() {
  if (partyIsHost()) {
    shared.status = "playing";
  }
}

export function keyPressed() {
  if (key === "b") {
    partyEmit("dropBall", { player: currentPlayer.key });
  }
}

export function mousePressed() {
  if (shared[currentPlayer.key].platforms.length >= maxPlatforms) return;
  if (mouseX < currentPlayer.boundaries.left || mouseX > currentPlayer.boundaries.right) return;
  partyEmit("addPlatform", {
    player: currentPlayer.key,
    x: mouseX,
    y: mouseY,
  });
}

export function onBallDrop({ player }) {
  Composite.add(engine.world, [localPlayerData[player].ball]);
}

export function onPlatformAdded({ player, x, y }) {
  if (!partyIsHost()) return;
  shared[player].platforms.push({ x, y });
  const platform = Bodies.rectangle(x, y, platformW, platformH, {
    isStatic: true,
  });
  Composite.add(engine.world, [platform]);
  localPlayerData[player].platforms.push(platform);
}

function setPlayerData(player) {
  shared[player.key] = {
    platforms: [],
    ball: { x: randomPos(player.boundaries), y: 0 },
    target: { x: randomPos(player.boundaries), y: height - targetH / 2 - 10 },
  };
}

function createWalls(player) {
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(player.boundaries.right, height / 2, wallW, height, { isStatic: true }),
  ];

  Composite.add(engine.world, player.walls);
}

function checkWinner(playerKey) {
  if (!partyIsHost()) return;
  if (partyIsHost()) {
    shared.winner = playerKey;
    shared.status = "end";
  }
}

function randomPos(boundaries) {
  return random(boundaries.left, boundaries.right);
}

function updateState(player) {
  if (partyIsHost()) {
    shared[player.key].ball.x = player.ball.position.x;
    shared[player.key].ball.y = player.ball.position.y;
  }
  if (player.ball.position.y > height) {
    if (partyIsHost()) {
      if (
        player.ball.position.x - ballRadius >= shared[player.key].target.x - targetW / 2 &&
        player.ball.position.x + ballRadius <= shared[player.key].target.x + targetW / 2
      ) {
        checkWinner(player.key);
      }
      shared[player.key].platforms = [];
      shared[player.key].target.x = randomPos(player.boundaries);
    }
    Body.setPosition(player.ball, { x: randomPos(player.boundaries), y: 0 });
    Composite.remove(engine.world, [player.ball]);
    for (const platform of player.platforms) {
      Composite.remove(engine.world, [platform]);
    }
    player.platforms = [];
  }
}

function renderScene(player) {
  const pg = player.pg;
  const xOffset = player === localPlayerData.player1 ? 0 : width / 2;
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

  if (renderWalls) {
    pg.fill(STYLE.wallColor);
    for (const wall of player.walls) {
      pg.rect(wall.position.x, wall.position.y, wallW, height);
    }
  }

  pg.fill(STYLE.targetColor);
  pg.rect(shared[player.key].target.x, shared[player.key].target.y, targetW, targetH, targetH / 2);

  pg.fill(STYLE.platformColor);
  for (const platform of shared[player.key].platforms) {
    pg.rect(platform.x, platform.y, platformW, platformH, platformH / 2);
  }

  pg.fill(STYLE.ballColor);
  pg.ellipse(shared[player.key].ball.x, shared[player.key].ball.y, ballRadius * 2);

  pg.pop();

  image(pg, player === localPlayerData.player1 ? 0 : width / 2, 0);
}
