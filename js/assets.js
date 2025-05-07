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

  SOUNDS.title = loadSound("../assets/sounds/title.mp3");
  SOUNDS.join = loadSound("../assets/sounds/join.mov");
  SOUNDS.gameStart = loadSound("../assets/sounds/gameStart.mp3");
  SOUNDS.place = loadSound("../assets/sounds/place.mp3");
  SOUNDS.rotate = loadSound("../assets/sounds/rotate.mp3");
  SOUNDS.ballDrop = loadSound("../assets/sounds/ballDrop.mp3");
  SOUNDS.hit = loadSound("../assets/sounds/hit.mp3");
  SOUNDS.targetMiss = loadSound("../assets/sounds/targetMiss.mp3");
  SOUNDS.nextLevel = loadSound("../assets/sounds/nextLevel.mov");
  SOUNDS.win = loadSound("../assets/sounds/win.mp3");
}

export function setup() {
  // Set the volume for all sounds
  Object.values(SOUNDS).forEach((sound) => {
    sound.amp(0.5);
    sound.setVolume(0.5);
  });
}
