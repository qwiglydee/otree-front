import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Schedule } from "../src/schedule";

describe("schedule", () => {
  let body, page, schedule, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
    schedule = new Schedule(page);
  });

  describe("running", () => {
    it("runs phases", async () => {
      const t0 = Date.now();

      schedule.run([
        { time: 0, foo: "foo0" },
        { time: 100, foo: "foo1" },
        { time: 200, foo: "foo2" },
      ]);

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 0, foo: "foo0" });
      expect(Date.now() - t0).to.be.within(0, 10);

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 100, foo: "foo1" });
      expect(Date.now() - t0).to.be.within(100, 110);

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 200, foo: "foo2" });
      expect(Date.now() - t0).to.be.within(200, 210);
    });

    it("timeouts", async () => {
      const t0 = Date.now();

      schedule.run([
        { time: 100, foo: "foo1", timeout: 500 },
        { time: 200, foo: "foo2" },
      ]);

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 100, foo: "foo1", timeout: 500 });

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 200, foo: "foo2" });

      detail = await pageEvent("otree.time.out");
      expect(detail).to.be.null;
      expect(Date.now() - t0).to.be.within(600, 610);
    });

    it("cancels timers after timeout", async () => {
      let counter = 0;

      page.on("otree.time.phase", () => counter++);

      schedule.run([
        { time: 100, foo: "foo1", timeout: 500 },
        { time: 500, foo: "foo5" },
        { time: 600, foo: "foo6" },
      ]);

      detail = await pageEvent("otree.time.out");
      expect(counter).to.eq(2);

      await aTimeout(1000);
      expect(counter).to.eq(2);
    });
  });
});
