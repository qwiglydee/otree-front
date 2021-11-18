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

  it("works on page", async () => {
    let counter = 0;
    let passed = null;
    let wrapper;

    function handler(page, target, params, event) {
      counter ++;
      passed = {page, target, params, event};
    }

    wrapper = onPage(page, elem, {baz: "Baz"}, 'foo', handler);

    firePage(page, 'foo', {bar: "Bar"});
    detail = await pageEvent('foo');
    expect(detail).to.eql({bar: "Bar"});

    expect(counter).to.eq(1);
    expect(passed.page).to.eq(page);
    expect(passed.target).to.eq(elem);
    expect(passed.params).to.eql({baz: "Baz"});
    expect(passed.event).to.be.instanceof(CustomEvent);

    offPage(wrapper);
    firePage(page, 'foo', {bar: "Bar2"});
    detail = await pageEvent('foo');
    expect(detail).to.eql({bar: "Bar2"});

    expect(counter).to.eq(1);
  });

  it("works on elem", async () => {
    let counter = 0;
    let passed = null;
    let wrapper;

    function handler(page, target, params, event) {
      counter ++;
      passed = {page, target, params, event};
    }

    wrapper = onTarget(page, elem, {baz: "Baz"}, 'foo', handler);

    fireTarget(elem, 'foo', {bar: "Bar"});
    detail = await elemEvent('foo');
    expect(detail).to.eql({bar: "Bar"});

    expect(counter).to.eq(1);
    expect(passed.page).to.eq(page);
    expect(passed.target).to.eq(elem);
    expect(passed.params).to.eql({baz: "Baz"});
    expect(passed.event).to.be.instanceof(CustomEvent);

    offTarget(wrapper);

    fireTarget(elem, 'foo', {bar: "Bar2"});
    detail = await elemEvent('foo');
    expect(detail).to.eql({bar: "Bar2"});

    expect(counter).to.eq(1);
  });

});