export * from "./page";
export * from "./game";
export * from "./live";
export * from "./schedule";

export * as directives from "./directives/base";
// directives register themselves
import "./directives/ot-start";
import "./directives/ot-display";
import "./directives/ot-input";
import "./directives/ot-class";
import "./directives/ot-text";
import "./directives/ot-img";
import "./directives/ot-attr";
import "./directives/ot-when";

import * as changes from "./utils/changes"; 
import * as dom from "./utils/dom";
import * as random from "./utils/random";
import * as timers from "./utils/timers";

export const utils = {
  dom, random, changes, timers
};

