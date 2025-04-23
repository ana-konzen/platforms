import { Bodies, Body, Composite, engine } from "./physics.js";
import { CONFIG } from "./config.js";
import { getLevelName } from "./util/util.js";

export class Platform {
  constructor(x, y, id, level = 1) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.level = level;
    this.w = CONFIG[getLevelName(this.level)].platformW;
    this.h = CONFIG[getLevelName(this.level)].platformH;
    this.body = Bodies.rectangle(x, y, this.w, this.h, {
      isStatic: true,
      label: "platform",
      plugin: {
        hit: false,
      },
    });
    this.found = false;
    this.id = id;
    this.selected = false;

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

  rotate(angle) {
    this.angle += angle;
    Body.setAngle(this.body, this.angle);
    console.log(this.body);
  }

  find() {
    if (
      mouseX > this.x - this.h / 2 - (this.w / 2) * abs(cos(this.angle)) &&
      mouseX < this.x + this.h / 2 + (this.w / 2) * abs(cos(this.angle)) &&
      mouseY > this.y - this.h / 2 - (this.w / 2) * abs(sin(this.angle)) &&
      mouseY < this.y + this.h / 2 + (this.w / 2) * abs(sin(this.angle))
    ) {
      this.found = true;
    } else {
      this.found = false;
    }
  }

  updateColor(pg, ballDropped) {
    const levelConfig = CONFIG[getLevelName(this.level)];

    if (this.body.plugin.hit) {
      pg.fill(levelConfig.platformHitColor || CONFIG.platformHitColor);
    } else {
      pg.fill(levelConfig.platformColor || CONFIG.platformColor);
    }

    if (!ballDropped) {
      this.find();
      if (this.found || this.selected) {
        pg.fill(levelConfig.platformFoundColor || CONFIG.platformFoundColor);
      } else {
        pg.fill(levelConfig.platformColor || CONFIG.platformColor);
      }
    }
  }

  draw(pg, ballDropped) {
    pg.push();
    this.updateColor(pg, ballDropped);
    pg.translate(this.x, this.y);
    pg.rotate(this.angle);
    pg.rect(0, 0, this.w, this.h, this.h / 2);
    pg.pop();
  }
}
