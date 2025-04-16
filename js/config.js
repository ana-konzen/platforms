export const CONFIG = {
  //style
  background: "#f7f7ed",
  targetColor: "#B2D89E",
  wallColor: "#C8121D",
  ballColor: "#EBC733",
  platformColor: "#FFFDD0",
  platformFoundColor: "#B2D89E",
  player1Color: "#681037",
  player2Color: "#C8121D",
  headerHeight: 40,

  //game config
  wallW: 5,
  renderWalls: false,
  easyMode: true,
  numLevels: 3,

  platformW: 40,
  platformH: 10,
  targetW: 50,
  targetH: 10,
  ballRadius: 10,
  maxPlatforms: 5,

  //level config
  level1: {
    targetMoving: false,
    targetSpeed: 0,
    platformW: 50,
    platformH: 15,
    targetW: 50,
    targetH: 10,
    ballRadius: 10,
    maxPlatforms: 5,
    platformColor: "#FFFDD0",
    platformFoundColor: "#B2D89E",
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
    platformW: 40,
    platformH: 10,
    targetW: 50,
    targetH: 10,
    ballRadius: 10,
    maxPlatforms: 5,
    platformColor: "#FFFDD0",
    platformFoundColor: "#B2D89E",
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
    platformW: 40,
    platformH: 10,
    targetW: 30,
    targetH: 10,
    ballRadius: 10,
    maxPlatforms: 3,
    platformColor: "#FFFDD0",
    platformFoundColor: "#B2D89E",
    targetColor: "#B2D89E",

    player1: {
      bgColor: "#681037",
    },
    player2: {
      bgColor: "#C8121D",
    },
  },
};
