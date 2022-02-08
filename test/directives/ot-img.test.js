import { expect, oneEvent, fixture, aTimeout, nextFrame, elementUpdated } from "@open-wc/testing";

import { setChild } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-img";

describe("ot-img", () => {
  let body, elem, img, page;
  const foo_img = new Image(),
    bar_img = new Image();

  const mock_img_uri =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=";

  const mock_img = new Image();
  mock_img.src = mock_img_uri;

  async function pageEvent(type) {
    return (await oneEvent(body, type)).detail;
  }

  describe("updating", () => {
    beforeEach(async () => {
      body = document.createElement("body");
      elem = await fixture(`<div><img width="100" class="foo" ot-img="var"></div>`, { parentNode: body });
      page = new Page(body);
      await pageEvent("ot.reset"); // initial
      mock_img.src = mock_img_uri;
      await nextFrame();
    });

    it("resets", async () => {
      img = elem.children[0];
      img.src = mock_img_uri;
      await nextFrame();

      expect(img.src).not.to.be.empty;

      page.reset();
      await nextFrame();

      img = elem.children[0];
      expect(img.src).to.be.empty;

      expect(img).to.have.attribute("width", "100");
      expect(img).to.have.class("foo");
    });

    it("replaces", async () => {
      page.reset();
      await nextFrame();

      expect(elem.children[0].src).to.be.empty;

      page.update({ var: mock_img });
      await nextFrame();

      let img = elem.children[0];
      expect(img.src).to.eq(mock_img_uri);

      expect(img).to.have.attribute("width", "100");
      expect(img).to.have.class("foo");
    });
  });
});
