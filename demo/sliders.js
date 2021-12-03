import { utils } from "../src";

window.liveRecv = function(data) {
  console.debug("liveRecv", data.type, data);

  switch (data.type) {
    case "setup":
      game.setupGame(data.setup);
      break;

    case "game":
      game.loadGame(data.game);
      break;

    case "update":
      game.update(data.update);
      break;
  }

  if (data.status) {
    game.status(data.status);
  }
};

window.onload = async function main() {
  let conf = {};
  
  // ad-hoc method
  game.setupGame = function(setup) {
    conf = setup;
    page.update({ conf: conf, progress: { moves: 0, solved: 0 }, active: undefined});
  }

  game.onStart = function () {
    liveSend({ type: "load" }); // expect live 'game'
  };

  // ad-hoc method
  game.loadGame = async function(gamedata) {
    let sliders = gamedata.sliders;

    // need to load all images into Image objects
    for (let i = 0; i < conf.num_sliders; i++) {
      sliders[i].background = await utils.dom.loadImage(sliders[i].background);
      sliders[i].idx = i;
      sliders[i].valid = true;
    }

    game.update({ sliders });
  }

  game.onInput = function (input) {
    console.debug("input", input);
    let { idx, value } = input;

    game.update({
      [`sliders.${idx}.value`]: value,
      [`sliders.${idx}.valid`]: null,
    });

    liveSend({ type: "response", slider: idx, input: value }); // expect live 'update'
  };

  game.onStatus = function (status) {
    
    if (status.progress) {
      page.update({ progress: status.progress });
    }

    // for turn-based variation
    if (status.active_player) {
      if (status.active_player == conf.this_player) {
        page.unfreeze();
        page.update({ active: true });
      } else {
        page.freeze();
        page.update({ active: false });
      }
    }

    if (status.completed) {
      page.update({ result: status });
      game.completed(status);
    }
  };

  // main

  page.toggle({ display: null });
  // game.reset();

  await page.wait("ot.ready");

  liveSend({ type: "start" }); // expect live 'setup'

  await game.play();

  page.toggle({ display: "results" });
};
