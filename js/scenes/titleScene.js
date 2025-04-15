import { changeScene, scenes } from "../main.js";
import { renderBackground } from "../background.js";

let titleAnimationStartTime = 0;
let titleAnimationStarted = false;
const titleAnimationDuration = 1000; 
const titleDelay = 300; 

const scrollSpeed = 2; 
let scrollPosition = 0;
let textWidthValue = 0; 

export function mousePressed() {
  changeScene(scenes.lobby);
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
  
  textFont("Helvetica");
  textSize(100);
  textAlign(CENTER);
  fill("#FFFDD0");
  
  const platTime = currentTime;
  const platProgress = constrain(platTime / titleAnimationDuration, 0, 1);
  const platStartX = -width/2;
  const platEndX = width/2;
  const platCurrentX = lerp(platStartX, platEndX, platProgress);
  text("PLAT", platCurrentX, height/5);
  
  const formsTime = currentTime - titleDelay;
  const formsProgress = constrain(formsTime / titleAnimationDuration, 0, 1);
  const formsStartX = -width/2;
  const formsEndX = width/1.5;
  const formsCurrentX = lerp(formsStartX, formsEndX, formsProgress);
  text("FORMS", formsCurrentX, height/2.7);

  textSize(18);
  textAlign(LEFT);
  
  scrollPosition -= scrollSpeed;
  
  const textToScroll = "CLICK TO ENTER LOBBY   ";
  
  for (let i = 0; i < 5; i++) {
    const xPos = scrollPosition + (i * textWidthValue);
    text(textToScroll, xPos, height - 20);
  }
  
  if (scrollPosition < -textWidthValue) {
    scrollPosition += textWidthValue;
  }
}
