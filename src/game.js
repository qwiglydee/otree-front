import { sleep } from "../src/utils/timers";
import { Changes } from "../src/utils/changes";

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
export class Game {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.state = {};
  }

  /**
   * Resets game to initial state:
   * - sets state data to empty object
   * - updates page with empty 'game' object
   *
   * @fires Page.reset
   */
  reset() {
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
  start(params) {
    this.page.fire("ot.started", params);
  }

  /**
   * Signals game status change.
   *
   * @param {object} status flags and fields
   * @fires Game.status
   */
  status(status) {
    this.page.fire("ot.status", status);
  }

  /**
   * Signals game completed.
   *
   * @param {object} results some result flags.
   * @fires Game.stop
   */
  complete(result) {
    this.page.fire("ot.completed", result);
  }

  /**
   * Triggers an error event and update of `{ error: { code, message } }`
   *
   * @param {string} code
   * @param {string} message
   * @fires Game.error
   * @fires Page.update
   */
  error(code, message) {
    let error = { code, message };
    if (!code) {
      error = null;
    }

    this.page.fire("ot.error", error);
    this.page.update({ error });
  }

  /**
   * Plays a game (single round)
   * 
   * @param {object} params to pass to `game.start()` 
   * @returns {Promise} resolving when game completes  
   */
  async play(params) {
    this.reset();
    this.start(params);
    let result = (await this.page.wait("ot.completed")).detail;
    return result;
  }

  /**
   * Runs multiple game rounds, or an infinite loop.
   * Each iteration calls `this.start({ iteration: i })` and waits for `ot.completed`
   *
   * The iterator expects final result (reported by `game.complete`) to contain:
   * - {bool} `success`: indicating to count solved/failed iterations
   * - {bool} `terminate`: signalling that the loop should be terminated
   *
   * @param {number|null} num_rounds number of rounds to play or null for infinite
   * @param {number} trial_pause pause between rounds in ms
   */
  async playIterations(num_rounds, trial_pause) {
    const game = this;

    let status = {};
    const progress = {
      total: num_rounds,
      current: 0,
      completed: 0,
      solved: 0,
      failed: 0,
    };

    const cont = num_rounds
      ? (i) => i <= num_rounds && !status.terminate
      : (i) => !status.terminate;

    for (let i = 1; cont(i); i++) {
      progress.current = i;

      this.page.update({ progress });

      status = await this.play({ iteration: i });

      progress.completed += 1;
      progress.solved += status.success === true;
      progress.failed += status.success === false;

      this.page.update({ progress });

      await sleep(trial_pause);
    }

    return progress;
  }

  /**
   * Sets handler for {@link Game.event:started}
   * 
   * @type {Game~onStart} 
   */
  set onStart(fn) {
    this.page.on("ot.started", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.status}
   * 
   * @type {Game~onStatus} 
   */
  set onStatus(fn) {
    this.page.on("ot.status", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.error}
   * 
   * @type {Game~onError} 
   */
  set onError(fn) {
    this.page.on("ot.error", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.completed}
   * 
   * @type {Game~onCompleted} 
   */
  set onComplete(fn) {
    this.page.on("ot.completed", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Schedule.phase}
   * 
   * @type {Game~onPhase} 
   */
  set onPhase(fn) {
    this.page.on("ot.phase", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Schedule.timeout}
   * 
   * @type {Game~onTimeout} 
   */
  set onTimeout(fn) {
    this.page.on("ot.timeout", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Page.input}
   * 
   * @type {Game~onInput} 
   */
  set onInput(fn) {
    this.page.on("ot.input", (ev) => fn(ev.detail));
  }
}

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
 * Indicates that a game (or something else) has been reset.
 *
 * @event Game.reset
 * @property {string} type `ot.reset`
 * @property {string} detail an object being reset, i.e. 'game' or 'progress'
 */


/**
 * Indicates a game has started.
 *
 * @event Game.started
 * @property {string} type `ot.started`
 * @property {params} detail some params, like `{ iteration: i }`
 */

/**
 * @callback Game~onStart
 * @param {object} params some staring params such as provided by {@link Game.start}
 */

/**
 * Indicates some game conditions changed.
 *
 * @event Game.status
 * @property {string} type `ot.status`
 * @property {object} detail some flags
 */

/**
 * @callback Game~onStatus
 * @param {object} status some staring params provided by `game.status`
 */

/**
 * Indicates an error (relvant to user) happend.
 *
 * @event Game.error
 * @property {string} type `ot.error`
 * @property {object|null} detail contains `code` and `message`, or null for reseting error
 */

/**
 * @callback Game~onError
 * @param {object} error `{ code, message}`
 */

/**
 * Indicates a game has completed.
 *
 * @event Game.completed
 * @property {string} type `ot.completed`
 * @property {object} detail result data indicating game outcome
 */

/**
 * @callback Game~onCompleted
 * @param {object} result 
 */
