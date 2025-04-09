import { changeScene, scenes } from "./main.js";
import { STYLE } from "./style.js";

let shared;
let me;
let bgImage;

export function preload() {
  shared = partyLoadShared("globals");
  me = partyLoadMyShared();
  bgImage = loadImage("assets/background.png");
}

export function setup() {}

export function enter() {
  console.log(shared.winner);
}

export function update() {
  if (shared.status === "waiting") {
    changeScene(scenes.title);
  }
}

export function draw() {
  background(bgImage);

  textFont("Helvetica");
  textSize(40);
  textAlign(CENTER);
  fill("black");
  text(`${shared.winner} wins`, width / 2, height / 3);

  textSize(18);
  text("click to play again", width / 2, height - 100);
}

export function mousePressed() {
  shared.status = "waiting";
}

export function exit() {}
