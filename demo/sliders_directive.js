import { Directive, registerDirective } from "../src/directives/base.mjs";

const HANDLE_R = 8;
const HOVER_R = 16;

class Slider extends Directive {

  init() {
    this.ref = this.elem.dataset.slider;
    this.imgref = this.ref + ".background";
    this.img = null;
    this.valref = this.ref + ".value";
    this.value = null;

    this.vldref = this.ref + ".valid";
    this.crcref = this.ref + ".correct";

    this.state = {
      hover: false,
      drag: false,
    };

    this.status = {
      valid: true,
      correct: false,
    }
    this.draw = this.elem.getContext("2d");
  }

  setup() {
    this.on("otree.page.update", this.onUpdate);
    // TODO: add hover/pick/drag
    this.on("mousemove", this.onMouseMove, this.elem);
    this.on("mouseout", this.onMouseOut, this.elem);
    this.on("mousedown", this.onMouseDown, this.elem);
    this.on("mouseup", this.onMouseUp, this.elem);
  }

  onUpdate(event, changes) {
    let changed = false;
    if (changes.affects(this.imgref)) {
      changed = true;
      this.img = changes.pick(this.imgref);
      if (this.img) {
        this.elem.width = this.img.width;
        this.elem.height = this.img.height;
        this.coords = {
          w: this.img.width,
          x0: this.img.width / 2,
          h: this.img.height,
          y0: this.img.height / 2,
        };
      }
    }

    if (changes.affects(this.valref)) {
      changed = true;
      this.value = changes.pick(this.valref);
    }

    if (changes.affects(this.vldref)) {
      changed = true;
      this.status.valid = changes.pick(this.vldref);
    }

    if (changes.affects(this.crcref)) {
      changed = true;
      this.status.correct = changes.pick(this.crcref);
    }
  
    if (changed) {
      this.redraw();
    }
  }

  redraw() {
    if (!this.img) return;

    this.draw.drawImage(this.img, 0, 0);

    const x = this.coords.x0 + this.value,
      y = this.coords.y0;

    // hover area
    if (this.state.hover) {
      if (this.state.drag) {
        this.draw.fillStyle = "rgba(98, 0, 238, 0.24)";
      } else {
        this.draw.fillStyle = "rgba(98, 0, 238, 0.16)";
      }

      this.draw.beginPath();
      this.draw.arc(x, y, HOVER_R, 0, 2 * Math.PI);
      this.draw.fill();
    }

    // knob
    if (this.state.drag) {
      this.draw.fillStyle = "rgba(98, 0, 238, 0.5)";
    } else if (this.status.correct) {
      this.draw.fillStyle = "rgb(0, 139, 0)";
    } else if (!this.status.valid) {
      this.draw.fillStyle = "rgb(139, 0, 0)";
    } else {
      this.draw.fillStyle = "rgb(98, 0, 238)";
    }

    this.draw.beginPath();
    this.draw.arc(x, y, HANDLE_R, 0, 2 * Math.PI);
    this.draw.fill();
  }

  _mousemap(event) {
    return {
      x: event.offsetX - this.coords.x0,
      y: event.offsetY - this.coords.y0,
    };
  }

  onMouseMove(event) {
    const mouse = this._mousemap(event);
    if (this.state.drag) {
      // dragging
      this.value = mouse.x - this.state.pick_dx;
      this.redraw();
    } else {
      // picking
      const dx = Math.abs(mouse.x - this.value);
      const hover = dx < HANDLE_R;
      if (this.state.hover != hover) {
        this.state.hover = hover;
        this.redraw();
      }
    }
  }

  onMouseOut(event) {
    if (this.state.drag) {
      // dropping
      this.page.response({ slider: this.ref, value: this.value });
    }
    this.state = {
      hover: false,
      drag: false,
    };
    this.redraw();
  }

  onMouseDown(event) {
    if (!this.state.hover) {
      this.state.drag = false;
      return;
    }
    const mouse = this._mousemap(event);
    this.state.drag = true;
    this.state.pick_dx = mouse.x - this.value;
    this.redraw();
  }

  onMouseUp(event) {
    if (this.state.drag) {
      // dropping
      this.page.response({ slider: this.ref, value: this.value });
    }
    this.state.drag = false;
    this.redraw();
  }
}

registerDirective("canvas[data-slider]", Slider);
