export const FONTS = {};
export const SOUNDS = {};

export function preload() {
  FONTS.platFont = loadFont("../assets/fonts/NeueTelevision-RetroUltraBoldW50P0.otf");
  FONTS.formsFont = loadFont("../assets/fonts/NeueTelevision-RetroUltraBoldW50P50.otf");
  FONTS.basicFont = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P50.otf");
  FONTS.player1Font = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P0.otf");
  FONTS.player2Font = loadFont("../assets/fonts/NeueTelevisionS-BlackW50P50.otf");

  SOUNDS.hit = loadSound("../assets/sounds/hit.mp3");
}
