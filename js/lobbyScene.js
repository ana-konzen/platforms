import { changeScene, scenes } from "./main.js";
import { renderBackground } from "./background.js";
import { roleKeeper } from "./playScene.js";

let shared;

export function preload() {
  shared = partyLoadShared("shared", {
    state: "waiting",
    winner: "",
    player1: { platforms: [] },
    player2: { platforms: [] },
  });
}

export function setup() {}

export function enter() {
  if (partyIsHost()) {
    shared.status = "waiting";
  }
}

export function update() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];
  if (player1 && player2 && shared.status === "playing") {
    changeScene(scenes.play);
  }
}

export function mousePressed() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (mouseX < width * 0.5) {
    if (roleKeeper.myRole() === "player1") {
      roleKeeper.requestRole("unassigned");
    } else {
      roleKeeper.requestRole("player1");
    }
  }
  if (mouseX > width * 0.5) {
    if (roleKeeper.myRole() === "player2") {
      roleKeeper.requestRole("unassigned");
    } else {
      roleKeeper.requestRole("player2");
    }
  }

  if (roleKeeper.myRole() === "player1" && player1 && player2) {
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

  let roleText = "You are a guest";

  if (roleKeeper.myRole() === "player1") roleText = "You are player 1";
  if (roleKeeper.myRole() === "player2") roleText = "You are player 2";

  textSize(30);

  text(roleText, width * 0.5, height - 50);

  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (player1) {
    textSize(30);
    text("Player 1\nConnected", width * 0.25, height * 0.5);

    textSize(12);
    if (roleKeeper.myRole() === "player1") {
      text("Click to Leave", width * 0.25, height * 0.7);
    }
  } else {
    textSize(30);
    text("Click to Join", width * 0.25, height * 0.5);
  }
  if (player2) {
    textSize(30);
    text("Player 2\nConnected", width * 0.75, height * 0.5);

    textSize(12);
    if (roleKeeper.myRole() === "player2") {
      text("Click to Leave", width * 0.75, height * 0.7);
    }
  } else {
    textSize(30);
    text("Click to Join", width * 0.75, height * 0.5);
  }

  let startText = "waiting for players..";
  if (player1 && player2) {
    if (roleKeeper.myRole() === "player1") {
      startText = "click to start the game";
    } else {
      startText = "waiting for player 1 to start the game";
    }
  }

  if (shared.status !== "waiting") {
    startText = "game in progress";
  }

  textSize(18);
  textAlign(CENTER);
  text(startText, width / 2, height - 100);
}

export function exit() {}
