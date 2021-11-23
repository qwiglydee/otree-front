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
    this.status = {
      completed: null,
      success: null,
      wait: null,
      terminated: false,
    };
  }

  async init() {
    // override in derived classes
    // use to bind event handlers
    throw new Error("The method `stop` should be defined.");
  }

  /** install event handler
   * a shortcut for `page.on`
   * 
   * Example:
   * 
   *  init() {}
   *    this.on("otree.something", this.oNsomething)
   *  }
   *  
   *  onSomething(data) {
   *  }
   *  
   */
  on(eventtype, handler) {
    return this.page.on(
      eventtype,
      async (page, params, event) => await handler.bind(this)(event.detail)
    );
  }


  /** updates game state and page 
   * 
   * @params changes {Object} of form `{ 'field.subfield': newvalue, ... }`
  */
  updateState(changes) {
    changes = new Changes(changes);
    changes.patch(this.state);
    this.page.update(changes);
  }

  /** sets status
   * sets current status and checks if the round is completed
   * @param status {Object} 
   *  - completed {bool}: if a game round is ended
   *  - wait {bool}: if its completed but should wait for timeout
   *  - terminate {bool}: terminate iterations loop (used by `iterateRounds`) 
   */
  async setStatus(status) {
    this.status = status;
    this.page.status(status);
    if (status.completed) {
      if (status.wait) {
        await this.page.wait("otree.timeout");
      }
      this.running.resolve(status);
    }
  }

  freezeInputs() {
    this.page.toggle({ input: false });
  }

  unfreezeInputs() {
    // FIXME: may collide state defined by phases
    this.page.toggle({ input: true });
  }

  fireError(code, message) {
    this.page.error(code, message);
    this.onError({ code, message });
  }

  /** plays single round
   * @param gameconf {Object}
   *   any config params for the round
   *   when called from iterateRounds, the conf contains `iteration`
   * @returns {Promise} resolving with game status when the round is completed
   */
   async playRound(gameconf) {
    this.running = new Deferred();
    this.state = {};
    this.status = {};

    this.page.status(this.status);
    this.page.fire("otree.round");
    await this.start();

    // all game play runs asynchronously

    return this.running.promise.then(async () => {
      await this.stop();
      return this.status;
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
   * @param gameconf
   *   any config params for the round
   *   it is extended with `iteration` when passed to `playRound`
   * @param num_rounds
   *   number of rounds to play, null for infinite loop
   *   the loop is terminated when `status.terminate == true`
   * @param trial_pause
   *   delay between rounds
   * @returns {Promise} resolving with game progress when all rounds are played
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
    let status;

    let roundconf = { ...gameconf };

    const cnt = (i) => (num_rounds ? i <= num_rounds : true) && !this.status.terminate;
    for (let i=1; cnt(i); i++) {
      roundconf.iteration = i;
      progress.current = i;

      this.page.status({ progress });

      status = await this.playRound(roundconf);

      this.updateProgress(progress, status);

      this.page.status({ progress });

      await sleep(trial_pause);
    }

    return progress;
  }

  /** starting hook
   * runs before a game round is started.
   *
   * should load game state, start timing schedule or enable inputs
   */
  async start() {
    throw new Error("The method `start` should be defined.");
  }

  /** stopping hook
   * runs after a game round is completed.
   */
  async stop(status) {
    throw new Error("The method `stop` should be defined.");
  }

  onError(error) {
    throw new Error("The method `onError` should be defined.");
  }
}


/** stub for trials game 
 * just a bunch of hooks
 */
class Trials extends Game {
  async init() {
    this.on("otree.response", this.onResponse);
    this.on("otree.timeout", this.onTimeout);
  }

  /** response hook
   * runs when a response is given by user
   */
  async onResponse(data) {
    throw new Error("The method `onResponse` should be defined.");
  }

  /** timeout hook
   * runs when a trial timeouted by schedule
   */
  async onTimeout(data) {
    throw new Error("The method `onTimeout` should be defined.");
  }

  /** error hook
   * runs when error is explicitely triggered
   */
  async onError() {
    throw new Error("The method `stop` should be defined.");
  }
}

/** stub for trials game on live page
 * just a bunch of hooks
 */
class LiveTrials extends Game {
  init() {
    this.on("otree.live.trial", this.onTrial);
    this.on("otree.live.feedback", this.onFeedback);
    this.on("otree.response", this.onResponse);
    this.on("otree.timeout", this.onTimeout);
  }

  /** response hook
   * runs when a response is given by user
   */
  async onResponse(data) {
    throw new Error("The method `onResponse` should be defined.");
  }

  /** timeout hook
   * runs when a trial timeouted by schedule
   */
  async onTimeout(data) {
    throw new Error("The method `onTimeout` should be defined.");
  }

  /** trial hook
   * runs when a trial received from server
   */
  async onTrial(data) {
    throw new Error("The method `onTrial` should be defined.");
  }

  /** feedback hook
   * runs when a feedback received from server
   */
  async onFeedback(data) {
    throw new Error("The method `onFeedback` should be defined.");
  }

  /** error hook
   * runs when error is explicitely triggered
   */
  async onError() {
    throw new Error("The method `stop` should be defined.");
  }
}


class Puzzle extends Game {
}

class LivePuzzle extends Game {
}

class MultiPlayer extends Game {
}




