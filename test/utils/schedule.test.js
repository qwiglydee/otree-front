import { expect, oneEvent, aTimeout, nextFrame  } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Schedule } from "../../src/utils/schedule";

describe("schedule", () => {
  let body, page, schedule, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
  });

  it("runs phases", async () => {
    schedule = new Schedule(page, [
      { time: 0, foo: "foo0" },
      { time: 100, foo: "foo1" },
      { time: 200, foo: "foo2" },
    ]);

    const t0 = Date.now();
    schedule.run();

    detail = await pageEvent("otree.page.phase");
    expect(detail).to.eql({ time: 0, foo: "foo0" });
    expect(Date.now() - t0).to.be.within(0, 10);

    detail = await pageEvent("otree.page.phase");
    expect(detail).to.eql({ time: 100, foo: "foo1" });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.page.phase");
    expect(detail).to.eql({ time: 200, foo: "foo2" });
    expect(Date.now() - t0).to.be.within(200, 210);
  });

  it("fails to take 2 timeouts", async () => {
    expect(
      () =>
        new Schedule(page, [
          { time: 100, foo: "foo1", timeout: 200 },
          { time: 200, foo: "foo1", timeout: 200 },
        ])
    ).to.throw;
  });

  it("timeouts", async () => {
    schedule = new Schedule(page, [{ time: 100, foo: "foo1", timeout: 200 }]);

    const t0 = Date.now();
    schedule.run();

    detail = await pageEvent("otree.page.phase");
    expect(detail).to.eql({ time: 100, foo: "foo1", timeout: 200 });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.page.timeout");
    expect(detail).to.be.null;
    expect(Date.now() - t0).to.be.within(300, 310);
  });

  it("cancels timers after timeout", async () => {
    let counter = 0;

    page.body.addEventListener("otree.page.phase", (e) => {
      counter++;
    });

    schedule = new Schedule(page, [
      { time: 100, foo: "foo1", timeout: 200 },
      { time: 500, foo: "foo5" },
    ]);

    const t0 = Date.now();
    schedule.run();

    detail = await pageEvent("otree.page.phase");
    expect(counter).to.eq(1);
    expect(detail).to.eql({ time: 100, foo: "foo1", timeout: 200 });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.page.timeout");
    expect(detail).to.be.null;
    expect(Date.now() - t0).to.be.within(300, 310);

    await aTimeout(1000);
    expect(counter).to.eq(1);
  });

  it("fails to take 2 named", async () => {
    expect(
      () =>
        new Schedule(page, [
          { name: "foo", foo: "foo1", timeout: 200 },
          { name: "foo", foo: "foo1", timeout: 200 },
        ])
    ).to.throw;
  });

  it("triggers named phases", async () => {
    schedule = new Schedule(page, [{ name: "foo", foo: "foo1" }]);

    schedule.trigger("foo");
    detail = await pageEvent("otree.page.phase");
    expect(detail).to.eql({ name: "foo", foo: "foo1" });
  });

  it("measures reaction", async () => {
    schedule = new Schedule(page, [{ time: 100, foo: "foo1", input: true }]);
    
    schedule.run();
    
    await pageEvent("otree.page.phase");

    await aTimeout(200);
    page.fire('otree.page.response');

    await pageEvent("otree.page.response");

    let reaction = schedule.reaction_time();

    expect(reaction).to.be.within(200, 210);

  });
});
