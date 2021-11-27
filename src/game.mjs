import { sleep } from "../src/utils/timers.mjs";
import { Deferred } from "../src/utils/deferred.mjs";
import { Changes } from "../src/utils/changes.mjs";

/** Base game
 * Base utilities to construct game logic
 */
export class Game {
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
