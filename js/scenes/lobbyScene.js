import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";
import { roleKeeper } from "./playScene.js";
import { playerData } from "../player.js";
import { CONFIG } from "../config.js";

let shared;
let nameInput;
let nameInputContainer;
let isEnteringName = false;
let currentPlayerRole = null;
let dotCounter = 0;
let platform1AnimationStarted = false;
let platform2AnimationStarted = false;
let platform1AnimationStartTime;
let platform2AnimationStartTime;
let platformAnimationDuration = 800; 
let exitAnimationStarted = false;
let exitAnimationStartTime = 0;
const exitAnimationDuration = 1000;
const exitDelay = 300;

export function preload() {
  shared = partyLoadShared("shared", {
    state: "waiting",
    winner: "",
    player1: { name: "" },
    player2: { name: "" },
  });
}

export function setup() {
  if (!playerData.player1) playerData.player1 = { name: "" };
  if (!playerData.player2) playerData.player2 = { name: "" };

  nameInputContainer = createDiv('');
  nameInputContainer.class('name-input-container');
  
  const welcomeText = createDiv('WELCOME');
  welcomeText.class('instruction-text welcome-text');
  
  nameInput = createInput('');
  nameInput.id('nameInput');
  nameInput.attribute('placeholder', 'ENTER YOUR NAME');
  
  const submitButton = createButton('SUBMIT');
  submitButton.class('submit-button');
  
  nameInputContainer.child(welcomeText);
  nameInputContainer.child(nameInput);
  nameInputContainer.child(submitButton);
  
  const handleSubmit = () => {
    const playerName = nameInput.value().trim();
    console.log('Submitting name:', playerName);
    console.log('Current role:', currentPlayerRole);
    
    if (playerName) {
      if (currentPlayerRole === "player1") {
        playerData.player1.name = playerName;
        shared.player1.name = playerName;
        platform1AnimationStarted = false; 
        console.log('Set player1 name to:', playerData.player1.name);
      } else if (currentPlayerRole === "player2") {
        playerData.player2.name = playerName;
        shared.player2.name = playerName;
        platform2AnimationStarted = false; 
        console.log('Set player2 name to:', playerData.player2.name);
      }
      
      nameInputContainer.style('display', 'none');
      isEnteringName = false;
      roleKeeper.requestRole(currentPlayerRole);
      console.log('Role requested:', currentPlayerRole);
    }
  };
  
  submitButton.elt.addEventListener('click', (event) => {
    event.preventDefault(); 
    event.stopPropagation(); 
    console.log('Submit button clicked');
    handleSubmit();
  });
  
  nameInput.elt.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed');
      handleSubmit();
    }
  });
}

export function enter() {
  if (partyIsHost()) {
    shared.status = "waiting";
  }
  isEnteringName = false;
  currentPlayerRole = null;
  nameInputContainer.style('display', 'none');
  platform1AnimationStarted = false;
  platform2AnimationStarted = false;
}

export function update() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];
  
  playerData.player1.name = shared.player1.name;
  playerData.player2.name = shared.player2.name;
  
  if (player1 && player2 && exitAnimationStarted) {
    const currentTime = millis() - exitAnimationStartTime;
    if (currentTime >= exitAnimationDuration + exitDelay) {
      shared.status = "playing";
      changeScene(scenes.play);
    }
  }
}

const handleUnassign = () => {
  roleKeeper.requestRole("unassigned");
  if (currentPlayerRole === "player1") {
    shared.player1.name = "";
    platform1AnimationStarted = false;
  } else if (currentPlayerRole === "player2") {
    shared.player2.name = "";
    platform2AnimationStarted = false;
  }
  nameInput.value('');
  currentPlayerRole = null;
};

export function mousePressed() {
  if (isEnteringName && mouseY > nameInputContainer.elt.offsetTop && 
      mouseY < nameInputContainer.elt.offsetTop + nameInputContainer.elt.offsetHeight &&
      mouseX > nameInputContainer.elt.offsetLeft && 
      mouseX < nameInputContainer.elt.offsetLeft + nameInputContainer.elt.offsetWidth) {
    return;
  }
  
  if (isEnteringName) return;

  const buttonRadius = 8;

  if (roleKeeper.myRole() === "player1") {
    textSize(30);
    const nameWidth = textWidth(shared.player1.name.toUpperCase());
    const buttonX = width * 0.35 - nameWidth/2 - 15;
    const buttonY = height * 0.6 - 20 - 10;
    if (dist(mouseX, mouseY, buttonX, buttonY) < buttonRadius) {
      currentPlayerRole = "player1";
      handleUnassign();
      return;
    }
  }

  if (roleKeeper.myRole() === "player2") {
    textSize(30);
    const nameWidth = textWidth(shared.player2.name.toUpperCase());
    const buttonX = width * 0.65 - nameWidth/2 - 15;
    const buttonY = height * 0.6 - 20 - 10;
    if (dist(mouseX, mouseY, buttonX, buttonY) < buttonRadius) {
      currentPlayerRole = "player2";
      handleUnassign();
      return;
    }
  }
  
  if (mouseX < width * 0.5) {
    if (!roleKeeper.guestsWithRole("player1")[0]) {
      isEnteringName = true;
      currentPlayerRole = "player1";
      nameInputContainer.style('display', 'flex');
      nameInput.elt.focus();
    }
  }
  if (mouseX > width * 0.5) {
    if (!roleKeeper.guestsWithRole("player2")[0]) {
      isEnteringName = true;
      currentPlayerRole = "player2";
      nameInputContainer.style('display', 'flex');
      nameInput.elt.focus();
    }
  }
}

export function keyPressed() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];
  if (roleKeeper.myRole() === "player1" && player1 && player2 && !exitAnimationStarted) {
    exitAnimationStarted = true;
    exitAnimationStartTime = millis();
  }
}

function drawCloseButton(x, y) {
  push();
  const buttonRadius = 8;
  const xSize = 5;

  stroke("#FFFDD0");
  strokeWeight(1);
  noFill();
  circle(x, y, buttonRadius * 2);
  
  line(x - xSize, y - xSize, x + xSize, y + xSize);
  line(x - xSize, y + xSize, x + xSize, y - xSize);
  pop();
}

function drawPlatform(x, y, width, height, isEmpty, isPlayer1) {
  push();
  
  noStroke();
  rectMode(CENTER);
  
  if (isEmpty) {
    fill(CONFIG.platformColor);
  } else {
    fill(isPlayer1 ? CONFIG.player1Color : CONFIG.player2Color);
  }
  
  if (isPlayer1 && !platform1AnimationStarted) {
    platform1AnimationStartTime = millis();
    platform1AnimationStarted = true;
  } else if (!isPlayer1 && !platform2AnimationStarted) {
    platform2AnimationStartTime = millis();
    platform2AnimationStarted = true;
  }
  
  let finalScale = 1;
  if (isEmpty) {
    finalScale = 1 + 0.03 * sin(frameCount * 0.05);
  }
  
  if ((isPlayer1 && platform1AnimationStarted) || (!isPlayer1 && platform2AnimationStarted)) {
    const animationStartTime = isPlayer1 ? platform1AnimationStartTime : platform2AnimationStartTime;
    const animationProgress = constrain((millis() - animationStartTime) / platformAnimationDuration, 0, 1);
    const easedProgress = 1 - pow(1 - animationProgress, 3);
    finalScale *= 0.3 + (0.7 * easedProgress); 
  }
  
  translate(x, y);
  scale(finalScale);
  translate(-x, -y);
  rect(x, y, width, height, height / 2);
  
  pop();
}

export function draw() {
  renderBackground();

  push();
  textFont("Helvetica");
  textAlign(CENTER);
  textSize(100);
  fill("#FFFDD0");
  
  if (!exitAnimationStarted) {
    text("PLAT", width / 2, height / 5);
    text("FORMS", width/1.5, height / 2.7);
  } else {
    const currentTime = millis() - exitAnimationStartTime;
    
    const platTime = currentTime;
    const platProgress = constrain(platTime / exitAnimationDuration, 0, 1);
    const platStartX = width/2;
    const platEndX = -width/2;
    const platCurrentX = lerp(platStartX, platEndX, platProgress);
    text("PLAT", platCurrentX, height/5);
    
    const formsTime = currentTime - exitDelay;
    const formsProgress = constrain(formsTime / exitAnimationDuration, 0, 1);
    const formsStartX = width/1.5;
    const formsEndX = -width/2;
    const formsCurrentX = lerp(formsStartX, formsEndX, formsProgress);
    text("FORMS", formsCurrentX, height/2.7);
  }
  pop();

  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  const platformWidth = CONFIG.platformW * 4.5;
  
  if (player1) {
    drawPlatform(width * 0.35, height * 0.6, platformWidth, CONFIG.platformH * 1.5, false, true);
    
    push();
    textAlign(CENTER);
    fill("#FFFDD0");
    textSize(30);
    
    const nameWidth = textWidth(shared.player1.name.toUpperCase());
    text(shared.player1.name.toUpperCase(), width * 0.35, height * 0.6 - 20);
    
    textSize(16);
    text("CONNECTED", width * 0.35, height * 0.6 + 35);

    if (roleKeeper.myRole() === "player1") {
      const buttonX = width * 0.35 - nameWidth/2 - 15;
      const buttonY = height * 0.6 - 20 - 10;
      drawCloseButton(buttonX, buttonY);
    }
    pop();
  } else {
    drawPlatform(width * 0.35, height * 0.6, platformWidth, CONFIG.platformH * 1.5, true, true);
    
    push();
    textAlign(CENTER);
    fill("#FFFDD0");
    textSize(16);
    text("CLICK TO JOIN", width * 0.35, height * 0.6 + 30);
    pop();
  }
  
  if (player2) {
    drawPlatform(width * 0.65, height * 0.6, platformWidth, CONFIG.platformH * 1.5, false, false);
    
    push();
    textAlign(CENTER);
    fill("#FFFDD0");
    textSize(30);
    
    const nameWidth = textWidth(shared.player2.name.toUpperCase());
    text(shared.player2.name.toUpperCase(), width * 0.65, height * 0.6 - 20);
    
    textSize(16);
    text("CONNECTED", width * 0.65, height * 0.6 + 35);

    if (roleKeeper.myRole() === "player2") {
      const buttonX = width * 0.65 - nameWidth/2 - 15;
      const buttonY = height * 0.6 - 20 - 10;
      drawCloseButton(buttonX, buttonY);
    }
    pop();
  } else {
    drawPlatform(width * 0.65, height * 0.6, platformWidth, CONFIG.platformH * 1.5, true, false);
    
    push();
    textAlign(CENTER);
    fill("#FFFDD0");
    textSize(16);
    text("CLICK TO JOIN", width * 0.65, height * 0.6 + 30);
    pop();
  }

  let startText = "WAITING FOR PLAYERS";
  if (player1 && player2) {
    if (roleKeeper.myRole() === "player1") {
      startText = "PRESS ANY KEY TO START THE GAME";
    } else {
      const player1Name = shared.player1.name || "other player";
      startText = `WAITING FOR ${player1Name.toUpperCase()} TO START THE GAME`;
    }
  }

  if (shared.status !== "waiting") {
    startText = "GAME IN PROGRESS";
  }

  dotCounter = (dotCounter + 1) % 180; 
  const dots = ".".repeat(Math.floor(dotCounter / 60) + 1);
  
  push();
  textAlign(CENTER);
  textSize(18);
  fill("#FFFDD0");
  text(startText + dots, width / 2, height - 20);
  pop();
  
  if (isEnteringName) {
    nameInputContainer.style('display', 'flex');
  }
}

export function exit() {
  nameInputContainer.style('display', 'none');
}
