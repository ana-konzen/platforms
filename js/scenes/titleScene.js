import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";

let titleAnimationStartTime = 0;
let titleAnimationStarted = false;
const titleAnimationDuration = 1000;
const titleDelay = 300;

const scrollSpeed = 2;
let scrollPosition = 0;
let textWidthValue = 0;

export let platFont;
export let formsFont;
export let basicFont;

export function mousePressed() {
  changeScene(scenes.lobby);
}

export function preload() {
  platFont = loadFont("../../NeueTelevision-RetroUltraBoldW50P0.otf");
  formsFont = loadFont("../../NeueTelevision-RetroUltraBoldW50P50.otf");
  basicFont = loadFont("../../NeueTelevisionS-BlackW50P50.otf");
}

export function draw() {
  renderBackground();

  if (!titleAnimationStarted) {
    titleAnimationStartTime = millis();
    titleAnimationStarted = true;

    textSize(18);
    textFont("Helvetica");
    textWidthValue = textWidth("CLICK TO ENTER LOBBY   ");
  }

  const currentTime = millis() - titleAnimationStartTime;

  textSize(130);
  textAlign(CENTER);
  fill("#FFFDD0");

  const platTime = currentTime;
  const platProgress = constrain(platTime / titleAnimationDuration, 0, 1);
  const platStartX = -width / 2;
  const platEndX = width / 2;
  const platCurrentX = lerp(platStartX, platEndX, platProgress);
  textFont(platFont);
  text("PLAT", platCurrentX - 50, height / 5);

  const formsTime = currentTime - titleDelay;
  const formsProgress = constrain(formsTime / titleAnimationDuration, 0, 1);
  const formsStartX = -width / 2;
  const formsEndX = width / 1.5;
  const formsCurrentX = lerp(formsStartX, formsEndX, formsProgress);
  textFont(formsFont);
  text("FORMS", formsCurrentX - 50, height / 2.7);

  textSize(18);
  textAlign(LEFT);
  textFont(basicFont);

  scrollPosition -= scrollSpeed;

  const textToScroll = "CLICK TO ENTER LOBBY   ";

  for (let i = 0; i < 5; i++) {
    const xPos = scrollPosition + i * textWidthValue;
    text(textToScroll, xPos, height - 20);
  }

  if (scrollPosition < -textWidthValue) {
    scrollPosition += textWidthValue;
  }
}
