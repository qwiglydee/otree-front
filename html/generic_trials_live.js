import { LivePage } from "../src/page.mjs";
import { LiveTrial } from "../src/game.mjs";
import { loadImage } from "../src/utils/dom.mjs";

const page = new LivePage();

class MyGame extends LiveTrial {
  start() {
    page.sendLive("new", this.conf);
  }

  async onTrial(data) {
    data.trial.stimulus_img = await loadImage(data.trial.stimulus_img);
    this.updateState({
      trial: data.trial,
    });
    this.unfreeze();
  }

  async onResponse(data) {
    this.updateState({
      "trial.response": data.response,
      "trial.reaction": schedule.reaction_time(),
    });

    page.sendLive("response", { response });
  }

  async onTimeout() {
    this.updateState({
      "trial.response": null,
    });
    page.sendLive("timeout");
  }

  async onFeedback(data) {
    this.updateState({
      "trial.feedback": data.feedback,
    });
    this.setStatus({
      success: data.feedback,
      completed: true,
    });
  }
}

const CONF = {
  num_retries: 1,
};

const game = new MyGame(page);

await game.init();

await page.wait("otree.start"); // for user to press 'start'

let status = await game.playRound(CONF); // single round
