const SLIDER_SNAP = 4;
const SLIDER_EXTRA = 64;
const SLIDER_WIDTH = SLIDER_SNAP * 100 + SLIDER_EXTRA + 16;
const SLIDER_HEIGHT = 32;
const SLIDER_TICKS = 10;
const TICKS_HEIGHT = 8;
const TICKS_WIDTH = 2;
const TRACK_HEIGHT = 8;

const BACK_COLOR = "#E0E0E0";
const TRACK_COLOR = "#BB86FC60";
const TICK_COLOR = "#6200EE60";
const TARGET_COLOR = "#EE6300";
const CORRECT_COLOR = "#008B00";

const canvas = document.createElement("canvas");
canvas.width = SLIDER_WIDTH;
canvas.height = SLIDER_HEIGHT;
const ctx = canvas.getContext("2d");

function generateSlider() {
  const target = Math.round(Math.random() * SLIDER_EXTRA - SLIDER_EXTRA / 2);
  const initial = Math.round((Math.random() * 100 - 50) * SLIDER_SNAP + target);

  ctx.fillStyle = BACK_COLOR;
  ctx.fillRect(0, 0, SLIDER_WIDTH, SLIDER_HEIGHT);

  const center = { x: SLIDER_WIDTH / 2 + target, y: SLIDER_HEIGHT / 2 };

  ctx.fillStyle = TRACK_COLOR;
  ctx.fillRect(
    center.x - 50 * SLIDER_SNAP,
    center.y - TRACK_HEIGHT / 2,
    100 * SLIDER_SNAP,
    TRACK_HEIGHT
  );

  ctx.fillStyle = TARGET_COLOR;
  ctx.fillRect(center.x - TICKS_WIDTH / 2, center.y - TICKS_HEIGHT / 2, TICKS_WIDTH, TICKS_HEIGHT);

  ctx.fillStyle = TICK_COLOR;
  for (let i = 50; i > 0; i -= SLIDER_TICKS) {
    let x = i * SLIDER_SNAP;
    ctx.fillRect(
      center.x + x - TICKS_WIDTH / 2,
      center.y - TICKS_HEIGHT / 2,
      TICKS_WIDTH,
      TICKS_HEIGHT
    );
    ctx.fillRect(
      center.x - x - TICKS_WIDTH / 2,
      center.y - TICKS_HEIGHT / 2,
      TICKS_WIDTH,
      TICKS_HEIGHT
    );
  }

  const background = canvas.toDataURL();

  return { target, initial, background };
}

export function generatePuzzle(num_sliders) {
  const sliders = [];
  for (let i = 0; i < num_sliders; i++) {
    sliders[i] = generateSlider();
    sliders[i].value = sliders[i].initial;
    sliders[i].correct = false;
  }

  return { sliders };
}

export function validateSlider(slider, input) {
  let snapped = Math.round((input - slider.target) / SLIDER_SNAP);
  let valid = -50 <= snapped && snapped <= 50;
  let mapped = slider.target + snapped * SLIDER_SNAP;  
  return {
    valid: valid,
    value: mapped,
    correct: snapped == 0,
  };
}

export function validatePuzzle(puzzle) {
  return puzzle.sliders.filter(slider => slider.correct).length;
}
