import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";

let shared;
const scrollSpeed = 2;
let scrollPosition = 0;
let textWidthValue = 0;
let endAnimationStartTime = 0;
let endAnimationStarted = false;
const endAnimationDuration = 1000;
const endDelay = 300;

export function preload() {
  shared = partyLoadShared("globals");
}

export function setup() {
  textSize(18);
  textFont("Helvetica");
  textWidthValue = textWidth("CLICK TO PLAY AGAIN   ");
}

export function enter() {
  endAnimationStarted = false;
}

export function update() {
  if (shared.status === "waiting") {
    changeScene(scenes.title);
  }
}

export function draw() {
  renderBackground();

  if (!endAnimationStarted) {
    endAnimationStartTime = millis();
    endAnimationStarted = true;
    
    textSize(18);
    textFont("Helvetica");
    textWidthValue = textWidth("CLICK TO PLAY AGAIN   ");
  }

  textFont("Helvetica");
  textSize(100);
  textAlign(CENTER);
  fill("#FFFDD0");
  
  const currentTime = millis() - endAnimationStartTime;
  
  const winnerTime = currentTime;
  const winnerProgress = constrain(winnerTime / endAnimationDuration, 0, 1);
  const winnerStartX = -width/2;
  const winnerEndX = width/2;
  const winnerCurrentX = lerp(winnerStartX, winnerEndX, winnerProgress);
  text(`${shared.winner.toUpperCase()}`, winnerCurrentX, height/5);
  
  const winsTime = currentTime - endDelay;
  const winsProgress = constrain(winsTime / endAnimationDuration, 0, 1);
  const winsStartX = -width/2;
  const winsEndX = width/1.5;
  const winsCurrentX = lerp(winsStartX, winsEndX, winsProgress);
  text(`WINS`, winsCurrentX, height/2.7);

  textSize(18);
  textAlign(LEFT);
  
  scrollPosition -= scrollSpeed;
  
  const textToScroll = "CLICK TO PLAY AGAIN   ";
  
  for (let i = 0; i < 5; i++) {
    const xPos = scrollPosition + (i * textWidthValue);
    text(textToScroll, xPos, height - 20);
  }
  
  if (scrollPosition < -textWidthValue) {
    scrollPosition += textWidthValue;
  }
}

export function mousePressed() {
  shared.status = "waiting";
}

export function exit() {
  shared.winner = "";
}
