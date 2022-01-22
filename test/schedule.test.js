import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Schedule } from "../src/schedule";

describe("schedule", () => {
  let body, page, schedule, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    page = new Page(body);
    schedule = new Schedule(page);
    await pageEvent("ot.phase"); // page resetting phase
  });

  it("runs phases", async () => {
    schedule.setup({
      phases: [
        { at: 0, foo: "foo0" },
        { at: 100, foo: "foo1" },
        { at: 200, foo: "foo2" },
      ],
    });

    const t0 = Date.now();
    schedule.start();

    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ foo: "foo0" });
    expect(Date.now() - t0).to.be.within(0, 10);

    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ foo: "foo1" });
    expect(Date.now() - t0).to.be.within(100, 110);

    detail = await pageEvent("ot.phase");
    expect(detail).to.eql({ foo: "foo2" });
    expect(Date.now() - t0).to.be.within(200, 210);
  });

  it("timeouts", async () => {
    schedule.setup({ timeout: 100 });

    const t0 = Date.now();
    schedule.start();

    detail = await pageEvent("ot.timeout");
    expect(detail).to.eq(100);
    expect(Date.now() - t0).to.be.within(100, 110);
  });

  it("cancels timers after timeout", async () => {
    let counter = 0;

    page.onEvent("ot.phase", () => counter++);

    schedule.setup({
      timeout: 250,
      phases: [
        { at: 100, foo: "foo1" },
        { at: 200, foo: "foo2" },
        { at: 300, foo: "foo3" },
        { at: 400, foo: "foo4" },
      ],
    });

    schedule.start();

    await aTimeout(1000);
    expect(counter).to.eq(2);
  });


  it("cancels timers when stopped", async () => {
    let counter = 0;

    page.onEvent("ot.phase", () => counter++);

    schedule.setup({
      phases: [
        { at: 100, foo: "foo1" },
        { at: 200, foo: "foo2" },
        { at: 300, foo: "foo3" },
        { at: 400, foo: "foo4" },
      ],
    });

    schedule.start();

    await aTimeout(250);
    schedule.stop();

    await aTimeout(1000);
    expect(counter).to.eq(2);
  });
});
