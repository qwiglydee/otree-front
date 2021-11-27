import { expect, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../../src/page";
import { Schedule } from "../../src/schedule";

describe("schedule", () => {
  let body, page, schedule, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(() => {
    body = document.createElement("body");
    page = new Page(body);
  });

  describe("validation", () => {

    it("disallows duplicate default", () => {
      expect(() => new Schedule(page, [{ foo: "foo1" }, { foo: "foo2" }])).to.throw;
    });

    it("disallows duplicate input phases", () => {
      expect(
        () =>
          new Schedule(page, [
            { time: 0, input: true },
            { time: 100, input: false },
            { time: 200, input: true },
          ])
      ).to.throw;
    });

    it("disallows duplicate timeouts", () => {
      expect(
        () =>
          new Schedule(page, [
            { time: 100, foo: "foo1", timeout: 1000 },
            { time: 200, foo: "foo2", timeout: 1000 },
          ])
      ).to.throw;
    });

    it("disallows duplicate names", () => {
      expect(
        () =>
          new Schedule(page, [
            { name: "foo", foo: "foo1" },
            { name: "foo", foo: "foo2" },
          ])
      ).to.throw;
    });
  });

  describe("running", () => {
    it("resets", async () => {
      schedule = new Schedule(page, [{ foo: "foo0" }, { time: 100, foo: "foo1" }]);

      schedule.run();

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ foo: "foo0" });

      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ time: 100, foo: "foo1" });

      schedule.reset();
      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ foo: "foo0" });
    });

    it("runs phases", async () => {
      schedule = new Schedule(page, [
        { time: 0, foo: "foo0" },
        { time: 100, foo: "foo1" },
        { time: 200, foo: "foo2" },
      ]);

      const t0 = Date.now();
      schedule.run();

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
      schedule = new Schedule(page, [
        { time: 100, foo: "foo1", timeout: 500 },
        { time: 200, foo: "foo2" },
      ]);

      const t0 = Date.now();
      schedule.run();

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

      schedule = new Schedule(page, [
        { time: 100, foo: "foo1", timeout: 500 },
        { time: 500, foo: "foo5" },
        { time: 600, foo: "foo6" },
      ]);

      schedule.run();

      detail = await pageEvent("otree.time.out");
      expect(counter).to.eq(2);

      await aTimeout(1000);
      expect(counter).to.eq(2);
    });

    it("triggers named phases", async () => {
      schedule = new Schedule(page, [
        { name: "foo1", foo: "foo1" },
        { name: "foo2", foo: "foo2" },
      ]);

      schedule.switch("foo1");
      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ name: "foo1", foo: "foo1" });

      schedule.switch("foo2");
      detail = await pageEvent("otree.time.phase");
      expect(detail).to.eql({ name: "foo2", foo: "foo2" });
    });

    it("measures reaction", async () => {
      schedule = new Schedule(page, [{ input: true }]);

      schedule.run();

      await aTimeout(100);
      page.fire("otree.page.response");

      await pageEvent("otree.page.response");

      let reaction = schedule.reaction_time();

      expect(reaction).to.be.within(100, 110);
    });

    it("measures multiresponse reaction", async () => {
      schedule = new Schedule(page, [{ input: true }]);

      schedule.run();

      await aTimeout(100);
      page.fire("otree.page.response");
      await pageEvent("otree.page.response");

      await aTimeout(200);
      page.fire("otree.page.response");
      await pageEvent("otree.page.response");

      let reaction = schedule.reaction_time();

      expect(reaction).to.be.within(300, 310);
    });
  });
});
