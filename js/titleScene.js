import { changeScene, scenes } from "./main.js";
import { renderBackground } from "./background.js";

const nPlayers = 2;

let guests, me, shared;

export function preload() {
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared();
  shared = partyLoadShared("shared");
}

export function setup() {
  console.log(guests);
  if (partyIsHost()) {
    me.name = "player1";
  } else {
    me.name = "player2";
  }
  shared.status = "waiting";
}

export function enter() {}

export function update() {
  if (shared.status === "playing") {
    changeScene(scenes.play);
  }
}

export function mousePressed() {
  if (partyIsHost() && guests.length === nPlayers) {
    shared.status = "playing";
  }
}

export function draw() {
  renderBackground();

  textFont("Helvetica");
  textSize(60);
  textAlign(CENTER);
  fill("black");
  text("PLATFORMS", width / 2, height / 3);

  textSize(18);
  let startText = "waiting for players..";
  if (guests.length === nPlayers) {
    if (partyIsHost()) {
      startText = "click to start the game";
    } else {
      startText = "waiting for host to start the game";
    }
  }
  if (guests.length > nPlayers) {
    startText = "there are too many players here to start the game";
  }

  textAlign(CENTER);
  text(startText, width / 2, height - 100);
}

export function exit() {}
