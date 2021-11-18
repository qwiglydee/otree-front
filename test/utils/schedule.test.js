import { expect, oneEvent, aTimeout } from "@open-wc/testing";

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
    schedule = new Schedule([
      { time: 0, foo: "foo0" },
      { time: 100, foo: "foo1" },
      { time: 200, foo: "foo2" },
    ]);

    const t0 = Date.now();
    schedule.run(page);

    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ time: 0, foo: "foo0" });
    expect(Date.now() - t0).to.be.within(0, 10);

    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ time: 100, foo: "foo1" });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ time: 200, foo: "foo2" });
    expect(Date.now() - t0).to.be.within(200, 210);
  });

  it("fails to take 2 timeouts", async () => {
    expect(
      () =>
        new Schedule([
          { time: 100, foo: "foo1", timeout: 200 },
          { time: 200, foo: "foo1", timeout: 200 },
        ])
    ).to.throw;
  });

  it("timeouts", async () => {
    schedule = new Schedule([{ time: 100, foo: "foo1", timeout: 200 }]);

    const t0 = Date.now();
    schedule.run(page);

    detail = await pageEvent("otree.phase");
    expect(detail).to.eql({ time: 100, foo: "foo1", timeout: 200 });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.timeout");
    expect(detail).to.be.null;
    expect(Date.now() - t0).to.be.within(300, 310);
  });

  it("cancels timers after timeout", async () => {
    let counter = 0;

    page.body.addEventListener("otree.phase", (e) => {
      counter++;
    });

    schedule = new Schedule([
      { time: 100, foo: "foo1", timeout: 200 },
      { time: 500, foo: "foo5" },
    ]);

    const t0 = Date.now();
    schedule.run(page);

    detail = await pageEvent("otree.phase");
    expect(counter).to.eq(1);
    expect(detail).to.eql({ time: 100, foo: "foo1", timeout: 200 });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("otree.timeout");
    expect(detail).to.be.null;
    expect(Date.now() - t0).to.be.within(300, 310);

    await aTimeout(1000);
    expect(counter).to.eq(1);
  });
});
