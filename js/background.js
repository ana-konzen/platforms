export function renderBackground() {
  const rectW = 30;
  push();
  rectMode(CORNER);
  fill("#FFFDD0");
  rect(0, 0, width, height);
  fill("#AA113A");
  rect(width - rectW / 2, 0, rectW, height);
  fill("#DB3512");
  rect(width - rectW / 2 - rectW, 0, rectW, height);
  fill("#621E44");
  rect(width - rectW / 2 - rectW * 2, 0, rectW, height);
  fill("#EBC733");
  rect(width - rectW / 2 - rectW * 3, 0, rectW, height);
  fill("#C51923");
  rect(width - rectW / 2 - rectW * 4, 0, rectW, height);
  pop();
}
