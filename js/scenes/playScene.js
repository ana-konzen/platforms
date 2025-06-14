import { CONFIG } from "../config.js";
import { changeScene, scenes } from "../main.js";
import { makeId, getLevelName, randomPos } from "../util/util.js";
import { playerData } from "../player.js";
import { engine, Engine, Composite, Bodies, Events } from "../physics.js";
import { RoleKeeper } from "../util/RoleKeeper.js";
import { renderScene } from "../render.js";
import { shared } from "./titleScene.js";
import { FONTS, SOUNDS } from "../assets.js";

export let localPlayerKey;

export let roleKeeper;

let showInstructions = true;
let instructionsAnimStartTime;
const instructionsAnimDuration = 500;

export function preload() {
  roleKeeper = new RoleKeeper(["player1", "player2"], "unassigned");
  roleKeeper.setAutoAssign(false);
}

export function setup() {
  const buttonCont = createDiv()
    .addClass("button-cont")
    .style("width", width + "px")
    .style("height", height + "px");

  for (const playerKey in playerData) {
    const buttonX = playerKey === "player1" ? 0 : width - CONFIG.resetButtonW;

    // create reset button
    createButton("↻")
      .addClass("reset-button")
      .parent(buttonCont)
      .style("left", buttonX + "px")
      .style("width", CONFIG.resetButtonW + "px")
      .style("top", 0 + "px")
      .mousePressed(() => {
        partyEmit("hostReset", { playerKey, newLevel: false });
      });
  }

  rectMode(CENTER);

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((pair) => {
      const [A, B] = [pair.bodyA, pair.bodyB];

      if (A.label === "ball" || B.label === "ball") {
        SOUNDS.hit.play();
      }

      if (A.label === "ball" && B.label === "platform") {
        B.plugin.hit = true;
      } else if (B.label === "ball" && A.label === "platform") {
        A.plugin.hit = true;
      }
    });
  });

  // Events.on(engine, "collisionEnd", (event) => {
  //   event.pairs.forEach((pair) => {
  //     const [A, B] = [pair.bodyA, pair.bodyB];

  //     if (A.label === "ball" && B.label === "platform") {
  //       B.plugin.hit = false;
  //     } else if (B.label === "ball" && A.label === "platform") {
  //       A.plugin.hit = false;
  //     }
  //   });
  // });
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
        shared[playerKey].target.x <
          max(shared[playerKey].target.initialX - levelConfig.targetRange, player.boundaries.left) ||
        shared[playerKey].target.x >
          min(shared[playerKey].target.initialX + levelConfig.targetRange, player.boundaries.right)
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

  // Player 1 name on far left
  textFont(FONTS.player1Font);
  textSize(16);
  textAlign(LEFT, CENTER);
  fill("#FFFDD0");
  text(playerData.player1.name.toUpperCase(), CONFIG.resetButtonW + 20, CONFIG.headerHeight / 2);

  // Player 1 level near center-left
  textAlign(RIGHT, CENTER);
  text("LEVEL " + playerData.player1.level.toString(), width / 2 - 20, CONFIG.headerHeight / 2);

  // Player 2 level near center-right
  textFont(FONTS.player2Font);
  textAlign(LEFT, CENTER);
  text("LEVEL " + playerData.player2.level.toString(), width / 2 + 20, CONFIG.headerHeight / 2);

  // Player 2 name on far right
  textAlign(RIGHT, CENTER);
  text(playerData.player2.name.toUpperCase(), width - CONFIG.resetButtonW - 20, CONFIG.headerHeight / 2);

  pop();

  if (showInstructions) drawInstructions();
  if (!showInstructions) select(".button-cont").style("display", "block");
}

export function enter() {
  SOUNDS.gameStart.play();

  for (const playerKey in playerData) {
    createWalls(playerData[playerKey]);
  }

  if (partyIsHost()) {
    shared.status = "playing";
    // Initialize shared state for each player
    for (const playerKey in playerData) {
      if (!shared[playerKey]) {
        shared[playerKey] = {
          ball: {
            initialX: randomPos(playerData[playerKey].boundaries),
            y: CONFIG.headerHeight,
          },
          target: {
            y: height - CONFIG.level1.targetH / 2 - 10,
          },
          color: playerData[playerKey].color,
        };
      }
    }
  }

  localPlayerKey = roleKeeper.myRole();

  // Only emit hostReset after shared state is initialized
  if (partyIsHost()) {
    for (const playerKey in playerData) {
      partyEmit("hostReset", { playerKey });
    }
  }

  showInstructions = true;
  instructionsAnimStartTime = millis();
}

export function exit() {
  for (const playerKey in playerData) {
    removeWalls(playerData[playerKey]);
  }
  select(".button-cont").style("display", "none");
}

export function keyPressed() {
  const player = playerData[localPlayerKey];
  if (key === "b" || key === "B") {
    if (player.ballDropped) return;
    for (const platform of player.platforms) {
      platform.selected = false;
    }
    SOUNDS.ballDrop.play();
    partyEmit("dropBall", { player: localPlayerKey });
  }
  if (keyCode === LEFT_ARROW) {
    for (const platform of player.platforms) {
      if (platform.selected) {
        SOUNDS.rotate.play();
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
        SOUNDS.rotate.play();
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
  if (showInstructions) return;
  const player = playerData[localPlayerKey];
  for (const platform of player.platforms) {
    platform.selected = false;
  }
  if (player.ballDropped) return;
  if (mouseX < player.boundaries.left || mouseX > player.boundaries.right) return;

  for (const platform of player.platforms) {
    if (platform.found) {
      SOUNDS.place.play();
      platform.selected = true;
      return;
    }
  }

  if (player.platforms.length >= CONFIG.maxPlatforms) return;

  SOUNDS.place.play();

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
    if (isOnTarget(player) && !player.hitTarget) {
      player.hitTarget = true;
      SOUNDS.nextLevel.play();
      if (partyIsHost()) {
        // console.log("hit target check 2", player.key);
        partyEmit("targetHit", { playerKey: player.key });
      }
    } else {
      // player.hitTarget = false;
      if (!SOUNDS.nextLevel.isPlaying()) {
        SOUNDS.targetMiss.play();
      }
      partyEmit("hostReset", { playerKey: player.key, newLevel: false });
    }
  }
}

function isOnTarget(player) {
  // console.log("hit target", player.key);
  const levelConfig = CONFIG[getLevelName(player.level)];
  return (
    player.ball.position.x >= shared[player.key].target.x - levelConfig.targetW / 2 - CONFIG.ballRadius &&
    player.ball.position.x <= shared[player.key].target.x + levelConfig.targetW / 2 + CONFIG.ballRadius
  );
}

function createWalls(player) {
  const wallOptions = {
    isStatic: true,
    label: "wall",
  };
  player.walls = [
    Bodies.rectangle(player.boundaries.left, height / 2, CONFIG.wallW, height, wallOptions),
    Bodies.rectangle(player.boundaries.right, height / 2, CONFIG.wallW, height, wallOptions),
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
    textFont("Helvetica");
    text("CLICK AND DRAG TO PLACE PLATFORMS", width / 2, height / 2 - 40);
    text("YOU CAN ONLY PLACE 5 PLATFORMS!", width / 2, height / 2);
    text("USE ARROW KEYS TO ROTATE PLATFORMS", width / 2, height / 2 + 40);
    text("PRESS 'B' TO DROP THE BALL", width / 2, height / 2 + 80);
    text("ADVANCE TO NEXT LEVEL ONCE BALL HITS TARGET", width / 2, height / 2 + 120);

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
