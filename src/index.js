import * as changes from "./utils/changes"; 
import * as dom from "./utils/dom";
import * as random from "./utils/random";
import * as timers from "./utils/timers";

export const utils = {
  dom, random, changes, timers
};

export * as directives from "./directives/base";
// directives register themselves
import "./directives/ot-ready";
import "./directives/ot-display";
import "./directives/ot-input";
import "./directives/ot-class";
import "./directives/ot-text";
import "./directives/ot-img";
import "./directives/ot-attr";
import "./directives/ot-when";

import { Page } from "./page";
import { Game } from "./game";
import { Schedule } from "./schedule";

window.addEventListener('load', function() {
  window.page = new Page(document.body);
  window.game = new Game(window.page);
  window.schedule = new Schedule(window.page);
});




