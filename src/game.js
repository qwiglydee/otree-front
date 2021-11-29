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
   * Updates page with the provided status.
   *
   * @param {object} status flags
   * @fires Game.start
   * @fires Game.update
   */
  stop(status) {
    this.reset();
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
export async function playRound(game, conf) {
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
export async function iterateRounds(game, conf, num_rounds, trial_pause) {
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
