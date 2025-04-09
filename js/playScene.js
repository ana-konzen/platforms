import { STYLE } from "./style.js";

//config
const maxPlatforms = 5;

const platformW = 40;
const platformH = 10;
const wallW = 10;
const ballRadius = 20;
const targetW = 50;
const targetH = 10;

// matter.js setup
const Engine = Matter.Engine;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;

const engine = Engine.create();

const players = {
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
  createCanvas(400, 600);
  rectMode(CENTER);

  noStroke();
  walls = [
    Bodies.rectangle(wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width - wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width / 2, height / 2, wallW, height, { isStatic: true }),
  ];
  Composite.add(engine.world, walls);

  players.player1.boundaries = {
    left: wallW / 2,
    right: width / 2 - wallW,
  };
  players.player2.boundaries = {
    left: width / 2 + wallW,
    right: width - wallW / 2,
  };

  for (const playerKey in players) {
    const player = players[playerKey];
    setPlayerData(player);
    player.ball = Bodies.circle(randomPos(player.boundaries), 0, ballRadius, { restitution: 0.7 });
  }

  shared.player1.color = players.player1.color;
  shared.player2.color = players.player2.color;

  currentPlayer = partyIsHost() ? players.player1 : players.player2;

  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
}

export function draw() {
  Engine.update(engine);

  background(STYLE.background);

  for (const playerKey in players) {
    renderTarget(playerKey);
    renderPlatforms(playerKey);
    renderBall(playerKey);
    updateState(playerKey);
  }

  fill("black");
  text(shared.player1.points, 15, 20);
  text(shared.player2.points, width - 20, 20);

  fill(STYLE.wallColor);
  for (const wall of walls) {
    rect(wall.position.x, wall.position.y, wallW, height);
  }
}

export function onBallDrop({ player }) {
  if (!partyIsHost()) return;
  Composite.add(engine.world, [players[player].ball]);
}

export function onPlatformAdded({ player, x, y }) {
  if (!partyIsHost()) return;
  shared[player].platforms.push({ x, y });
  const platform = Bodies.rectangle(
    x + platformW / 2,
    y + platformH / 2 + platformH / 4,
    platformW,
    platformH,
    {
      isStatic: true,
    }
  );
  Composite.add(engine.world, [platform]);
  players[player].platforms.push(platform);
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

function setPlayerData(player) {
  shared[player.name] = {
    points: 0,
    platforms: [],
    ball: { x: randomPos(player.boundaries), y: 0 },
    target: { x: randomPos(player.boundaries), y: height - targetH / 2 },
  };
}
function renderBall(playerProperty) {
  const player = players[playerProperty];

  if (partyIsHost()) {
    shared[playerProperty].ball.x = player.ball.position.x;
    shared[playerProperty].ball.y = player.ball.position.y;
  }
  fill(shared[playerProperty].color);
  ellipse(shared[playerProperty].ball.x, shared[playerProperty].ball.y, ballRadius);
}

function updateState(playerKey) {
  const player = players[playerKey];
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
        player.ball.position.x > shared[playerKey].target.x &&
        player.ball.position.x < shared[playerKey].target.x + targetW
      ) {
        shared[playerKey].points++;
      }
    }
  }
}

function renderPlatforms(player) {
  fill(shared[player].color);
  for (const platform of shared[player].platforms) {
    rect(platform.x, platform.y, platformW, platformH);
  }
}

function renderTarget(player) {
  fill(STYLE.targetColor);
  rect(shared[player].target.x, shared[player].target.y, targetW, targetH);
}

function randomPos(boundaries) {
  return random(boundaries.left, boundaries.right);
}
