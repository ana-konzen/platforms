import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";
import { shared } from "./titleScene.js";
import { roleKeeper } from "./playScene.js";
import { playerData } from "../player.js";
import { FONTS, SOUNDS } from "../assets.js";

const scrollSpeed = 2;
let scrollPosition = 0;
let textWidthValue = 0;
let endAnimationStartTime = 0;
let endAnimationStarted = false;
const endAnimationDuration = 1000;
const endDelay = 300;

export function setup() {
  textSize(18);
  textFont("Helvetica");
  textWidthValue = textWidth("CLICK TO PLAY AGAIN   ");
}

export function enter() {
  endAnimationStarted = false;
  SOUNDS.win.play();
}

export function update() {
  if (shared.status === "waiting") {
    changeScene(scenes.title);
  }
}

export function draw() {
  renderBackground();

  const textToScroll = partyIsHost() ? "CLICK TO PLAY AGAIN   " : "WAITING FOR HOST TO RESTART   ";

  if (!endAnimationStarted) {
    endAnimationStartTime = millis();
    endAnimationStarted = true;

    textSize(18);
    // textFont("Helvetica");
    textFont(FONTS.platFont);

    textWidthValue = textWidth(textToScroll);
  }

  // textFont("Helvetica");
  textFont(FONTS.platFont);

  textSize(100);
  textAlign(CENTER);
  fill("#FFFDD0");

  const currentTime = millis() - endAnimationStartTime;

  const winnerTime = currentTime;
  const winnerProgress = constrain(winnerTime / endAnimationDuration, 0, 1);
  const winnerStartX = -width / 2;
  const winnerEndX = width / 2;
  const winnerCurrentX = lerp(winnerStartX, winnerEndX, winnerProgress);
  text(`${shared.winner.toUpperCase()}`, winnerCurrentX, height / 5);

  const winsTime = currentTime - endDelay;
  const winsProgress = constrain(winsTime / endAnimationDuration, 0, 1);
  const winsStartX = -width / 2;
  const winsEndX = width / 1.5;
  const winsCurrentX = lerp(winsStartX, winsEndX, winsProgress);
  textFont(FONTS.formsFont);
  text(`WINS`, winsCurrentX, height / 2.7);

  textSize(18);
  textAlign(LEFT);

  scrollPosition -= scrollSpeed;

  textFont(FONTS.basicFont);

  for (let i = 0; i < 5; i++) {
    const xPos = scrollPosition + i * textWidthValue;
    text(textToScroll, xPos, height - 20);
  }

  if (scrollPosition < -textWidthValue) {
    scrollPosition += textWidthValue;
  }
}

export function mousePressed() {
  if (partyIsHost()) shared.status = "waiting";
}

export function exit() {
  roleKeeper.requestRole("unassigned");
  for (const playerKey in playerData) {
    playerData[playerKey].level = 1;
  }
  if (partyIsHost()) shared.winner = "";
}
