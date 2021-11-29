/** 
 * Utils to handle references to game state vars and manage their updates.
 * 
 * The references are just strings in form `obj.field.subfield`
 * 
 * @module utils/changes/Ref 
 */

const jspath_re = new RegExp(/^[a-zA-Z]\w+(\.\w+)*$/);

/**
 * Validates syntax of a reference 
 * 
 * @param {string} ref
 * @throws {Error}
 */
function validate(ref) {
  if (!ref || !jspath_re.exec(ref)) throw new Error(`Invalid ref: ${ref}`);
}

/**
 * Checks if references overlap 
 * 
 * Example: `Ref.includes("foo.bar", "foo.bar.baz")`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
function includes(parentref, nestedref) {
  return parentref == nestedref || nestedref.startsWith(parentref + ".");
}

/**
 * Strips common part of nested ref, making it local to parent
 *
 * Example: `Ref.strip("foo.bar", "foo.bar.baz") == "baz"`
 * 
 * @param {string} parentref reference to parent object
 * @param {string} nestedref reference to nested field
 * @returns {boolean}
 */
function strip(parentref, nestedref) {
  if (parentref == nestedref) {
    return "";
  } else if (nestedref.startsWith(parentref + ".")) {
    return nestedref.slice(parentref.length + 1);
  } else {
    throw new Error(`Incompatible refs: ${parentref} / ${nestedref}`);
  }
}

/**
 * Extract a value from object by a ref
 * 
 * Example: `Ref.extract({ foo: { bar: "Bar" } }, "foo.bar") == "Bar"`
 * 
 * @param {object} data 
 * @param {string} ref 
 * @returns {boolean}
 */
function extract(data, ref) {
  return ref.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), data);
}

/**
 * Sets a value in object by ref.
 * The original object is modified in place
 * 
 * Example: `Ref.update({foo: {bar: "Bar0" } }, "foo.bar", "Bar1") → {foo: {bar: "Bar1" } }`
 * 
 * @param {object} data 
 * @param {ref} ref 
 * @param {*} value 
 */
function update(data, ref, value) {
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
}

var ref = /*#__PURE__*/Object.freeze({
  __proto__: null,
  validate: validate,
  includes: includes,
  strip: strip,
  extract: extract,
  update: update
});

/** 
 * Utils to handle changes of game state data
 * 
 * @module utils/changes
 */

/**
 * A set of references to vars and their new values.
 * 
 * The references are in form `obj.field.subfield` and correspond to a game state.  
 */
class Changes extends Map {
  /**
   * @param {object} obj plain object describing changes 
   * @param {string} [prefix] a prefix to add to all the top-level fields, as if there was an above-top object  
   */
  
  constructor(obj, prefix) {
    let entries = [...Object.entries(obj)];
    if (prefix) {
      entries = entries.map(([k, v]) => [prefix + "." + k, v]);
    } 
    super(entries);
    this.forEach((v, k) => validate(k));
  }

  /** 
   * Checks if the changeset contains referenced var 
   * 
   * Example:
   *   ```
   *   changes = new Changes({ 'obj.foo': { ... } })
   *   changes.afects("obj.foo.bar") == true // becasue the `bar` is contained in `obj.foo` 
   *   ```
   * @param {string} ref
   */
  affects(ref$1) {
    return [...this.keys()].some((key) => includes(key, ref$1));
  }

  /** 
   * Picks single value from changeset.
   * 
   * Example:  
   *   ```
   *   changes = new Changes({ 'obj.foo': { bar: "Bar" } })
   *   changes.pick("obj.foo.bar") == "Bar"
   *   ```
   */
  pick(ref$1) {
    let affecting = [...this.keys()].filter((key) => includes(key, ref$1));
    if (affecting.length == 0) return undefined;
    if (affecting.length != 1) throw new Error(`Incompatible changeset for ${ref$1}`);
    affecting = affecting[0];

    let value = this.get(affecting);

    if (affecting == ref$1) {
      return value;
    } else {
      return extract(value, strip(affecting, ref$1));
    }
  }

  /** 
   * Apply changes
   * 
   * Modify an obj by all the changes.
   * 
   * Example:
   *    ```
   *    obj = { obj: { foo: { bar: "xxx" } } } 
   *    changes = new Changes({ 'obj.foo': { bar: "Bar" } })
   *    changes.patch(obj)
   * 
   *    obj == { obj: { foo: { bar: "Bar" } } }
   *    ```
   * 
   * It works with arrays as well, when using indexes as subfields.
   * 
   */
  patch(obj) {
    this.forEach((v, k) => {
      update(obj, k, v);
    });
  }
}

var changes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Ref: ref,
  Changes: Changes
});

/* map of selector => class */
const registry = new Map();

/** 
 * Registers a directive class.
 * 
 * The {@link Page} sets up all registered directives on all found elements in html.
 * The elements a searched by provided selector, which is something like `[data-ot-something]` but actually can be anything.
 * 
 * @param {string} selector a css selector for elements
 * @param {class} cls a class derived from {@link Directive}  
 */
function registerDirective(selector, cls) {
  registry.set(selector, cls);
}

/** 
 * Base class for directives.
 * 
 * Used by all built-in directives and can be used to create custom directives.
 */
class Directive {
  /** 
   * directive name
   * 
   * like "foo" for `data-ot-foo`
   * 
   * should be redefined in derived classes 
   */  
  get name() {
    return "foo";
  }

  /** 
   * Returns a value from dataset, corresponding to the name.
   * 
   * i.e. value of `data-ot-foo` attribute. 
   */
  param(name) {
    if (name === undefined) name = this.name; 
    return this.elem.dataset["ot" + name[0].toUpperCase() + name.slice(1).toLowerCase()];
  }

  /**
   * A directive instance is created for each matching element.
   * 
   * @param {Page} page 
   * @param {HTMLElement} elem 
   */
  constructor(page, elem) {
    this.page = page;
    this.elem = elem;
    this.handlers = new Map();
    this.init();
  }

  /** 
   * Binds an event handler.
   * 
   * Shorcut for page.on, with the handler bound to `this` directive.
   * 
   * @param {String} eventype
   * @param {Function} handler either `this.something` or a standalone function
   * @param {HTMLElement} [target=page] either the element itself or the page 
  */
  on(eventype, handler, target) {
    if (target === undefined || target === this.page) {
      target = this.page.body;
    }
    return this.page.on(eventype, handler.bind(this), target);
  }

  /** 
   * Initializes directive.
   *  
   * Use it to parse parameters from the element, and to init all the state.
   * 
   * Default implementation takes reference from corresponding attr and puts it into `this.ref`   
   */
  init() {
    this.ref = this.param(this.name);
    validate(this.ref); 
  } 

  /**
   * Sets up event handlers
   * 
   * Default implementation sets up `update` handler to check if `this.ref` is affected and to call `this.update`
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

var base = /*#__PURE__*/Object.freeze({
  __proto__: null,
  registry: registry,
  registerDirective: registerDirective,
  Directive: Directive
});

/** Main page.
 * 
 * Centeral point of synchronization.
 * 
 * Provides utils to fire and handle events.
 * 
 * Installs all registered directives, found in html. 
 * 
 * *NB*: The installation happens only once, directives won't work in dynamically added html code.
 * 
 */
class Page {
  /**
   * @param {HTMLElement} [body=document.body] the element to attach all the events 
   */ 
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

  /** 
   * Binds an event handler
   *
   * @param {String} type of an event
   * @param {function(event, detail)} handler
   * @param {HTMLElement} [target=page.body] an element to bind handler, instead of the page itself
   * @returns {Function} handler wrapper bound to events, the wrapper has method off() to unbind itself
   */
  on(type, handler, target) {
    target = target || this.body;
    const listener = (event) => handler(event, event.detail);
    listener.off = () => target.removeEventListener(type, listener);
    target.addEventListener(type, listener);
    return listener;
  }

  /** 
   * Waits for an event
   *
   * Returns a promise that resolves when an event happen.
   * 
   * *NB*: this doesb't catch events happened before the waiting started. For such cases you need to save the promise and await for it later.
   *
   * Example:
   *
   *    await page.wait('otree.time.out'); // suspend script until timeout fired
   *
   *    let waiting = page.wait('otree.time.out'); // start waiting without suspending
   *    // do some work during which a timeout might happen
   *    await waiting; // suspend for an event happend since the 'waiting' created
   *
   * @param {String} type of the event
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

  /** 
   * Fires an event
   * 
   * @param {String} type type of the event
   * @param {Object} detail any data to attach to the event
   * @param {HTMLElement} [target=page.body] an alternate element to fire at
   */
  fire(type, detail, target) {
    // console.debug("firing", type, detail);
    const event = new CustomEvent(type, { detail });
    target = target || this.body;
    // NB: queueing a task like a normal event, instead of dispatching synchronously
    setTimeout(() => target.dispatchEvent(event));
  }

  /** 
   * A shortcut to fire reset and update, indicating some data is deleted.
   * 
   * @param {string} [obj] alternate obj to reset (e.g. 'progress') 
   * @fires Page.reset
   * @fires Page.update
   */
  reset(obj="game") {
    this.fire("otree.page.reset", obj);
    this.fire("otree.page.update", new Changes({ [obj]: undefined }));
  }

  /** 
   * A shortcut to fire start
   *  
   * @fires Page.start
   */
  start() {
    this.fire("otree.page.start");
  }

  /** 
   * A shortcut to fire update.
   *  
   * @fires Page.update
   * @param {object|Canges} changes a plain object is autoconverted to {@link Changes} 
   */
   update(changes) {
    if (!(changes instanceof Changes)) changes = new Changes(changes);
    this.fire("otree.page.update", changes);
  }

  /** 
   * A shortcut to fire update.
   * To use in input directives.
   * 
   * @fires Page.response
   * @param {object} changes a plain object indicating any fields and values  
   */
   response(changes) {
    this.fire("otree.page.response", changes);
  }

  /** 
   * A shortcut to fire phase change.
   * To use to switch phases manually without {@link Schedule} 
   * 
   * @fires Schedule.phase
   * @param {Phase} phase all the flags of the phase  
   */
   toggle(phase) {
    this.fire("otree.time.phase", phase);
  }

  /** 
   * A shortcut to fire timeout.
   * To use to enforce the timeout.
   * 
   * @fires Schedule.timeout
   */
  timeout() {
    this.fire("otree.time.out");
  }
}

/**
 * Indicates that a user started a game pressing 'Space' or something.
 *  
 * @event Page.start
 * @property {string} type `otree.page.start` 
 */

/** 
 * Indicates that a game (or something else) has been reset.
 * 
 * @event Page.reset
 * @property {string} type `otree.page.reset` 
 * @property {string} detail an object being reset, i.e. 'game' or 'progress'
 */

/** 
 * Indicates that game state is updated and directives should refresh content. 
 * 
 * @event Page.update
 * @property {string} type `otree.page.update`
 * @property {Changes} detail changes
 */

/**
 * Indicates that a user provided some input.
 * 
 * The input is a plain object indicating some fields and values, it doesn't have to match game state structure  
 * 
 * @event Page.response
 * @property {string} type `otree.page.response`
 * @property {object} detail some set of fields and values
 */

/** @module utils/timers */


/**
 * Async sleeping
 * 
 * @param {number} time in ms 
 * @returns {Promise}
 */
async function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

/**
 * Delays function call
 * 
 * @param {Function} fn 
 * @param {number} delay in ms 
 * @returns {*} timer_id 
 */
function delay(fn, delay=0) {
    return window.setTimeout(fn, delay);
}

/**
 * Cancels delayed call
 * 
 * @param {*} id timer_id 
 */
function cancel(id) {
    window.clearTimeout(id);
}

/** 
 * Timers.
 * 
 * A set of timers with names
 */
class Timers {
    constructor() {
        this.timers = new Map();
    }

    /**
     * Delays function call
     * 
     * @param {sting} name 
     * @param {Function} fn 
     * @param {number} timeout in ms
     */
    delay(name, fn, timeout=0) {
        if (this.timers.has(name)) {
            cancel(this.timers.get(name));
        }
        this.timers.set(name, delay(fn, timeout));
    }

    /**
     * Cancels delayed calls by names.
     * 
     * @param  {...string} names one or more named calls to cancel, empty to cancel all 
     */
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

/**
 * Game logic
 *
 * Keeps game state and provides some utils to play.
 *
 * The game state is an arbitraty object holding all the data needed to play and display the game.
 * It is initially empty and updated via `update` method, that keeps it in sync with html directives.
 * 
 * @property {object} conf some constant config vars for the game (or a round)
 * @property {object} state the game state
 */
class Game {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.conf = {};
    this.state = {};
  }

  /**
   * Resets game to initial state:
   * - sets up config vars
   * - sets state data to empty object
   * - updates page with new 'conf'
   * - updates page with empty 'game' object
   *
   * @param {*} conf
   * @fires Page.update
   * @fires Page.reset
   */
  reset(conf) {
    this.conf = conf;
    this.page.update({ conf });
    this.state = {};
    this.page.reset("game");
  }

  /**
   * Updates game state.
   *
   * Applies given changes to game state, using {@link Changes}
   *
   * Signals them to the page, with all the field prefixed with 'game'.
   *
   * Example:
   *
   *   game.update({'foo': "Foo", 'bar': "Bar"})
   *   // is equiv:
   *   game.state.foo = "Foo";
   *   game.state.bar = "Bar";
   *   page.update({ 'game.foo': "Foo", 'game.bar': "Bar" });
   *
   * @param {Object} changes the changes to apply
   * @fires Page.update
   */
  update(changes) {
    new Changes(changes).patch(this.state);
    this.page.update(new Changes(changes, "game"));
  }

  /**
   * Signals game started.
   *
   * @param {object} status flags
   * @fires Game.start
   */
  start(status) {
    this.page.fire("otree.game.start", status);
  }

  /**
   * Signals game status change.
   *
   * @param {object} status flags and fields
   * @fires Game.status
   */
  status(status) {
    this.page.fire("otree.game.status", status);
  }

  /**
   * Signals game stopped.
   *
   * @param {object} status flags
   * @fires Game.stop
   */
  stop(status) {
    this.page.fire("otree.game.stop", status);
  }

  /**
   * Indicate some error, relevant to user.
   *
   * Triggers status event with `{ error: { code, message } }`
   *
   * @param {string} code
   * @param {string} message
   * @fires Game.status
   */
  error(code, message) {
    let error = { code, message };
    if (!code) {
      error = null;
    }

    this.page.fire("otree.game.error", error);
    this.page.update({ error });
  }

  /**
   * Disables inputs.
   *
   * Used to prevent sending input when it's not allowed.
   *
   * This overrides input flag from recent phase.
   *
   * @fires Schedule.phase
   */
  freeze() {
    // FIXME: this interferes with actual time phases
    this.page.fire("otree.time.phase", { input: false });
  }

  /**
   * Enables inputs.
   *
   * Used to restore input, when game round is continuing.
   *
   * This overrides input flag from recent phase.
   *
   * @fires Schedule.phase
   */
  unfreeze() {
    // FIXME: this interferes with actual time phases
    this.page.fire("otree.time.phase", { input: true });
  }
}

/**
 * Runs single round:
 * - resets game with the conf
 * - starts game
 * - waits for game stop
 *
 * @param {Game} game
 * @param {object} conf game config
 * @return {Promise} resolved with final status when game ends
 */
async function playRound(game, conf) {
  game.reset(conf);
  game.start();
  // everything goes in event handlers, eventually game.stop() is called
  let e = await game.page.wait("otree.game.stop");
  return e.detail; // final status
}

/**
 * Runs multiple game rounds, or an infinite loop.
 * Uses {@link playRound} function
 *
 * Updates page with progress = {@link Progress}
 *
 * The iterator expects final status (reported by `game.stop`) to contain:
 * - {bool} `success`: indicating if the round is successful/won
 * - {bool} `terminate`: indicateing that the loop should be terminated
 *
 * The provided config vars are passed to the `playRound` with additional field `iteration`
 *
 * @param {Game} game
 * @param {conf} conf config vars
 * @param {number|null} num_rounds number of rounds to play or null for infinite
 * @param {number} trial_pause pause between rounds in ms
 */
async function iterateRounds(game, conf, num_rounds, trial_pause) {
  let status = {};
  const progress = {
    total: num_rounds,
    current: 0,
    completed: 0,
    solved: 0,
    failed: 0,
  };

  const cont = num_rounds ? (i) => i <= num_rounds && !status.terminate : (i) => !status.terminate;

  for (let i = 1; cont(i); i++) {
    progress.current = i;

    game.page.update({ progress });

    status = await playRound(game, { iteration: i, ...conf });

    progress.completed += 1;
    progress.solved += status.success === true;
    progress.failed += status.success === false;

    game.page.update({ progress });

    await sleep(trial_pause);
  }

  return progress;
}

/**
 * An arbitrary set of flags and fields indicating state of a game process.
 * 
 * The status is ephemeral data and only exists in events. It does not reflect to page. 
 *
 * @typedef {object} Status
 * @property {bool} [success] indicates that game was sucessful (won)
 * @property {bool} [terminate] indicates termination of iterations loop
 */

/**
 * A progress during iterations loop.
 *
 * @typedef {object} Progress
 * @property {number|null} total total number of itterations, or null if it's infinite
 * @property {number} current current iteration, counting from 1
 * @property {number} completed number of completed rounds
 * @property {number} solved number of rounds with `success=true`
 * @property {number} failed number of rounds with `success=false`
 */

/**
 * Indicates a game has started.
 *
 * @event Game.start
 * @property {string} type `otree.game.start`
 * @property {Status} detail status flags
 */

/**
 * Indicates that gameplay process state changed.
 *
 * @event Game.status
 * @property {string} type `otree.game.status`
 * @property {Status} detail status flags
 */

/**
 * Indicates an error (relvant to user) happend.
 *
 * @event Game.error
 * @property {string} type `otree.game.error`
 * @property {object|null} detail contains `code` and `message`, or null for reseting error 
 */


/**
 * Indicates a game has stopped.
 *
 * @event Game.stop
 * @property {string} type `otree.game.stop`
 * @property {Status} detail final status flags
 */

/** Live Page
 * 
 * Convertings incoming and outgoing messages into events with type `otree.live.sometype`
 *   
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

  /** 
   * Sends a message
   * 
   * @param type {String} message type
   * @param message {Object} message payload
   * @fires Live.message
   */
  send(type, message) {
    const data = Object.assign({ type }, message);
    // console.debug("send", data);
    window.liveSend(data);
    this.page.fire(`otree.live.${type}`, message);
  }
}

/**
 * Live message.
 * 
 * Either received or sent.
 * 
 * @event Live.message
 * @property type {string} `otree.live.*` -- corresponding to message type  
 * @property detail {object} any message payload 
 */

/** 
 * Scheduling of timing phases.
 * 
 * Fires events according to timing table.
 * 
 * Measures reaction time from a moment when a phases had `input: true` to a `page.response` event, using browser `performance` utility.  
 * 
 * The phases are objects of type {@link Phase}. 
 * A phase without `time` and `name` is default, which is toggled at start or `schedule.reset` 
 */
class Schedule {

  /**
   * @param {Page} page 
   * @param {Phase[]} phases 
   */
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
    });
  }

  /**
   * Starts all the timers.
   * 
   * @fires Schedule.phase
   * @fires Schedule.timeout
   */
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

  /**
   * @param {Phase} phase the phase flags
   * @fires Schedule.phase
   */
  toggle(phase) {
    this.current = phase;
    this.page.fire("otree.time.phase", phase);
  }

  /**
   * @fires Schedule.timeout
   */
  timeout() {
    this.current = null;
    this.page.fire("otree.time.out");
    this.cancel();
  }

  /**
   * Switches to a named phase.
   * 
   * @param {string} name
   * @fires Schedule.phase 
   */
  switch(name) {
    this.toggle(this.named.get(name));
  }

  /**
   * Resets to a default phase (the one defined without `time` or `name)
   * 
   * @fires Schedule.phase
   */
  reset() {
    if (this.default) {
      this.toggle(this.default);
    }
  }

  /**
   * Cancels all scheduled timers.
   */
  cancel() {
    this._timers.cancel();
  }

  /**
   * Retrieves reaction time. 
   * 
   * In case of multiple responses the time is measured for the last response
   * 
   * @returns {number} reaction time in ms
   */
  reaction_time() {
    performance.measure("reaction_time", "input", "response");
    let m = performance.getEntriesByName("reaction_time").slice(-1);
    if (m.length == 0) return undefined;
    return m[0].duration;
  }
}

/**
 * A phase to schedule or switch manually.
 * 
 * Defines set of flags and fields indicating page state.
 * 
 * The set of fields can be extended by anything else needed for custom directives or anything. 
 * 
 * @typedef {Object} Phase
 * @property {number} [time] time in ms since start to toggle the phase
 * @property {string} [name] name of the phase to toggle it manually
 * @property {number} [timeout] number of ms since start of the phase to trigger timeout
 * @property {string} [display] display toggle for `ot-display` directives
 * @property {bool} [input] input toggle for `ot-input` directives   
 */

/**
 * Indicates that a phase has come.
 *  
 * @event Schedule.phase
 * @property {string} type `otree.time.phase` 
 * @property {Phase} detail phase
 */

/**
 * Indicates that timeout has happened.
 * 
 * @event Schedule.timeout
 * @property {string} type `otree.time.out` 
 */

/** 
 * Set of simple utils to manipulate DOM
 * @module utils/dom
 */

/** 
 * Loads an image asynchronously
 * 
 * Example:
 *   ```
 *   img = await loadImage("http://example.org/image.png");
 *   ```
 *  
 * @param {string} url url or dataurl to load
 * @returns {Promise} resolving to Image object
 */
function loadImage(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** 
 * Toggles visibility by setting 'display' css property.
 * 
 * @param {HTMLElement} elem
 * @param {boolean} display
 */
function toggleDisplay(elem, display) {
  elem.style.display = display ? null : "none";
}

/** 
 * Toggles disabled state by `.disabled` property (for inputs), and also `ot-disabled` class.
 * 
 * @param {HTMLElement} elem
 * @param {boolean} disabled
 */
 function toggleDisabled(elem, disabled) {
  elem.disabled = disabled;
  elem.classList.toggle("ot-disabled", disabled);
}

/** 
 * Checks if elem is disabled 
 * @param {HTMLElement} elem
 */
function isDisabled(elem) {
  return elem.classList.contains("ot-disabled");
}

/** 
 * Sets or deletes text content 
 * @param {HTMLElement} elem
 * @param {string|null} text 
 */
function setText(elem, text) {
  // NB: using `innerText` to render line breaks
  elem.innerText = text == null ? "" : text;
}

/** 
 * Sets element classes 
 * @param {HTMLElement} elem
 * @param {string[]} classes
 */
function setClasses(elem, classes) {
  elem.classList.remove(...elem.classList);
  elem.classList.add(...classes);
}

/** 
 * Sets or deletes an attribute 
 * 
 * @param {HTMLElement} elem
 * @param {string} attr
 * @param {string|null} val
 */
function setAttr(elem, attr, val) {
  if (val == null) {
    elem.removeAttribute(attr);
  } else {
    elem.setAttribute(attr, val);
  }
}

/** 
 * Inserts single child element or empties elem.
 *  
 * @param {HTMLElement} elem
 * @param {HTMLElement|null} child
 */
function setChild(elem, child) {
  if (child == null) {
    elem.replaceChildren();
  } else {
    elem.replaceChildren(child);
  }
}

/** 
 * Checks if an elem is a text input or textarea
 *  
 * @param {HTMLElement} elem
 * @returns {boolean}
 */
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

/**
 * Directive `data-ot-start`
 * 
 * It is activated by any configured trigger `data-ot-key="keycode"`, `data-ot-touch`, `data-ot-click`, and triggers {@link Page.event:start}. 
 * 
 * @hideconstructor
 */
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
    toggleDisabled(this.elem, true);
  }
}

registerDirective("[data-ot-start]", otStart);

/**
 * Directive `data-ot-display="phaseflag"`
 * 
 * It shows/hides an element when {@link Phase} contains matching `display` field.
 * If the phase doesn't contain the field, it is ignored (i.e. phases toggling just `input` do not affect the display). 
 * 
 * @hideconstructor
 */
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

/**
 * Directive `data-ot-input="field"` for real inputs: `<input>`, `<select>`, `<textarea>`.
 * 
 * It triggers {@link Page.event:response} when value of the input changes.
 * For text inputs it triggers when `Enter` pressed.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otRealInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    this.ref = this.param();
    validate(this.ref);
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


/**
 * Directive `data-ot-input="field"` for custom inputs: any `<div>`, `<span>`, `<button>`, `<kbd>`.
 * 
 * The directive should be accompanied with method of triggering `data-ot-
 * 
 * It triggers {@link Page.event:response} by a configred trigger:
 * - `data-ot-click` to trigger on click
 * - `data-ot-touch` to trigger on touch
 * - `data-ot-key="keycode" to trigger on keypress
 * 
 * The list of available is at MDN: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values  
 * Basically, it is something like 'Enter', 'Space', 'Escape', or 'KeyQ' for "q" key.
 * 
 * The input gets disabled according to {@link Phase} flag `input` 
 * 
 * @hideconstructor
 */
class otCustomInput extends Directive {
  get name() {
    return "input";
  }

  init() {
    const param = this.param();
    const match = param.match(/^([\w.]+)(=(.+))$/);
    if (!match) throw new Error(`Invalid expression for input: ${param}`);

    this.ref = match[1];
    validate(this.ref);
    
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

/**
 * Directive `data-ot-class="reference"`
 * 
 * It adds a class with a value from `{@link Page.event:update}`.
 * All other existing lasses are preserved. 
 */
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

/**
 * Directive `data-ot-text="reference"`
 * 
 * It inserts text content from {@link Page.event:update}.
 * 
 * @hideconstructor
 */
class otText extends Directive {
  get name() {
    return "text";
  }

  update(changes) {
    setText(this.elem, changes.pick(this.ref)); 
  }
}

registerDirective("[data-ot-text]", otText);

/**
 * Directive `data-ot-img="reference"`
 * 
 * It inserts image element from {@link Page.event:update} inside its host.
 * The value in the Changes should be an instance of created and pre-loaded Image element. 
 * 
 * @hideconstructor
 */
class otImg extends Directive {
  get name() {
    return "img";
  }

  update(changes) {
    let img = changes.pick(this.ref);
    if (!!img && !(img instanceof Image)) {
      throw new Error(`Invalid value for image: ${img}`);
    }
    console.debug("ot-img", this.elem, img);
    setChild(this.elem, img);
  }
}

registerDirective("[data-ot-img]", otImg);

/**
 * Directives `data-ot-attr-something="reference"`
 * 
 * The allowed attributes are: 
 * - `disabled` 
 * - `hidden` 
 * - `height` 
 * - `width` 
 * - `min` 
 * - `max` 
 * - `low` 
 * - `high` 
 * - `optimum` 
 * - `value` 
 * 
 * It deletes or sets value of the attribute to a value from {@link Page.event:update}.
 * 
 * @hideconstructor
 */
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

/**
 * Directive `data-ot-when="reference"` and `data-ot-when="reference==value"`.
 * 
 * It shows host element by {@link Page.event:update}, when referenced field is defined, true-like or matches specified value.
 * 
 * @hideconstructor
 */
class otWhen extends Directive {
  get name() {
    return "when";
  }

  init() {
    const when = this.param();
    const match = when.match(/^([\w.]+)(==(.+))?$/);
    if (!match) throw new Error(`Invalid expression for when: ${when}`);
    
    this.ref = match[1];
    validate(this.ref);
    
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

/** @module utils/random */

/**
 * Makes random choice from an array
 * 
 * @param {Array} choices
 */
function random_choice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

var random = /*#__PURE__*/Object.freeze({
  __proto__: null,
  random_choice: random_choice
});

const utils = {
  dom, random, changes, timers
};

export { Game, Live, Page, Schedule, base as directives, iterateRounds, playRound, utils };
