//config
const platformW = 40;
const platformH = 10;
const maxPlatforms = 5;
const wallW = 10;
const ballRadius = 20;
const targetW = 50;
const targetH = 10;

// matter.js setup
const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;

const engine = Engine.create();

const walls = [];

const players = ["player1", "player2"];

const balls = {
  player1: Bodies.circle(100, 0, ballRadius, { restitution: 0.7 }),
  player2: Bodies.circle(300, 0, ballRadius, { restitution: 0.7 }),
};

const boundaries = {};

let currentPlayer;
let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "ana_danit_fiona");
  shared = partyLoadShared("globals");
}

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);

  noStroke();
  walls.push(
    Bodies.rectangle(wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width - wallW / 2, height / 2, wallW, height, { isStatic: true }),
    Bodies.rectangle(width / 2, height / 2, wallW, height, { isStatic: true })
  );
  Composite.add(engine.world, walls);

  boundaries.player1 = {
    left: wallW / 2,
    right: width / 2 - wallW,
  };

  boundaries.player2 = {
    left: width / 2 + wallW,
    right: width - wallW / 2,
  };

  for (const player of players) {
    setPlayerData(player);
  }

  shared.player1.color = "red";
  shared.player2.color = "blue";

  currentPlayer = partyIsHost() ? "player1" : "player2";

  partySubscribe("dropBall", onBallDrop);
  partySubscribe("addPlatform", onPlatformAdded);
}

function draw() {
  Engine.update(engine);

  background("#f7f7ed");

  for (const player of players) {
    renderTarget(player);
    renderPlatforms(player);
    renderBall(player);
    updateState(player);
  }

  fill("black");
  text(shared.player1.points, 15, 20);
  text(shared.player2.points, width - 20, 20);

  for (const wall of walls) {
    rect(wall.position.x, wall.position.y, wallW, height);
  }
}

function onBallDrop({ player }) {
  if (!partyIsHost()) return;
  Composite.add(engine.world, [balls[player]]);
}

function onPlatformAdded({ player, x, y }) {
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
}

function keyPressed() {
  if (key === "b") {
    partyEmit("dropBall", { player: currentPlayer });
  }
}

function mousePressed() {
  if (shared[currentPlayer].platforms.length >= maxPlatforms) return;
  if (mouseX < boundaries[currentPlayer].left || mouseX > boundaries[currentPlayer].right) return;
  partyEmit("addPlatform", {
    player: currentPlayer,
    x: mouseX,
    y: mouseY,
  });
}

function setPlayerData(player) {
  shared[player] = {
    points: 0,
    platforms: [],
    ball: { x: random(boundaries[player].left, boundaries[player].right), y: 0 },
    target: { x: random(boundaries[player].left, boundaries[player].right), y: height - targetH / 2 },
  };
}
function renderBall(player) {
  if (partyIsHost()) {
    shared[player].ball.x = balls[player].position.x;
    shared[player].ball.y = balls[player].position.y;
  }
  fill(shared[player].color);
  ellipse(shared[player].ball.x, shared[player].ball.y, ballRadius);
}

function updateState(player) {
  if (balls[player].position.y > height) {
    Body.setPosition(balls[player], { x: random(boundaries[player].left, boundaries[player].right), y: 0 });
    Composite.remove(engine.world, [balls[player]]);
    if (partyIsHost()) {
      shared[player].platforms = [];
      shared[player].target.x = random(boundaries[player].left, boundaries[player].right);
      if (
        balls[player].position.x > shared[player].target.x &&
        balls[player].position.x < shared[player].target.x + targetW
      ) {
        shared[player].points++;
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
  fill("green");
  rect(shared[player].target.x, shared[player].target.y, targetW, targetH);
}
