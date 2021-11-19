import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Deferred } from "../../src/utils/deferred";
import { Page } from "../../src/page";
import { onPage } from "../../src/utils/events";
import { playRounds } from "../../src/utils/iterator";


/* Creates coroutines to mock interaction
 * @returns [game, resp]
 * - game: an async function to call for round result
 * - resp: a function to provide result
 */
function mock_game(page) {
  let player;

  async function game(iter) {
    player = new Deferred();
    // console.debug("game", iter);
    return player.promise;
  };

  function resp(status) {
    // console.debug("resp", status);
    player.resolve(status);
  }

  return [game, resp];
}


describe("iterator", () => {
  let body, page, elem, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div></div>`, { parentNode: body });
    page = new Page(body);
  });

  it("updates progress", async () => {
    let [game, resp] = mock_game(page);

    let completed = playRounds(page, game, 3, 0);

    // iter1

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 1, completed: 0, skipped: 0, solved: 0, failed: 0 } });

    resp({success: true});

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 1, completed: 1, skipped: 0, solved: 1, failed: 0 } });

    // iter 2

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 2, completed: 1, skipped: 0, solved: 1, failed: 0 } });

    resp({success: false});

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 2, completed: 2, skipped: 0, solved: 1, failed: 1 } });

    // iter 3

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 3, completed: 2, skipped: 0, solved: 1, failed: 1 } });

    resp({});

    detail = await pageEvent("otree.status");
    expect(detail).to.eql({ progress: { total: 3, current: 3, completed: 3, skipped: 1, solved: 1, failed: 1 } });

    await completed;
  });

  it("makes pauses", async () => {
    let [game, resp] = mock_game(page);
    let t0;

    let completed = playRounds(page, game, 2, 200);

    // iter 1
    await pageEvent("otree.status");
    resp({});
    await pageEvent("otree.status");
    t0 = Date.now();
    // iter 2
    await pageEvent("otree.status");
    expect(Date.now() - t0).to.be.within(200, 210);
    resp({});
    await pageEvent("otree.status");

    await completed;
  });

});
