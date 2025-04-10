import { STYLE } from "./style.js";
import { changeScene, scenes } from "./main.js";

//config
const maxPlatforms = 5;
const platformW = 40;
const platformH = 10;
const wallW = 1;
const ballRadius = 10;
const targetW = 50;
const targetH = 10;

// matter.js setup
const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;

const engine = Engine.create();

const localPlayerData = {
  player1: { name: "player1", color: STYLE.player1Color, platforms: [] },
  player2: { name: "player2", color: STYLE.player2Color, platforms: [] },
};

let walls;
let currentPlayer;
let shared;

export function preload() {
  shared = partyLoadShared("globals");
}

export function setup() {
  noStroke();
  walls = [
    Bodies.rectangle(wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width - wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width / 2, height / 2, wallW, height, { isStatic: true }),
  ];
  Composite.add(engine.world, walls);

  localPlayerData.player1.boundaries = {
    left: wallW,
    right: width / 2 - wallW,
  };
  localPlayerData.player2.boundaries = {
    left: width / 2 + wallW,
    right: width - wallW,
  };

  for (const playerKey in localPlayerData) {
    const player = localPlayerData[playerKey];
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

  background(STYLE.background);

  fill(STYLE.player1Color);
  rect(width / 4, height / 2, width / 2 - wallW, height, 0);
  fill(STYLE.player2Color);
  rect((width * 3) / 4, height / 2, width / 2 - wallW, height, 0);

  textFont("Helvetica");
  textSize(18);
  textAlign(CENTER);
  fill("white");
  text("PLAYER 1", width / 4, 30);
  text("PLAYER 2", (width * 3) / 4, 30);

  for (const playerKey in localPlayerData) {
    updateState(playerKey);
    renderTarget(playerKey);
    renderPlatforms(playerKey);
    renderBall(playerKey);
  }

  fill(STYLE.wallColor);
  for (const wall of walls) {
    rect(wall.position.x, wall.position.y, wallW, height);
  }
}

export function enter() {
  if (partyIsHost()) {
    shared.status = "playing";
  }
}

export function keyPressed() {
  if (key === "b") {
    partyEmit("dropBall", { player: currentPlayer.name });
  }
}

export function mousePressed() {
  if (shared[currentPlayer.name].platforms.length >= maxPlatforms) return;
  if (mouseX < currentPlayer.boundaries.left || mouseX > currentPlayer.boundaries.right) return;
  partyEmit("addPlatform", {
    player: currentPlayer.name,
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
  shared[player.name] = {
    platforms: [],
    ball: { x: randomPos(player.boundaries), y: 0 },
    target: { x: randomPos(player.boundaries), y: height - targetH / 2 - 10 },
  };
}

function checkWinner(playerKey) {
  if (!partyIsHost()) return;
  if (partyIsHost()) {
    shared.winner = playerKey;
    shared.status = "end";
  }
}

function updateState(playerKey) {
  const player = localPlayerData[playerKey];
  if (player.ball.position.y > height) {
    Body.setPosition(player.ball, { x: randomPos(player.boundaries), y: 0 });
    Composite.remove(engine.world, [player.ball]);
    for (const platform of player.platforms) {
      Composite.remove(engine.world, [platform]);
    }
    player.platforms = [];
    if (partyIsHost()) {
      shared[playerKey].platforms = [];
      shared[playerKey].target.x = randomPos(player.boundaries);
      if (
        player.ball.position.x >= shared[playerKey].target.x &&
        player.ball.position.x <= shared[playerKey].target.x + targetW
      ) {
        console.log("winner");
        checkWinner(playerKey);
      }
    }
  }
}

function renderPlatforms(player) {
  fill(STYLE.platformColor);
  for (const platform of shared[player].platforms) {
    rect(platform.x, platform.y, platformW, platformH, platformH / 2);
  }
}

function renderTarget(player) {
  fill(STYLE.targetColor);
  rect(shared[player].target.x, shared[player].target.y, targetW, targetH, targetH / 2);
}

function renderBall(playerProperty) {
  const player = localPlayerData[playerProperty];

  if (partyIsHost()) {
    shared[playerProperty].ball.x = player.ball.position.x;
    shared[playerProperty].ball.y = player.ball.position.y;
  }
  fill(STYLE.ballColor);
  ellipse(shared[playerProperty].ball.x, shared[playerProperty].ball.y, ballRadius * 2);
}

function randomPos(boundaries) {
  return random(boundaries.left, boundaries.right);
}
