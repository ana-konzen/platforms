import { Bodies, Composite, engine } from "./physics.js";
import { STYLE } from "./style.js";

export class Platform {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.body = Bodies.rectangle(x, y, STYLE.platformW, STYLE.platformH, {
      isStatic: true,
    });
    this.found = false;
    this.id = id;

    Composite.add(engine.world, this.body);
  }

  getShareData() {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle,
      id: this.id,
    };
  }

  changePlatColor(pg) {
    pg.fill("blue");
    // if (this.found) pg.fill(STYLE.platformFoundColor);
  }
}
