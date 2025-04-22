import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId, getLevelName } from "../util/util.js";
import { playerData } from "../player.js";
import { engine, Engine, Composite, Bodies } from "../physics.js";
import { RoleKeeper } from "../util/RoleKeeper.js";
import { renderScene } from "../render.js";
import { shared } from "./titleScene.js";

let localPlayerKey;

export let roleKeeper;

let showInstructions = true;
let instructionsAnimStartTime;
const instructionsAnimDuration = 500;

let player1font, player2font;

export function preload() {
  roleKeeper = new RoleKeeper(["player1", "player2"], "unassigned");
  roleKeeper.setAutoAssign(false);
  player1font = loadFont("../../fonts/NeueTelevisionS-BlackW50P0.otf");
  player2font = loadFont("../../fonts/NeueTelevisionS-BlackW50P50.otf");
}

export function setup() {
  for (const playerKey in playerData) {
    const resetButton = createButton("Reset");
    const buttonX = playerKey === "player1" ? 50 : width - 50;
    resetButton.position(buttonX, 10);
    resetButton.addClass("resetButton");
    resetButton.mousePressed(() => {
      partyEmit("hostReset", { playerKey });
    });
  }

  rectMode(CENTER);
}

export function update() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (!player1 || !player2) {
    if (partyIsHost()) {
      shared.status = "waiting";
    }
  }

  if (shared.status === "waiting") {
    changeScene(scenes.title);
  }

  if (shared.status === "end") {
    changeScene(scenes.end);
  }

  Engine.update(engine);

  for (const playerKey in playerData) {
    const player = playerData[playerKey];
    const levelConfig = CONFIG[getLevelName(player.level)];

    if (levelConfig.targetMoving && partyIsHost()) {
      shared[playerKey].target.x += player.targetSpeed;

      if (
        shared[playerKey].target.x < shared[playerKey].target.initialX - levelConfig.targetRange ||
        shared[playerKey].target.x > shared[playerKey].target.initialX + levelConfig.targetRange
      ) {
        player.targetSpeed *= -1;
      }
    }

    updateState(player);
  }
}

export function draw() {
  rectMode(CENTER);

  for (const playerKey in playerData) {
    renderScene(playerData[playerKey]);
  }

  push();
  fill(0);
  noStroke();
  rect(width / 2, CONFIG.headerHeight / 2, width, CONFIG.headerHeight);

  textFont(player1font);
  textSize(16);
  textAlign(LEFT, CENTER);
  fill("#FFFDD0");
  text(playerData.player1.name.toUpperCase(), 20, CONFIG.headerHeight / 2);

  textFont(player2font);
  textAlign(RIGHT, CENTER);
  text(playerData.player2.name.toUpperCase(), width - 20, CONFIG.headerHeight / 2);

  textAlign(CENTER, CENTER);
  text("LEVEL 1", width / 2, CONFIG.headerHeight / 2);
  pop();

  drawInstructions();
}

export function enter() {
  for (const playerKey in playerData) {
    createWalls(playerData[playerKey]);
  }

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
  for (const playerKey in playerData) {
    removeWalls(playerData[playerKey]);
  }
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
  if (player.platforms.length >= CONFIG[getLevelName(player.level)].maxPlatforms) return;
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

function updateState(player) {
  if (player.ball.position.y > height) {
    if (isOnTarget(player)) {
      if (player.level < CONFIG.numLevels) {
        player.level++;
        player.targetSpeed = CONFIG[getLevelName(player.level)].targetSpeed;
        console.log("level up", player.key, player.level);
      } else {
        if (partyIsHost()) {
          shared.winner = player.name;
          shared.status = "end";
        }
      }
    }
    if (partyIsHost()) {
      partyEmit("hostReset", { playerKey: player.key });
    }
  }
}

function isOnTarget(player) {
  console.log("hit target", player.key);
  const levelConfig = CONFIG[getLevelName(player.level)];
  return (
    player.ball.position.x - CONFIG.ballRadius >= shared[player.key].target.x - levelConfig.targetW / 2 &&
    player.ball.position.x + CONFIG.ballRadius <= shared[player.key].target.x + levelConfig.targetW / 2
  );
}

function createWalls(player) {
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, CONFIG.wallW, height, { isStatic: true }),
    Bodies.rectangle(player.boundaries.right, height / 2, CONFIG.wallW, height, { isStatic: true }),
  ];

  Composite.add(engine.world, player.walls);
}

function removeWalls(player) {
  for (const wall of player.walls) {
    Composite.remove(engine.world, wall);
  }
  player.walls = [];
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
