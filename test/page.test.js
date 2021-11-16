import { expect, fixture, oneEvent } from "@open-wc/testing";

import { Page } from "../src/page";
import { Changes } from "../src/utils/changes";

describe("Page controller", () => {
  let body, elem, page, detail;

  describe("fires events", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div></div>`, { parentNode: body });
      page = new Page(body);
    });

    it("arbitrary", async () => {
      page.fire("foo", { bar: "Bar" });
      detail = (await oneEvent(body, "ot.foo")).detail;
      expect(detail).to.deep.equal({ page, bar: "Bar" });
    });

    it("reset", async () => {
      page.reset();
      detail = (await oneEvent(body, "ot.reset")).detail;
      expect(detail).to.deep.equal({ page: page });
      expect(page.phase).to.eql({display: null, input: null});
    });

    it("update", async () => {
      page.update({ foo: "Foo" });
      detail = (await oneEvent(body, "ot.update")).detail;
      expect(detail.page).to.eq(page);
      expect(detail.changes).to.eql({ "foo": "Foo" });
    });

    it("response", async () => {
      page.toggleInput(true);
      page.response({ foo: "Foo" });
      detail = (await oneEvent(body, "ot.response")).detail;
      expect(detail.page).to.eq(page);
      expect(detail.changes).to.eql({ "foo": "Foo" });
    });

    it("error", async () => {
      page.error("foo");
      detail = (await oneEvent(body, "ot.error")).detail;
      expect(detail).to.deep.equal({ page, error: "foo" });
      detail = (await oneEvent(body, "ot.update")).detail;
      expect(detail).to.deep.equal({ page, changes: { error: "foo" } });
    });

    it("toggle display", async () => {
      page.toggleDisplay("foo");
      detail = (await oneEvent(body, "ot.display")).detail;
      expect(detail).to.deep.equal({ page, phase: "foo" });
      expect(page.phase.display).to.eq('foo');
    });

    it("toggle input", async () => {
      page.toggleInput("foo");
      detail = (await oneEvent(body, "ot.input")).detail;
      expect(detail).to.deep.equal({ page, phase: "foo" });
      expect(page.phase.input).to.eq('foo');
    });

    it("timeout", async () => {
      page.timeout("foo");
      detail = (await oneEvent(body, "ot.timeout")).detail;
      expect(detail).to.deep.equal({ page: page });
    });
  });

  // describe("timing", () => {
  //   beforeEach(async () => {
  //     body = document.createElement("body");
  //     elem = await fixture(`<div></div>`, { parentNode: body });
  //   });

  //   it("runs", async () => {
  //     page = new Page(body);
  //     page.run();
  //     detail = (await oneEvent(body, "ot.run")).detail;
  //     expect(detail).to.deep.equal({ page: page });
  //   });

  //   it("runs normal sequence", async () => {
  //     page = new Page(body, [
  //       { time: 0, display: "foo" } ,
  //       { time: 100, display: null },
  //       { time: 200, input: true },
  //       { time: 300, input: false },
  //       { time: 400, timeout: 500},
  //     ]);

  //     page.run();
  //     await oneEvent(body, "ot.run");
  //     const t0 = Date.now();

  //     detail = (await oneEvent(body, "ot.display")).detail;
  //     expect(Date.now() - t0).to.be.within(0, 10);
  //     expect(detail).to.deep.equal({ page, phase: "foo" });

  //     detail = (await oneEvent(body, "ot.display")).detail;
  //     expect(Date.now() - t0).to.be.within(99, 110);
  //     expect(detail).to.deep.equal({ page, phase: null });

  //     detail = (await oneEvent(body, "ot.input")).detail;
  //     expect(Date.now() - t0).to.be.within(199, 210);
  //     expect(detail).to.deep.equal({ page, phase: true });

  //     detail = (await oneEvent(body, "ot.input")).detail;
  //     expect(Date.now() - t0).to.be.within(299, 310);
  //     expect(detail).to.deep.equal({ page, phase: false });

  //     detail = (await oneEvent(body, "ot.timeout")).detail;
  //     expect(Date.now() - t0).to.be.within(899, 910);
  //     expect(detail).to.deep.equal({ page: page });
  //   });

  //   it("runs combo sequence", async () => {
  //     page = new Page(body, [
  //       { time: 0, display: "foo", input: true, timeout: 200},
  //       { time: 100, display: null, input: false },
  //     ]);

  //     page.run();
  //     await oneEvent(body, "ot.run");
  //     const t0 = Date.now();

  //     detail = (await oneEvent(body, "ot.display")).detail;
  //     expect(Date.now() - t0).to.be.within(0, 10);
  //     expect(detail).to.deep.equal({ page, phase: "foo" });

  //     detail = (await oneEvent(body, "ot.input")).detail;
  //     expect(Date.now() - t0).to.be.within(0, 10);
  //     expect(detail).to.deep.equal({ page, phase: true });

  //     detail = (await oneEvent(body, "ot.display")).detail;
  //     expect(Date.now() - t0).to.be.within(100, 110);
  //     expect(detail).to.deep.equal({ page, phase: null });

  //     detail = (await oneEvent(body, "ot.input")).detail;
  //     expect(Date.now() - t0).to.be.within(100, 110);
  //     expect(detail).to.deep.equal({ page, phase: false });

  //     detail = (await oneEvent(body, "ot.timeout")).detail;
  //     expect(Date.now() - t0).to.be.within(200, 210);
  //     expect(detail).to.deep.equal({ page: page });
  //   });

  //   it("runs just timeout", async () => {
  //     page = new Page(body, [
  //       { timeout: 500 },
  //     ]);

  //     page.run();
  //     await oneEvent(body, "ot.run");
  //     const t0 = Date.now();

  //     detail = (await oneEvent(body, "ot.timeout")).detail;
  //     expect(Date.now() - t0).to.be.within(500, 510);
  //     expect(detail).to.deep.equal({ page: page });
  //   });

  // });
});
