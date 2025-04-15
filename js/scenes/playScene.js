import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId } from "../util/util.js";
import { playerData } from "../player.js";
import { engine, Engine, Composite, Bodies } from "../physics.js";
import { RoleKeeper } from "../util/RoleKeeper.js";
import { renderScene } from "../render.js";

let shared;

let localPlayerKey;

export let roleKeeper;

let showInstructions = true;
let instructionsAnimStartTime;
const instructionsAnimDuration = 500;

let player1font, player2font;

export function preload() {
  shared = partyLoadShared("globals");
  roleKeeper = new RoleKeeper(["player1", "player2"], "unassigned");
  roleKeeper.setAutoAssign(false);
  player1font = loadFont("../../NeueTelevisionS-BlackW50P0.otf");
  player2font = loadFont("../../NeueTelevisionS-BlackW50P50.otf");
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

  push();
  fill(0);
  noStroke();
  const headerHeight = 40;
  rect(width / 2, headerHeight / 2, width, headerHeight);

  textFont(player1font);
  textSize(16);
  textAlign(LEFT, CENTER);
  fill("#FFFDD0");
  text(playerData.player1.name.toUpperCase(), 20, headerHeight / 2);

  textFont(player2font);
  textAlign(RIGHT, CENTER);
  text(playerData.player2.name.toUpperCase(), width - 20, headerHeight / 2);

  textAlign(CENTER, CENTER);
  text("LEVEL 1", width / 2, headerHeight / 2);
  pop();

  drawInstructions();
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

  showInstructions = true;
  instructionsAnimStartTime = millis();
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
          shared.winner = player.name;
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

function drawInstructions() {
  if (!showInstructions) return;

  const currentTime = millis() - instructionsAnimStartTime;
  const progress = constrain(currentTime / instructionsAnimDuration, 0, 1);
  const easedProgress = 1 - pow(1 - progress, 3);

  push();
  fill(0, 0, 0, 200);
  noStroke();
  rect(width / 2, height / 2, width * easedProgress, height * easedProgress);

  if (progress === 1) {
    fill("#FFFDD0");
    textAlign(CENTER, CENTER);
    textSize(24);
    text("HOW TO PLAY", width / 2, height / 2 - 100);

    textSize(16);
    text("CLICK AND DRAG TO PLACE PLATFORMS", width / 2, height / 2 - 40);
    text("USE ARROW KEYS TO ROTATE PLATFORMS", width / 2, height / 2);
    text("PRESS 'B' TO DROP THE BALL", width / 2, height / 2 + 40);
    text("ADVANCE TO NEXT LEVEL ONCE BALL HITS TARGET", width / 2, height / 2 + 80);

    // Draw X button
    const buttonX = width / 2 + 200;
    const buttonY = height / 2 - 100;
    const buttonRadius = 15;
    const xSize = 8;

    stroke("#FFFDD0");
    strokeWeight(2);
    noFill();
    circle(buttonX, buttonY, buttonRadius * 2);
    line(buttonX - xSize, buttonY - xSize, buttonX + xSize, buttonY + xSize);
    line(buttonX - xSize, buttonY + xSize, buttonX + xSize, buttonY - xSize);

    if (mouseIsPressed && dist(mouseX, mouseY, buttonX, buttonY) < buttonRadius) {
      showInstructions = false;
    }
  }
  pop();
}
