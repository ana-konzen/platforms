export const FONTS = {};
export const SOUNDS = {};
export const IMAGES = {};

export function preload() {
  FONTS.platFont = loadFont("../assets/fonts/NeueTelevision-RetroUltraBoldW50P0.otf");
  FONTS.formsFont = loadFont("../assets/fonts/NeueTelevision-RetroUltraBoldW50P50.otf");
  FONTS.basicFont = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P50.otf");
  FONTS.player1Font = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P0.otf");
  FONTS.player2Font = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P50.otf");

  IMAGES.arrows = loadImage("../assets/arrows.png");

  SOUNDS.hit = loadSound("../assets/sounds/hit.mp3");
  SOUNDS.targetMiss = loadSound("../assets/sounds/targetMiss.mp3");
  SOUNDS.nextLevel = loadSound("../assets/sounds/nextLevel.mov");
  SOUNDS.win = loadSound("../assets/sounds/win.mp3");
  SOUNDS.gameStart = loadSound("../assets/sounds/gameStart.mp3");
}
