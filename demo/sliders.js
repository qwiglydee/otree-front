import { utils } from "../src";

const Ref = utils.changes.Ref;

let conf;

window.liveRecv = async function(data) {
  console.debug("liveRecv", data);
  switch (data.type) {
    case "setup":
      conf = data.conf;
      page.update({ conf: data.conf, progress: data.status.stats });
      break;

    case "game":
      let sliders = data.sliders;
   
      // need to load all images into Image objects
      for (let i = 0; i < conf.num_sliders; i++) {
        sliders[i].background = await utils.dom.loadImage(sliders[i].background);
        sliders[i].idx = i;
        sliders[i].valid = true;
      }

      game.update({ sliders });
      page.update({ progress: data.status.stats });
      break;

    case "update":
      game.update(data.update);
      page.update({ progress: data.status.stats });
      if (data.status.completed) {
        page.update({ result: data.status });
        game.stop(data.status);
      }
      break;
  }
}

window.onload = async function main() {

  page.on("otree.game.start", async function (event, status) {
    console.debug("otree.game.start", status);
    liveSend({ type: "load" }); // expect 'game'
  });

  page.on("otree.page.response", function (event, input) {
    console.debug("otree.page.response", input);
    let { idx, value } = input;

    game.update({
      [`sliders.${idx}.value`]: value,
      [`sliders.${idx}.valid`]: null,
    });

    liveSend({ type: "response", slider: idx, input: value }); // expect 'update'
  });

  // main

  game.reset();
  page.toggle({ display: null });

  liveSend({ type: "start" }); // expect 'setup'

  await page.wait("otree.page.start"); // for user to press 'start'

  game.start();
  await page.wait('otree.game.stop');

  page.toggle({ display: "results" });
};
