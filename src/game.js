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

    this.trial = {};
    this.status = {};
    this.feedback = undefined;
  }

  /**
   * Sets config and resets game.
   *
   * The page is updated forr 'config' vars.
   *
   * @param {object} config
   * @fires Page.update
   */
  setConfig(config) {
    this.config = config;
    this.page.emitUpdate({ config });
  }

  /**
   * Resets all trial-related data and game state.
   *
   * Sets `trial`, `status`, `feedback` to empty objects or nulls.
   * Updates page with all the affected objects.
   *
   * Calls loadTrial hook.
   *
   * @fires Page.reset
   */
  resetTrial() {
    this.trial = {};
    this.status = {};
    this.feedback = undefined;
    this.page.emitReset(["trial", "status", "feedback"]);
    this.loadTrial();
  }

  /**
   * Sets initial game state.
   *
   * Sets initial trial data and updates page.
   * Calls startTrial hook after page update.
   *
   * @param {Object} trial
   * @fires Page.update
   */
  async setTrial(trial) {
    this.trial = trial;

    this.page.emitUpdate({ trial });
    await this.page.waitForEvent("ot.update"); // make sure the hook is called after page update
    this.startTrial(this.trial);
  }

  /**
   * Updates game state.
   *
   * Applies given changes to game state, using {@link Changes}
   *
   * @param {Object} changes the changes to apply
   * @fires Page.update
   */
  updateTrial(changes) {
    new Changes(changes).patch(this.trial);
    this.page.emitUpdate(new Changes(changes, "trial"));
  }

  /**
   * Sets game status.
   *
   * Provided flags are updated in game.status
   *
   * @param {Object} status
   * @fires Page.update
   * @fires Game.status
   */
  updateStatus(changes) {
    let status = this.status;
    Object.assign(status, changes);
    this.page.emitUpdate({ status: changes });
    this.page.emitEvent("ot.status", changes);
    if (changes.trialStarted) {
      this.page.emitEvent("ot.started");
    }
    if (changes.trialCompleted) {
      this.page.emitEvent("ot.completed");
    }
    if (changes.gameOver) {
      this.page.emitEvent("ot.gameover");
    }
  }

  /**
   * Sets feedback
   *
   * Calls hook onFeedback(feedback)
   *
   * @param {string} code
   * @param {string} message
   * @fires Page.update
   */
  setFeedback(feedback) {
    this.feedback = feedback;
    this.page.emitUpdate({ feedback });
    this.onFeedback(this.feedback);
  }

  /**
   * Clears feedback.
   *
   * @fires Page.reset
   */
  clearFeedback() {
    this.feedback = undefined;
    this.page.emitReset("feedback");
  }

  /**
   * Sets progress
   *
   * Calls hook onProgress(progress)
   *
   * @param {string} code
   * @param {string} message
   * @fires Page.update
   */
  setProgress(progress) {
    this.progress = progress;
    this.page.emitUpdate({ progress });
    this.onProgress(this.progress);
  }

  /**
   * Clears progress.
   *
   * @fires Page.reset
   */
  resetProgress() {
    this.progress = undefined;
    this.page.emitReset("progress");
  }

  /**
   * A hook called to retrieve initial Trial data.
   * Shuld call setTria l
   */
  loadTrial() {
    throw new Error("Implement the `loadTrial` hook");
  }

  /**
   * A hook called after trial loaded.
   *
   * Should start all game process.
   *
   * @param {Object} trial reference to game.trial
   */
  startTrial(trial) {
    throw new Error("Implement the `startTrial` hook");
  }

  /**
   * A hook called when setFeedback
   *
   * @param {Object} feedback reference to game.feedback
   */
  onFeedback(feedback) {}

  /**
   * A hook called after setProgress
   *
   * @param {Object} progress reference to game.progress
   */
  onProgress(progress) {}

  /**
   * A handler for {@link Page.ready}
   *
   * @type {Game~onReady}
   */
  set onReady(fn) {
    this.page.onEvent("ot.ready", (ev) => fn());
  }

  /**
   * A handler for {@link Page.input}
   *
   * @type {Game~onInput}
   */
  set onInput(fn) {
    this.page.onEvent("ot.input", (ev) => fn(ev.detail.name, ev.detail.value));
  }

  /**
   * A handler for {@link Page.phase}
   *
   * Does not get triggered on resetting and temporaty freezing/unfreezing/switching.
   *
   * @type {Game~onPhase}
   */
  set onPhase(fn) {
    this.page.onEvent("ot.phase", (ev) => {
      if (ev.detail._resetting || ev.detail._freezing || ev.detail._switching) return;
      fn(ev.detail);
    });
  }

  /**
   * A handler for {@link Schedule.timeout}
   *
   * @type {Game~onTimeout}
   */
  set onTimeout(fn) {
    this.page.onEvent("ot.timeout", (ev) => fn(ev.detail));
  }

  /**
   * A handler for {@link Game.status}
   *
   * @type {Game~onStatus}
   */
  set onStatus(fn) {
    this.page.onEvent("ot.status", (ev) => fn(this.status, ev.detail));
  }

  /**
   * Plays a game trial.
   *
   * It resets trial and waits for status update with trial_completed
   *
   * @returns {Promise} resolving with result when game completes
   */
  async playTrial() {
    this.resetTrial();
    await this.page.waitForEvent("ot.completed");
  }

  async playIterations() {
    while (!this.status.gameOver) {
      await this.playTrial();
      await sleep(this.config.post_trial_pause);
    }
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
