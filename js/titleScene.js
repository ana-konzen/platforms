import { changeScene, scenes } from "./main.js";

//add thing that shows active players

export function preload() {}

export function setup() {
  select("#startButton").mousePressed(() => {
    changeScene(scenes.play);
  });
}

export function enter() {
  select("#startScreen").style("display", "block");
}

export function update() {}

export function draw() {}

export function exit() {
  select("#startScreen").style("display", "none");
}
