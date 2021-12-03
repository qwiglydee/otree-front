import { expect } from "@open-wc/testing";

import "../src";
 
import { Page } from "../src/page";
import { Game } from "../src/game";

describe("globals", () => {
  it("has page and game");

  // it("has page and game", async () => {
  //   expect(window.page).to.be.instanceof(Page);
  //   expect(window.page.body).to.eq(documeny.body);
  //   expect(window.game).to.be.instanceof(Game);
  //   expect(window.game.page).to.eq(window.page);
  // });
});