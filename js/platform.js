import { Bodies, Body, Composite, engine } from "./physics.js";
import { CONFIG } from "./config.js";

export class Platform {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.w = CONFIG.platformW;
    this.h = CONFIG.platformH;
    this.body = Bodies.rectangle(x, y, this.w, this.h, {
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

  move(x, y) {
    this.x = x;
    this.y = y;
    Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  find() {
    if (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    ) {
      this.found = true;
    } else {
      this.found = false;
    }
  }

  update(pg) {
    this.find();
    if (this.found) {
      pg.fill("blue");
    }
  }
}
