import { expect, oneEvent, fixture, aTimeout, nextFrame, elementUpdated } from "@open-wc/testing";

import { setChild } from "../../src/utils/dom";
import { Page } from "../../src/page";

import "../../src/directives/ot-img";

describe("ot-img", () => {
  let body, elem, page, img, mock_img;
  const mock_img_uri =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=";

  describe("errors", () => {
    beforeEach(async () => {
      body = document.createElement("body");
    });

    it("on empty", async () => {
      await fixture(`<img ot-img="">`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on bogus expr", async () => {
      await fixture(`<img ot-img="13">`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "invalid expression");
    });

    it("on wrong inp expr", async () => {
      await fixture(`<img ot-img="foo = true">`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });

    it("on wrong cmp expr", async () => {
      await fixture(`<img ot-img="foo == true">`, { parentNode: body });
      expect(() => new Page(elem)).to.throw(Error, "expected var reference");
    });
  });

  describe("mutating", () => {
    beforeEach(async () => {
      mock_img = new Image();
      mock_img.src = mock_img_uri;
      await nextFrame();
      body = document.createElement("body");
      elem = await fixture(`<div><img width="100" class="foo" ot-img="var"></div>`, { parentNode: body });
      page = new Page(body);
      await oneEvent(body, "ot.reset");
    });

    it("by updaing var", async () => {
      page.update({ var: mock_img });
      await nextFrame();
      img = elem.children[0];
      expect(img).to.have.property("src", mock_img_uri);
      expect(img).to.have.class("foo");
      expect(img).to.have.attribute("width", "100");
    });

    it("not by updating another var", async () => {
      page.update({ anothervar: mock_img });
      await nextFrame();
      img = elem.children[0];
      expect(img).to.have.property("src", "");
      expect(img).to.have.class("foo");
      expect(img).to.have.attribute("width", "100");
    });

    it("by resetting globally", async () => {
      page.update({ var: mock_img });
      await nextFrame();
      page.reset();
      await nextFrame();
      img = elem.children[0];
      expect(img).to.have.property("src", "");
      expect(img).to.have.class("foo");
      expect(img).to.have.attribute("width", "100");
    });

    it("by resetting var", async () => {
      page.update({ var: mock_img });
      await nextFrame();
      page.reset(["var"]);
      await nextFrame();
      img = elem.children[0];
      expect(img).to.have.property("src", "");
      expect(img).to.have.class("foo");
      expect(img).to.have.attribute("width", "100");
    });

    it("not by resetting another var", async () => {
      page.update({ var: mock_img });
      await nextFrame();
      page.reset(["anothervar"]);
      await nextFrame();
      img = elem.children[0];
      expect(img).to.have.property("src", mock_img_uri);
      expect(img).to.have.class("foo");
      expect(img).to.have.attribute("width", "100");
    });
  });
});
