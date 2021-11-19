import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../../src/page";
import { onPage, onTarget, offPage, offTarget, firePage, fireTarget } from "../../src/utils/events";

describe("events", () => {
  let body, page, elem, detail;

  beforeEach(async () => {
    body = document.createElement("body");
    elem = await fixture(`<div></div>`, { parentNode: body });
    page = new Page(body);
  });

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  async function elemEvent(type) {
    return (await oneEvent(elem, type)).detail;
  }

  describe("on page", () => {
    it("requires `page` in conf", async () => {
      expect(() => onPage({}, "foo", () => {})).to.throw;
    });

    it("works", async () => {
      let counter = 0;
      let passed = null;
      let wrapper;

      function handler(conf, event) {
        counter++;
        passed = { conf, event };
      }

      wrapper = onPage({ page, baz: "Baz" }, "foo", handler);

      firePage(page, "foo", { bar: "Bar" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });

      expect(counter).to.eq(1);
      expect(passed.conf).to.eql({ page, baz: "Baz" });
      expect(passed.event).to.be.instanceof(CustomEvent);

      offPage(wrapper);
      firePage(page, "foo", { bar: "Bar2" });
      detail = await pageEvent("foo");
      expect(detail).to.eql({ bar: "Bar2" });

      expect(counter).to.eq(1);
    });
  });

  describe("on elem", () => {
    const target = elem;

    it("requires `target` in conf", async () => {
      expect(() => onPage({}, "foo", () => {})).to.throw;
    });

    it("works", async () => {
      let counter = 0;
      let passed = null;
      let wrapper;

      function handler(conf, event) {
        counter++;
        passed = { conf, event };
      }

      wrapper = onTarget({ page, target: elem, baz: "Baz" }, "foo", handler);

      fireTarget(elem, "foo", { bar: "Bar" });
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar" });

      expect(counter).to.eq(1);
      expect(passed.conf).to.eql({ page, target: elem, baz: "Baz" });
      expect(passed.event).to.be.instanceof(CustomEvent);

      offTarget(wrapper);

      fireTarget(elem, "foo", { bar: "Bar2" });
      detail = await elemEvent("foo");
      expect(detail).to.eql({ bar: "Bar2" });

      expect(counter).to.eq(1);
    });
  });
});
