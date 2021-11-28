import { sleep } from "../src/utils/timers";
import { Deferred } from "../src/utils/deferred";
import { Changes } from "../src/utils/changes";

/** 
 * Game logic
 * 
 * Keeps game state and provides some utils to play.
 * 
 * The game state is an arbitraty object holding all the data needed to play and display the game.
 * It is initially empty and updated via `update` method, that keeps it in sync with html directives.
 *
 * @property {object} state the game state 
 */
export class Game {
  /**
   * 
   * @param {Page} page 
   */
  constructor(page) {
    this.page = page;
    this.state = {};
  }

  reset() {
    this.state = {};
    this.page.reset('game');
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
   * Signals game status.
   * 
   * If the status contains `completed==true` it also indicates end of the game.
   * 
   * The page is updated with the status prefixed with `status`, so that directives can reference and display it. 
   * 
   * Example: 
   *   game.status({'foo': bar})
   *   // fires `page.update({ 'status.foo': "bar" })`
   * 
   * @param {Status} status flags and fields
   * @fires Game.status
   * @fires Page.update
   */
  status(status) {
    this.page.fire("otree.game.status", status);
    this.page.update(new Changes(status, "status"));

    if (status.completed) this.running.resolve(status);
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

  /** 
   * Plays single round.
   *
   * Waits for status to be signalled with flag `completed==true`.
   * 
   * @param {Object} gameconf any config for the round. 
   *   when called from iterateRounds, the config contains `iteration`
   * @returns {Promise} resolving with game status when the round is completed
   * @fires Game.start
   * @fires Game.stop
   */
  async playRound(gameconf) {
    this.running = new Deferred();

    this.reset();
    this.page.fire("otree.game.start", gameconf);

    // TODO:  
    // await page.wait('otree.game.stop') 

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

  /** 
   * Plays multiple rounds
   *
   * If the loop is infinite (no num_rounds), it is terminated when `status.terminate==true`
   * 
   * Makes pauses between iteratiosn. During the pause game is not reset, so that user sees final game state. 
   * 
   * @param {object} gameconf any config params, it is extended with `iteration` when passed to `playRound`
   * @param {number} num_rounds number of rounds to play, null for infinite loop
   * @param {number} trial_pause delay between rounds, in ms
   * @returns {Promise} resolving with progress, when loop terminates 
   * @fires Game.status with {@link Progress}
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


/**
 * A set of flags and fields indicating changes in game status.
 * 
 * Arbitrary other fields can be added to fit a game scenario.  
 * 
 * @typedef {object} Status
 * @property {bool} [completed] indicates a game is completed
 * @property {bool} [terminate] indicates termination of iterations loop
 * @property {bool} [success] indicates that game was sucessful (won)
 * @property {Progress} [progress] progress updated from iterations loop  
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
 * @property {number} skipped number of rounds without `success` status
 */

/**
 * Indicates a game round started.
 * 
 * @event Game.start
 * @property type {string} `otree.game.start`
 * @property detail {object} config of the game or a round
 */

/**
 * Indicates a game status changed.
 * 
 * @event Game.status
 * @property type {string} `otree.game.status`
 * @property detail {Status} any flags or fields
 */

/**
 * Indicates a game stopped.
 * 
 * @event Game.stop
 * @property type {string} `otree.game.stop`
 * @property detail {Status} final status
 */

