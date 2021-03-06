import * as changes from "./utils/changes"; 
import * as dom from "./utils/dom";
import * as random from "./utils/random";
import * as timers from "./utils/timers";
import * as trials from "./utils/trials";
import * as measurement from "./utils/measurement";
import { DirectiveBase,  registerDirective } from "./directives/base";

// directives register themselves
import "./directives/ot-input";
import "./directives/ot-class";
import "./directives/ot-text";
import "./directives/ot-img";
import "./directives/ot-attr";
import "./directives/ot-if";

import { Page } from "./page";
import { Game } from "./game";
import { Schedule } from "./schedule";


if (window.otree === undefined) {
  window.otree = {};
}


window.addEventListener('load', function() {
  window.otree.page = new Page(document.body);
  window.otree.game = new Game(otree.page);
  window.otree.schedule = new Schedule(otree.page);

  if (!window.main) {
    throw new Error("You need to define global `function main()` to make otree work");
  }
  window.main();
});

Object.assign(window.otree, {
  utils: {
    dom, random, timers, measurement, 
    changes, trials
  },
  directives: {
    DirectiveBase, registerDirective
  }
});
