import { expect, aTimeout } from "@open-wc/testing";

import * as measurement from "../../src/utils/measurement";

describe("measurements", () => {

  it("measures", async () => {
    measurement.begin("foo");
    await aTimeout(100);
    let dur = measurement.end("foo");
    expect(dur).to.be.within(100, 101); 
  });

  it("measures several times", async () => {
    measurement.begin("foo");
    await aTimeout(100);
    let dur1 = measurement.end("foo");
    expect(dur1).to.be.within(100, 101); 

    measurement.begin("foo");
    await aTimeout(200);
    let dur2 = measurement.end("foo");
    expect(dur2).to.be.within(200, 201); 
  });

  it("measures different stuff", async () => {
    measurement.begin("foo");
    await aTimeout(100);
    measurement.begin("bar");
    await aTimeout(200);
    let dur_foo = measurement.end("foo");
    await aTimeout(300);
    let dur_bar = measurement.end("bar");

    expect(dur_foo).to.be.within(300, 310); 
    expect(dur_bar).to.be.within(500, 510); 
  });
});

