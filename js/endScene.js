import { changeScene, scenes } from "./main.js";
import { STYLE } from "./style.js";

let shared;
let me;
let bgImage;

export function preload() {
  shared = partyLoadShared("shared");
  me = partyLoadMyShared();
  bgImage = loadImage('assets/background.png');
}

export function setup() {}

export function enter() {}

export function update() {
  if (shared.status === "waiting") {
    changeScene(scenes.title);
  }
}

export function draw() {
  background(bgImage);
  
  textFont('Helvetica');
  textSize(72);
  textAlign(CENTER);
  fill('black');
  text(shared.winner === me.name ? "YOU WIN!" : "YOU LOSE!", width/2, height/3);
  
  textSize(24);
  text('Click to play again', width/2, height - 100);
}

export function mousePressed() {
  shared.status = "waiting";
}

export function exit() {}
