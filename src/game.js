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
 * @property {object} conf constant config vars
 * @property {object} state main game data
 * @property {object} status set of flags indicating game status
 * @property {object} result result data
 * @property {object} error in form of `{ code, message }`
 * @property {number} iteration when in iterations loop
 */
export class Game {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.config = {};
    this.state = {};
    this.status = {};
    this.error = undefined;
    this.result = undefined;
    this.iteration = undefined;
  }

  /**
   * Sets config and resets game.
   *
   * The page is updated forr 'config' vars.
   *
   * @param {object} config
   * @fires Page.update
   */
  setup(config) {
    this.config = config;
    this.page.emitUpdate({ config });
  }

  /**
   * Resets game to initial state.
   *
   * Sets `state`, `status`, `error`, `result` to empty objects or nulls.
   * Updates page with all the affected objects.
   *
   * @fires Page.reset
   */
  reset() {
    this.state = {};
    this.page.emitReset("game");
    this.status = {};
    this.page.emitReset("status");
    this.error = undefined;
    this.page.emitReset("error");
    this.result = undefined;
    this.page.emitReset("result");
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
   *   game.updateState({'foo': "Foo", 'bar': "Bar"})
   *   // is equiv:
   *   game.state.foo = "Foo";
   *   game.state.bar = "Bar";
   *   page.update({ 'game.foo': "Foo", 'game.bar': "Bar" });
   *
   * @param {Object} changes the changes to apply
   * @fires Page.update
   */
  updateState(changes) {
    new Changes(changes).patch(this.state);
    this.page.emitUpdate(new Changes(changes, "game"));
  }

  /**
   * Sets game status.
   *
   * @param {Object} status
   * @fires Game.status
   */
  setStatus(status) {
    this.status = status;
    this.page.emitEvent("ot.status", status);
    this.page.emitUpdate({ status });
  }

  /**
   * Sets error with a code and a message
   *
   * Updates 'error' page variables.
   *
   * @param {string} code
   * @param {string} message
   * @fires Game.error
   * @fires Page.update
   */
  setError(code, message) {
    this.error = { code, message };
    this.page.emitEvent("ot.error", this.error);
    this.page.emitUpdate({ error: this.error });
  }

  /**
   * Clears error.
   *
   * Resets 'error' page variables.
   *
   * @fires Game.error
   * @fires Page.reset
   */
  clearError() {
    this.error = undefined;
    this.page.emitEvent("ot.error", null);
    this.page.emitReset("error");
  }

  /**
   * Signals game start.
   *
   * @fires Game.start
   */
  start() {
    this.page.emitEvent("ot.started");
  }

  /**
   * Signals game completion.
   *
   * @param {object} result some result data.
   * @fires Game.complete
   */
  complete(result) {
    this.result = result;
    this.page.emitEvent("ot.completed", result);
    this.page.emitUpdate({ result });
  }

  /**
   * Plays a game (single round)
   *
   * @returns {Promise} resolving with result when game completes
   */
  async play() {
    this.reset();
    this.start();
    let result = (await this.page.waitEvent("ot.completed")).detail;
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
    let result;

    const progress = {
      total: num_rounds,
      current: 0,
      completed: 0,
      solved: 0,
      failed: 0,
    };

    // continue until num_rounds or _i is deleted
    const cont = num_rounds ? (i) => i && i <= num_rounds : (i) => i;

    for (this.iteration = 1; cont(this.iteration); this.iteration++) {
      progress.current = this.iteration;

      this.page.emitUpdate({ progress });

      result = await this.play();

      progress.completed += 1;
      progress.solved += result.success === true;
      progress.failed += result.success === false;

      this.page.emitUpdate({ progress });

      await sleep(trial_pause);
    }

    return progress;
  }

  /**
   * Cancels iterations loop.
   */
  stopIterations() {
    delete this.iteration;
  }

  /**
   * Sets handler for {@link Game.event:started}
   *
   * @type {Game~onStart}
   */
  set onStart(fn) {
    this.page.onEvent("ot.started", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.status}
   *
   * @type {Game~onStatus}
   */
  set onStatus(fn) {
    this.page.onEvent("ot.status", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.error}
   *
   * @type {Game~onError}
   */
  set onError(fn) {
    this.page.onEvent("ot.error", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Game.completed}
   *
   * @type {Game~onCompleted}
   */
  set onComplete(fn) {
    this.page.onEvent("ot.completed", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Schedule.timeout}
   *
   * @type {Game~onTimeout}
   */
  set onTimeout(fn) {
    this.page.onEvent("ot.timeout", (ev) => fn(ev.detail));
  }

  /**
   * Sets handler for {@link Page.input}
   *
   * @type {Game~onInput}
   */
  set onInput(fn) {
    this.page.onEvent("ot.input", (ev) => fn(ev.detail));
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
