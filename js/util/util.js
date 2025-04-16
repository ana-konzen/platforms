export function makeId() {
  return Math.random().toString(36).substring(2, 9);
}

export function randomPos(boundaries) {
  return random(boundaries.left, boundaries.right);
}

export function getLevelName(index) {
  return `level${index}`;
}
