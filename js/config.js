export const CONFIG = {
  //style
  background: "#f7f7ed",
  targetColor: "#B2D89E",
  wallColor: "#C8121D",
  ballColor: "#EBC733",
  platformColor: "#FFFDD0",
  platformFoundColor: "blue",
  platformHitColor: "red",
  player1Color: "#681037",
  player2Color: "#C8121D",
  headerHeight: 40,
  resetButtonW: 40,

  // for lobby scene
  platformH: 10,
  platformW: 40,

  //game config
  wallW: 5,
  renderWalls: false,
  easyMode: false,
  numLevels: 3,
  maxPlatforms: 5,

  ballRadius: 10,

  //level config
  level1: {
    targetMoving: false,
    targetSpeed: 0,
    targetRange: 0,
    targetW: 70,
    targetH: 20,
    platformW: 60,
    platformH: 20,
    platformColor: "#FFFDD0",
    platformFoundColor: "blue",
    targetColor: "#B2D89E",
    player1: {
      bgColor: "#681037",
    },
    player2: {
      bgColor: "#C8121D",
    },
  },
  level2: {
    targetMoving: true,
    targetSpeed: 1,
    targetRange: 100,
    targetW: 60,
    targetH: 20,
    platformW: 50,
    platformH: 20,
    platformColor: "#FFFDD0",
    platformFoundColor: "blue",
    targetColor: "#B2D89E",

    player1: {
      bgColor: "#3398E1",
    },
    player2: {
      bgColor: "#911E2D",
    },
  },
  level3: {
    targetMoving: true,
    targetSpeed: 2,
    targetRange: 50,
    targetW: 50,
    targetH: 20,
    platformW: 40,
    platformH: 20,
    platformColor: "#FFFDD0",
    platformFoundColor: "blue",
    targetColor: "#B2D89E",

    player1: {
      bgColor: "#681037",
    },
    player2: {
      bgColor: "#C8121D",
    },
  },
};
