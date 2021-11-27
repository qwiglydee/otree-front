function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function toggleDisplay(elem, display) {
  elem.style.display = display ? null : "none";
}

function toggleDisabled(elem, disabled) {
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

function setText(elem, text) {
  // NB: using `innerText` to render line breaks
  elem.innerText = text == null ? "" : text;
}

function setClasses(elem, classes) {
  elem.classList.remove(...elem.classList);
  elem.classList.add(...classes);
}

function setAttr(elem, attr, val) {
  if (val == null) {
    elem.removeAttribute(attr);
  } else {
    elem.setAttribute(attr, val);
  }
}

function setChild(elem, child) {
  if (child == null) {
    elem.replaceChildren();
  } else {
    elem.replaceChildren(child);
  }
}

function isTextInput(elem) {
  return (elem.tagName == "INPUT" && elem.type == "text") || elem.tagName == "TEXTAREA";
}

var dom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  loadImage: loadImage,
  toggleDisplay: toggleDisplay,
  toggleDisabled: toggleDisabled,
  isDisabled: isDisabled,
  setText: setText,
  setClasses: setClasses,
  setAttr: setAttr,
  setChild: setChild,
  isTextInput: isTextInput
});

/** Reference/Change utils
 * Utils to handle references to game state vars and manage their updates
 */

const Ref = {
  jspath_re: new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/),

  validate(ref) {
    if (!ref || !Ref.jspath_re.exec(ref)) throw new Error(`Invalid ref: ${ref}`);
  },

  includes(parentref, nestedref) {
    return parentref == nestedref || nestedref.startsWith(parentref + ".");
  },

  strip(parentref, nestedref) {
    if (parentref == nestedref) {
      return "";
    } else if (nestedref.startsWith(parentref + ".")) {
      return nestedref.slice(parentref.length + 1);
    } else {
      throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
    }
  },

  extract(data, ref) {
    return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
  },

  update(data, ref, value) {
    function ins(obj, key) {
      return (obj[key] = {});
    }

    const path = ref.split("."),
      objpath = path.slice(0, -1),
      fld = path[path.length - 1];

    let obj = objpath.reduce((o, k) => (k in o ? o[k] : ins(o, k)), data);
    if (obj === undefined) throw new Error(`Incompatible ref ${ref}`);
    if (value === undefined) {
      delete obj[fld];
    } else {
      obj[fld] = value;
    }
  },
};

class Changes extends Map {
  constructor(obj, prefix) {
    let entries = [...Object.entries(obj)];
    if (prefix) {
      entries = entries.map(([k, v]) => [prefix + "." + k, v]);
    } 
    super(entries);
    this.forEach((v, k) => Ref.validate(k));
  }

  /** Checks if the changeset affects referenced var */
  affects(ref) {
    return [...this.keys()].some((key) => Ref.includes(key, ref));
  }

  /** Picks single value from changeset */
  pick(ref) {
    let affecting = [...this.keys()].filter((key) => Ref.includes(key, ref));
    if (affecting.length == 0) return undefined;
    if (affecting.length != 1) throw new Error(`Incompatible changeset for ${ref}`);
    affecting = affecting[0];

    let value = this.get(affecting);

    if (affecting == ref) {
      return value;
    } else {
      return Ref.extract(value, Ref.strip(affecting, ref));
    }
  }

  /** Apply changes
   * Modify an obj by changes
   */
  patch(obj) {
    this.forEach((v, k) => {
      Ref.update(obj, k, v);
    });
  }
}

var changes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Ref: Ref,
  Changes: Changes
});

/** map of selector => class */
const registry = new Map();

/** registers a directive class */
function registerDirective(selector, cls) {
  registry.set(selector, cls);
}


/** directive base class 
 * implement basic and stub methods
 * 
 * default implementation initializes `this.ref` from data attribute, 
 * and sets up update handler  
 */
class Directive {
  /** directive name
   * like "foo" for `data-ot-foo`
   * 
   * should be redefined in derived classes 
   */  
  get name() {
    return "foo";
  }

  /** returns a value from dataset */
  param(name) {
    if (name === undefined) name = this.name; 
    return this.elem.dataset["ot" + name[0].toUpperCase() + name.slice(1).toLowerCase()];
  }

  constructor(page, elem) {
    this.page = page;
    this.elem = elem;
    this.handlers = new Map();
    this.init();
  }

  /** binds an event handler
   * 
   * Shorcut for page.on, with the handler autobound to `this` directive
   * 
   * @param eventype {String} event type
   * @param handler {Function(event, detail)} handler
   * @param target page or elem, by default - page 
  */
  on(eventype, handler, target) {
    if (target === undefined || target === this.page) {
      target = this.page.body;
    }
    return this.page.on(eventype, handler.bind(this), target);
  }

  /** initializes directive 
   * use to parse parameters from the element 
   */
  init() {
    this.ref = this.param(this.name);
    Ref.validate(this.ref); 
  } 

  /** sets events up 
   */
  setup() {
    this.on('otree.page.update', this.onUpdate);
  }
  
  onUpdate(event, changes) {
    if (changes.affects(this.ref)) {
      this.update(changes);
    }
  }

  update(changes) {
    // do something
    throw new Error("Method not implemented");
  }
}

class otStart extends Directive {
  get name() {
    return "start";
  }

  init() {
    const dataset = this.elem.dataset;
    this.trigger = {
      click: "otClick" in dataset,
      touch: "otTouch" in dataset,
      key: "otKey" in dataset ? dataset.otKey : false,
    };
    this.disabled = false;
  }

  setup() {
    if (this.trigger.key) this.on("keydown", this.onKey, this.page);
    if (this.trigger.touch) this.on("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.on("click", this.onClick, this.elem);
    this.on('otree.page.start', this.onStart);
  }

  onKey(event) {
    if (this.disabled) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.start(); 
  }

  onClick(event) {
    if (this.disabled) return;
    event.preventDefault();
    this.page.start();
  }

  onStart() {
    toggleDisplay(this.elem, false);
    this.disabled = true;
  }
}

registerDirective("[data-ot-start]", otStart);

class otDisplay extends Directive {
  get name() {
    return "display";
  }

  init() {
    let param = this.param();
    const match = param.match(/^\w+(\|\w+)?$/);
    if (!match) throw new Error(`Invalid display phase: ${this.phase}`);

    this.phases = param.split('|');
  }

  setup() {
    this.on('otree.time.phase', this.onPhase);
  }
  
  onPhase(event, phase) {
    if (!('display' in phase)) return;
    toggleDisplay(this.elem, this.phases.includes(phase.display));
  }
}

registerDirective("[data-ot-display]", otDisplay);

class otRealInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    this.ref = this.param();
    Ref.validate(this.ref);
  }

  setup() {
    this.on("otree.time.phase", this.onPhase);
    this.on("change", this.onChange, this.elem);
    if (isTextInput(this.elem)) this.on("keydown", this.onKey, this.elem);
  }

  onPhase(event, phase) {
    toggleDisabled(this.elem, !phase.input);
  }

  onChange(event) {
    let value = this.elem.value;
    if (value === "true") value = true;
    if (value === "false") value = false;
    this.page.response({ [this.ref]: value });
  }

  onKey(event) {
    if (event.code == "Enter") {
      // enforce change event
      setTimeout(() =>
      this.elem.dispatchEvent(
          new Event("change", {
            view: window,
            bubbles: false,
            cancelable: true,
          })
        )
      );
    }
  }
}

registerDirective(
  "input[data-ot-input], select[data-ot-input], textarea[data-ot-input]",
  otRealInput
);


class otCustomInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    const param = this.param();
    const match = param.match(/^([\w.]+)(=(.+))$/);
    if (!match) throw new Error(`Invalid expression for input: ${param}`);

    this.ref = match[1];
    Ref.validate(this.ref);
    
    this.val = match[3];
    if (this.val === "true") this.val = true;
    if (this.val === "false") this.val = false; 

    const dataset = this.elem.dataset;
    this.trigger = {
      click: "otClick" in dataset,
      touch: "otTouch" in dataset,
      key: "otKey" in dataset ? dataset.otKey : false,
    };

    if (this.elem.tagName == "BUTTON") this.trigger.click = true; 
  }

  setup() {
    this.on("otree.time.phase", this.onPhase);
    if (this.trigger.key) this.on("keydown", this.onKey, this.page);
    if (this.trigger.touch) this.on("touchend", this.onClick, this.elem);
    if (this.trigger.click) this.on("click", this.onClick, this.elem);
  }

  onPhase(event, phase) {
    if (!('input' in phase)) return;
    toggleDisabled(this.elem, !phase.input);
  }

  onClick(event) {
    if (isDisabled(this.elem)) return;
    event.preventDefault();
    this.page.response({ [this.ref]: this.val });  
  }

  onKey(event) {
    if (isDisabled(this.elem)) return;
    if (event.code != this.trigger.key) return;
    event.preventDefault();
    this.page.response({ [this.ref]: this.val });  
  }
}

registerDirective(
  "div[data-ot-input], span[data-ot-input], button[data-ot-input], kbd[data-ot-input]",
  otCustomInput
);

class otClass extends Directive {
  get name() {
    return "class";
  }

  init() {
    super.init();
    this.defaults = Array.from(this.elem.classList);
  }

  update(changes) {
    let classes = this.defaults.slice();
    let val = changes.pick(this.ref);
    if (!!val) {
      classes.push(val);
    }
    setClasses(this.elem, classes);
  }
}

registerDirective("[data-ot-class]", otClass);

class otText extends Directive {
  get name() {
    return "text";
  }

  update(changes) {
    setText(this.elem, changes.pick(this.ref)); 
  }
}

registerDirective("[data-ot-text]", otText);

class otImg extends Directive {
  get name() {
    return "img";
  }

  update(changes) {
    let img = changes.pick(this.ref);
    if (!!img && !(img instanceof Image)) {
      throw new Error(`Invalid value for image: ${img}`);
    }
    setChild(this.elem, img);
  }
}

registerDirective("[data-ot-img]", otImg);

class otAttrBase extends Directive {
  update(changes) {
    setAttr(this.elem, this.name, changes.pick(this.ref));
  }
}

const ALLOWED_ATTRIBS = ["disabled", "hidden", "height", "width", "min", "max", "low", "high", "optimum", "value"];

// create subclass for each attr with static property
// register them as `data-ot-something`
ALLOWED_ATTRIBS.forEach(attrname => {
  class otAttr extends otAttrBase {
    get name() {
      return attrname;
    }
  }  registerDirective(`[data-ot-${attrname}]`, otAttr);
});

class otWhen extends Directive {
  get name() {
    return "when";
  }

  init() {
    const when = this.param();
    const match = when.match(/^([\w.]+)(==(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${when}`);
    
    this.ref = match[1];
    Ref.validate(this.ref);
    
    this.cond = match[3];
    if (this.cond === "true") this.cond = true;
    if (this.cond === "false") this.cond = false; 
  }

  update(changes) {
    let value = changes.pick(this.ref);

    // for ot-when="fld" -- any true-like
    // for ot-when="fld=val" -- any non-strict equivalent
    let toggle = (this.cond !== undefined) ? value == this.cond : !!value;  

    toggleDisplay(this.elem, toggle);
  }
}

registerDirective("[data-ot-when]", otWhen);

/** Main page
 * 
 * Centeral point of synchronization.
 */
class Page {
  
  constructor(body) {
    this.body = body || document.body;
    this.init();
  }

  init() {
    let page = this;
    registry.forEach((cls, sel) => {
      this.body.querySelectorAll(sel).forEach((elem) => {
        // console.debug(cls, sel, elem);
        let inst = new cls(page, elem);
        inst.setup();
      });
    });
  }

  /** binds an event handler
   *
   * @param type {String} event type
   * @param handler {function(event, detail)} a handler
   * @param target {?HTMLElement} an element to bind handler, instead of the page itself
   * @returns {Function} handler wrapper bound to events,
   *   the wrapper has method off() to unbind itself
   */
  on(type, handler, target) {
    target = target || this.body;
    const listener = (event) => handler(event, event.detail);
    listener.off = () => target.removeEventListener(type, listener);
    target.addEventListener(type, listener);
    return listener;
  }

  /** waits for an event
   *
   * Note: this doesb't catch events happened before the waiting started.
   *
   * Example 1:
   *
   *    await page.waitEvent('otree.time.out'); // suspend script until timeout fired
   *
   * Example 2:
   *
   *    const waiting = page.waitEvent('otree.time.out'); // start waiting without suspending
   *    // do something
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param type {String} event type
   * @returns {Promise} resolved when event fired
   */
  wait(type, target) {
    target = target || this.body;
    return new Promise((resolve) => {
      function listener(event) {
        resolve(event);
        target.removeEventListener(type, listener); 
      } 
      target.addEventListener(type, listener);
    });
  }

  /** fire an event
   * @param type {String} event type
   * @param detail {Object} any data to pass to handler
   * @param target {?HTMLElement} an element to fire at, instead of the page itself
   */
  fire(type, detail, target) {
    // console.debug("firing", type, detail);
    const event = new CustomEvent(type, { detail });
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));
  }

  reset(obj="game") {
    this.fire("otree.page.reset", obj);
    this.fire("otree.page.update", new Changes({ [obj]: undefined }));
  }

  start() {
    this.fire("otree.page.start");
  }

  update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.update", changes);
  }

  response(changes) {
    this.fire("otree.page.response", changes);
  }

  toggle(phase) {
    this.fire("otree.time.phase", phase);
  }

  timeout() {
    this.fire("otree.time.out");
  }
}

async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

function delay(fn, delay=0) {
    return window.setTimeout(fn, delay);
}

function cancel(id) {
    window.clearTimeout(id);
    return null;
}

/** Timers
 * A set of timers with names
 */
class Timers {
    constructor() {
        this.timers = new Map();
    }

    delay(name, fn, timeout=0) {
        if (this.timers.has(name)) {
            cancel(this.timers.get(name));
        }
        this.timers.set(name, delay(fn, timeout));
    }

    cancel(...names) {
        if (names.length != 0) {
            names.forEach((n) => {
                cancel(this.timers.get(n));
                this.timers.delete(n);
            });
        } else {
            this.timers.forEach((v, k) => cancel(v));
            this.timers.clear();
        }
    }
}

var timers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sleep: sleep,
  delay: delay,
  cancel: cancel,
  Timers: Timers
});

/** Deferred
 *
 * A wrapper for a promise that you can resolve and check later, outside of closure.
 * ```
 * let dfd = new Deferred()
 * setTimeout(() => dfd.resolve(), 10000);
 * await dfd.promise; // waiting for the timeout
 * assert dfd.state === true;
 */

class Deferred {
  constructor() {
    this.state = null;
    this.promise = new Promise((resolve, reject) => {
      this.reject = (reason) => {
        reject(reason);
        this.state = false;
      };
      this.resolve = (reason) => {
        resolve(reason);
        this.state = true;
      };
    });
  }
}

/** Base game
 * Base utilities to construct game logic
 */
class Game {
  constructor(page) {
    this.page = page;
    this.state = {};
  }

  reset() {
    this.state = {};
    this.page.reset('game');
  }

  /** updates game state
   *
   * Applies given changes to game state,
   * Signals them to the page prefixed with 'game'
   *
   * i.e. `update({'foo': bar})`
   * - updates field `foo` in the game state
   * - updates page with changes of `game.foo`
   *
   * @params changes {Object} of form `{ 'field.subfield': newvalue, ... }`
   */
  update(changes) {
    new Changes(changes).patch(this.state);
    this.page.update(new Changes(changes, "game"));
  }

  /** handles status update
   *
   * Fires event `otree.game.status`.
   * Aignals them to the page prefixed with 'status'.
   * The status is not saved anywhere and only exists in events.
   *
   * i.e. `status({foo: "foo"})`
   * - fires event `otree.game.status` with {foo: "foo"}
   * - updates pagee with changes of `status.foo`
   *
   * Status fields:
   * - completed {bool}: makes game round to end
   * - wait {bool}: makes completed round to wait until `otree.time.out`
   * - terminate {bool}: terminate iterations loop (used by `iterateRounds`)
   * - success {bool}: indicates of round succedded/failed (used by `iterateRounds` to count progress)
   *
   * @param status {Object}
   */
  status(status) {
    this.page.fire("otree.game.status", status);
    this.page.update(new Changes(status, "status"));

    if (status.completed) this.running.resolve(status);
  }
  
  error(code, message) {
    let error;
    if (!code) {
      error = null;
    } else {
      error = { code };
      if (message) {
        error.message = message;
      }
    }
    this.status({ error });
  }

  freeze() {
    // FIXME: this interferes with actual time phases
    this.page.fire("otree.time.phase", { input: false });
  }

  unfreeze() {
    // FIXME: this interferes with actual time phases
    this.page.fire("otree.time.phase", { input: true });
  }

  /** plays single round
   *
   * Fires events `otree.game.start` and `otree.game.stop`.
   *
   * Waits for status to be signalled with flag `completed`
   * Waits for timeout if the status has flag `wait`
   *
   * @param gameconf {Object}
   *   any config params for the round
   *   when called from iterateRounds, the conf contains `iteration`
   * @returns {Promise} resolving with game status when the round is completed
   */
  async playRound(gameconf) {
    this.running = new Deferred();

    this.reset();
    this.page.fire("otree.game.start", gameconf);

    return this.running.promise.then((status) => {
      this.page.fire("otree.game.stop", status);
      return status;
    });
  }

  updateProgress(progress, status) {
    progress.completed += 1;
    progress.solved += status.success === true;
    progress.failed += status.success === false;
    progress.skipped += status.success === undefined;
  }

  /** plays multiple rounds
   *
   * Runs multiple rounds and updates `status.progress`:
   * - total: total number of iterations or null if it's infinite
   * - current: current iteration, counting from 1
   * - completed: number of completed rounds,
   * - solved: number of rounds with `success=true`,
   * - failed: number of rounds with `success=false`,
   * - skipped: number of rounds without `success` status,
   *
   *
   * @param gameconf
   *   any config params for the round
   *   it is extended with `iteration` when passed to `playRound`
   * @param num_rounds
   *   number of rounds to play, null for infinite loop
   *   the loop is terminated when `status.terminate == true`
   * @param trial_pause
   *   delay between rounds
   * @returns {Promise} resolving when loop terminates with final progress
   */
  async iterateRounds(gameconf, num_rounds, trial_pause) {
    const progress = {
      total: num_rounds,
      current: 0,
      completed: 0,
      skipped: 0,
      solved: 0,
      failed: 0,
    };
    let status = {};

    let roundconf = { ...gameconf };

    const cnt = (i) =>
      (num_rounds ? i <= num_rounds : true) && !status.terminate;
    for (let i = 1; cnt(i); i++) {
      roundconf.iteration = i;
      progress.current = i;

      this.status({ progress });

      status = await this.playRound(roundconf);

      this.updateProgress(progress, status);

      this.status({ progress });

      await sleep(trial_pause);
    }

    return progress;
  }
}

/** Live Page
 * 
 * handles live messages
 * converts incoming and outgoing messages to events like `otree.live.type`
 */
 class Live {
  constructor(page) {
    this.page = page;
    this.init();
  }
    
  init() {
    window.liveRecv = this.recv.bind(this);
  }

  recv(data) {
    // console.debug("recv", data);
    const type = data.type;
    delete data.type;
    this.page.fire(`otree.live.${type}`, data);
  }

  /** send a message
   * 
   * @param type {String} message type
   * @param message {Object} message payload
   */
  send(type, message) {
    const data = Object.assign({ type }, message);
    // console.debug("send", data);
    window.liveSend(data);
    this.page.fire(`otree.live.${type}`, message);
  }
}

/** Schedule of timing phases.
 * Fires events according to timing table.
 * Events: 'otree.time.phase' for every phase defined, 'otree.time.out' for timeout
 * Each phase:
 * - { time: number, display: string, input: bool, ...} -- a phase to happen at specified time in ms, and with given parameters
 * - { time, ..., timeout: number} -- fires timeout after defined phase
 * - { name: "name", ... } -- defines custom phase to trigger manually with .trigger("name")
 * - a phase without time -- is a default phase to reset
 */
class Schedule {
  constructor(page, phases) {
    this.page = page;
    this._timers = new Timers();

    this.timed = null;
    this.named = null;
    this.default = null;
    this.current = null;

    this.init(phases);
    this.setup();
    this.reset();
  }

  init(phases) {
    let defaults = phases.filter((it) => !("name" in it) && !("time" in it));
    if (defaults.length > 1) throw new Error("Duplicated default phases");
    if (defaults.length == 1) this.default = defaults[0];

    let named = phases.filter((it) => "name" in it),
      names = new Set(named.map((it) => it.name));
    if (named.length != names.size) throw new Error("Duplicated named phases");

    this.named = new Map(named.map((it) => [it.name, it]));

    this.timed = phases.filter((it) => "time" in it);

    if (phases.filter((it) => "timeout" in it).length > 1)
      throw new Error("Multiple timeouts in phases");
    if (phases.filter((it) => it.input === true).length > 1)
      throw new Error("Multiple input phases not supported");
  }

  setup() {
    this.page.on("otree.time.phase", (event) => {
      if (event.detail.input) {
        performance.mark("input");
      }
    });

    this.page.on("otree.page.response", () => {
      performance.mark("response");
      performance.measure("reaction_time", "input", "response");
    });
  }

  run() {
    performance.clearMeasures();
    performance.clearMarks();

    this.timed.forEach((phase, i) => {
      this._timers.delay(`phase-${i}`, () => this.toggle(phase), phase.time);
      if ("timeout" in phase) {
        this._timers.delay(`timeout`, () => this.timeout(), phase.time + phase.timeout);
      }
    });
  }

  toggle(phase) {
    this.current = phase;
    this.page.fire("otree.time.phase", phase);
  }

  timeout() {
    this.current = null;
    this.page.fire("otree.time.out");
    this.cancel();
  }

  switch(name) {
    this.toggle(this.named.get(name));
  }

  reset() {
    if (this.default) {
      this.toggle(this.default);
    }
  }

  cancel() {
    this._timers.cancel();
  }

  reaction_time() {
    let m = performance.getEntriesByName("reaction_time").slice(-1);
    if (m.length == 0) return undefined;
    return m[0].duration;
  }
}

function random_choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

var random = /*#__PURE__*/Object.freeze({
  __proto__: null,
  random_choice: random_choice
});

// directives register themselves

const utils = {
  dom, random, changes, timers
};

export { Directive, Game, Live, Page, Schedule, registerDirective, utils };
