import { sleep } from "./timers";


/** Runs game rounds
 * Runs provided game iteratively and updates progress.
 * The provided game should be an asunc function that resolves to status `{ success: bool, ...}`
 *
 * Progress is reported via event `otree.status` with progress counters:
 * - total: total number of iterations
 * - current: current iteration
 * - completed: number of passed iterations
 * - solved: number of iteration with success == true
 * - failed: number of iteration with success == false
 * - skipped: number of iterations with undefined success
 *
 * @param page {Page} main page
 * @param game {Function} async function that resolves to
 * @param count {Number} number of rounds to play
 * @param delay {Number} delay between (after) rounds
 */
export async function playRounds(page, game, count, delay) {
  const progress = {
    total: count,
    current: 0,
    completed: 0,
    skipped: 0,
    solved: 0,
    failed: 0
  }
  let status;

  for(let i=1; i<=count; i++) {
    progress.current = i;

    page.status({progress});

    // console.debug("waiting", i);
    status = await game(i);
    // console.debug("received", i);

    progress.completed += 1;
    progress.solved  += status.success === true;
    progress.failed  += status.success === false;
    progress.skipped += status.success === undefined;

    page.status({progress});

    await sleep(delay);
  }
}
