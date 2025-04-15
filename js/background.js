let animationStartTime = 0;
let animationStarted = false;
const animationDuration = 1000; 
const barDelay = 200; 

export function renderBackground() {
  noStroke();
  const rectW = 30;
  
  if (!animationStarted) {
    animationStartTime = millis();
    animationStarted = true;
  }
  
  const currentTime = millis() - animationStartTime;
  
  push();
  rectMode(CORNER);
  
  fill("#000000");
  rect(0, 0, width, height);
  
  const colors = ["#AA113A", "#DB3512", "#621E44", "#EBC733", "#C51923"];
  const positions = [4, 3, 2, 1, 0];
  
  for (let i = 0; i < colors.length; i++) {
    const barTime = currentTime - (i * barDelay);
    const progress = constrain(barTime / animationDuration, 0, 1);
    
    const startY = -height;
    const endY = 0;
    const currentY = lerp(startY, endY, progress);
    
    if (barTime > 0) {
      fill(colors[i]);
      rect(
        width - rectW / 2 - rectW * positions[i], 
        currentY, 
        rectW, 
        height
      );
    }
  }
  
  pop();
}
