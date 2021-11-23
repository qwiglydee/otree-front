import { Page } from "../src/page.mjs";
import { Schedule } from "../src/utils/schedule.mjs";
import { Trials } from "../src/game.mjs";
import { loadImage } from "../src/utils/dom.mjs";
import { random_choice } from "../src/utils/random.mjs";

const MOODS = ["positive", "negative"];

const WORDS = {
  positive: ["amusement", "fun", "friendship", "happyness", "joy"],
  negative: ["anger", "hate", "fear", "panic", "sickness"],
};

const EMOJIS = {
  positive: [
    "emoji_u263a.png",
    "emoji_u1f600.png",
    "emoji_u1f601.png",
    "emoji_u1f60a.png",
    "emoji_u1f60d.png",
  ],
  negative: [
    "emoji_u2639.png",
    "emoji_u1f612.png",
    "emoji_u1f616.png",
    "emoji_u1f623.png",
    "emoji_u1f62c.png",
  ],
};

async function generateTrial(gameconf) {
  let prime_mood = random_choice(MOODS);
  let prime = random_choice(WORDS[prime_mood]);
  let stimulus_mood = random_choice(MOODS);
  let stimulus = random_choice(EMOJIS[stimulus_mood]);
  let stimulus_img = await loadImage(`/assets/images/${stimulus}`);

  return {
    iteration: gameconf.iteration,
    prime: prime,
    prime_cls: prime_mood,
    stimulus_img: stimulus_img,
    solution: stimulus_mood,
    congruent: stimulus_mood == prime_mood,
    response: null,
    reaction: null,
    feedback: null,
  };
}

function validateTrial(trial) {
  return trial.solution == trial.response;
}

const page = new Page();

const schedule = new Schedule(page, [
  { time: 0, display: "aim" },
  { time: 1000, display: "prime" }, // duration: 500
  { time: 1500, display: null },
  { time: 2000, display: "target" }, // duration: 1000
  { time: 3000, display: null },
  { time: 2000, input: true, timeout: 5000 },
  { name: "final", display: "final", input: false },
]);

class MyGame extends Trials {
  start() {
    this.updateState({
      trial: generateTrial(gameconf),
    });

    schedule.run();
  }

  stop() {
    // do nothing
  }

  onResponse(data) {
    this.freezeInputs();

    this.updateState({
      "trial.response": data.response,
      "trial.reaction": schedule.reaction_time(),
    });

    this.validate();
  }

  onTimeout() {
    updateState({
      "trial.response": this.conf.nogo_response,
    });

    this.validate();
  }

  validate() {
    let valid = validateTrial(this.state.trial);

    // this.unfreeze(); // when more attempts allowed

    schedule.trigger("final"); // the phase to show during final waiting and intertrial pause

    this.setStatus({
      success: valid,
      completed: true, // set to false if more attempts allowed
      wait: true,
    });
  }
}

const CONF = {
  num_rounds: 5,
  num_retries: 1,
  nogo_response: "missed",
  trial_pause: 3000,
};

const game = new MyGame(page);
await game.init();

await page.wait("otree.start"); // for user to press 'start'

// let status = await game.playRound(CONF); // single round
let progress = await game.iterateRounds(
  CONF,
  CONF.num_rounds,
  CONF.trial_pause
);
