import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";
import { FONTS, SOUNDS } from "../assets.js";
import { CONFIG } from "../config.js";

let titleAnimationStartTime = 0;
let titleAnimationStarted = false;
const titleAnimationDuration = 1000;
const titleDelay = 300;

const scrollSpeed = 2;
let scrollPosition = 0;
let textWidthValue = 0;

export let shared;

export function mousePressed() {
  if (shared.state === "waiting") changeScene(scenes.lobby);
}

export function preload() {
  shared = partyLoadShared("shared", {
    state: "waiting",
    winner: "",
    player1: { name: "" },
    player2: { name: "" },
    exitAnimationStarted: false,
    exitAnimationStartTime: 0,
  });
}

export function setup() {
  createDiv()
    .addClass("easy-cont")
    .style("width", width + "px")
    .style("height", height + "px");
}

export function enter() {
  if (!SOUNDS.title.isPlaying()) {
    SOUNDS.title.loop();
  }
  if (partyIsHost()) {
    shared.status = "waiting";
  }
}

export function mouseMoved() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
    if (!SOUNDS.title.isPlaying()) {
      SOUNDS.title.loop();
    }
  }
}

export function keyPressed() {
  if (partyIsHost()) {
    if (key === "e" || key === "E") {
      // toggle easy mode
      CONFIG.easyMode = !CONFIG.easyMode;
      console.log("Easy mode:", CONFIG.easyMode);
      if (CONFIG.easyMode) {
        select(".easy-cont").style("display", "block");
      } else {
        select(".easy-cont").style("display", "none");
      }
    }
  }
}

export function draw() {
  renderBackground();

  if (!titleAnimationStarted) {
    titleAnimationStartTime = millis();
    titleAnimationStarted = true;

    textSize(18);
    textFont(FONTS.basicFont);
    textWidthValue = textWidth("CLICK TO ENTER LOBBY   ") + 20;
  }

  const currentTime = millis() - titleAnimationStartTime;

  textSize(130);
  textAlign(CENTER);
  fill("#FFFDD0");

  const platTime = currentTime;
  const platProgress = constrain(platTime / titleAnimationDuration, 0, 1);
  const platStartX = -width / 2;
  const platEndX = width / 2 - 100;
  const platCurrentX = lerp(platStartX, platEndX, platProgress);
  textFont(FONTS.platFont);
  text("PLAT", platCurrentX, height / 5);

  const formsTime = currentTime - titleDelay;
  const formsProgress = constrain(formsTime / titleAnimationDuration, 0, 1);
  const formsStartX = -width / 2;
  const formsEndX = width / 1.5 - 100;
  const formsCurrentX = lerp(formsStartX, formsEndX, formsProgress);
  textFont(FONTS.formsFont);
  text("FORMS", formsCurrentX, height / 2.7);

  textSize(18);
  textAlign(LEFT);
  textFont(FONTS.basicFont);

  scrollPosition -= scrollSpeed;

  const textToScroll = shared.state === "waiting" ? "CLICK TO ENTER LOBBY   " : "GAME IN PROGRESS   ";

  for (let i = 0; i < 5; i++) {
    const xPos = scrollPosition + i * textWidthValue;
    text(textToScroll, xPos, height - 20);
  }

  if (scrollPosition < -textWidthValue) {
    scrollPosition += textWidthValue;
  }
}
