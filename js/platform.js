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

  findPlatform() {
    if (
      mouseX > this.x - STYLE.platformW / 2 &&
      mouseX < this.x + STYLE.platformW / 2 &&
      mouseY > this.y - STYLE.platformH / 2 &&
      mouseY < this.y + STYLE.platformH / 2
    ) {
      this.found = true;
    } else {
      this.found = false;
    }
  }

  update(pg) {
    this.findPlatform();
    if (this.found) {
      pg.fill("blue");
      //   if (mouseIsPressed) {
      //     this.x = mouseX;
      //     this.y = mouseY;
      //   }
    }
  }
}
