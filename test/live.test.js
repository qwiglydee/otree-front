import { expect, fixture, oneEvent, aTimeout, nextFrame } from "@open-wc/testing";

import { Page } from "../src/page";
import { Live } from "../src/live";


describe("Live", () => {
  let body, page, live, detail;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  beforeEach(async () => {
    body = document.createElement("body");
    page = new Page(body);
    live = new Live(page);
  });

  it("sends", async () => {
    let called;
    
    window.liveSend = function() {
      called = arguments;
    }

    live.send('foo', {bar: "Bar"});
    detail = await pageEvent('otree.live.foo');
    expect(detail).to.eql({ bar: "Bar" });
    
    expect(called).not.to.be.undefined;
    expect(called[0]).to.eql({ type: "foo", bar: "Bar" });

  });

  it("receives", async () => {
    window.liveRecv({ type: "foo", bar: "Bar"});
    detail = await pageEvent('otree.live.foo');
    expect(detail).to.eql({ bar: "Bar" });
  });
});
