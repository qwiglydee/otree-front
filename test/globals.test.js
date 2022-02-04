import { expect, oneEvent } from "@open-wc/testing";

import "../src";
 
import { Page } from "../src/page";
import { Game } from "../src/game";
import { Schedule } from "../src/schedule";

describe("onload", async () => {

  before(async () => {
    window.main = function() {};
    window.dispatchEvent(new Event('load'));
  });
  
  it("globals", () => {
    // expect(window.xxx).not.to.be.undefined;
    expect(window.otree.page).to.be.instanceof(Page);
    expect(window.otree.page.body).to.eq(document.body);
    expect(window.otree.game).to.be.instanceof(Game);
    expect(window.otree.game.page).to.eq(window.otree.page);
    expect(window.otree.schedule).to.be.instanceof(Schedule);
  });

  it("utils", () => {
    expect(window.otree).to.have.property('utils');
    expect(window.otree.utils).to.have.property('dom');
    expect(window.otree.utils).to.have.property('random');
    expect(window.otree.utils).to.have.property('timers');
    expect(window.otree.utils).to.have.property('measurement');
    expect(window.otree.utils).to.have.property('changes');
    expect(window.otree.utils).to.have.property('trials');
  });

  it("directives", () => {
    expect(window.otree).to.have.property('directives');
    expect(window.otree.directives).to.have.property('DirectiveBase');
    expect(window.otree.directives).to.have.property('registerDirective');
  });
});