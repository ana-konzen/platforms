import { changeScene, scenes } from "./main.js";
import { renderBackground } from "./background.js";

export function mousePressed() {
  changeScene(scenes.lobby);
}

export function draw() {
  renderBackground();

  textFont("Helvetica");
  textSize(60);
  textAlign(CENTER);
  fill("black");
  text("PLATFORMS", width / 2, height / 3);

  textSize(18);
  text("click to enter lobby", width / 2, height - 50);
}
