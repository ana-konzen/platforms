export function makeId() {
  return Math.random().toString(36).substring(2, 9);
}

export function randomPos(boundaries, limitPos = false, noZone = 50, range = 0, margin = 20) {
  if (!limitPos) {
    return random(boundaries.left, boundaries.right);
  }
  let pos = random(boundaries.left, boundaries.right);
  while (pos < noZone + margin + range && pos > noZone - margin - range) {
    pos = random(boundaries.left, boundaries.right);
  }
  return pos;
}

export function getLevelName(index) {
  return `level${index}`;
}
