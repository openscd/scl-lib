import { expect } from "vitest";

import {
  nsd72,
  nsd73,
  nsd74,
  nsd7420,
  nsd81,
} from "../foundation/codecomponents/nsds.js";
import { cdcData, lnClass74, lnClassData } from "./nsdToJson/testNsdJson.js";

import { nsdToJson, supportedCdc } from "./nsdToJson.js";

const doc72 = new DOMParser().parseFromString(nsd72, "application/xml");
const doc73 = new DOMParser().parseFromString(nsd73, "application/xml");
const doc74 = new DOMParser().parseFromString(nsd74, "application/xml");
const doc7420 = new DOMParser().parseFromString(nsd7420, "application/xml");
const doc81 = new DOMParser().parseFromString(nsd81, "application/xml");

describe("NSD to Json parsing function", () => {
  it("return undefined for invalid ln class", () =>
    expect(nsdToJson("invalid")).to.be.undefined);

  it("return undefined for unsupported CDC", () =>
    expect(nsdToJson("ENS")).to.be.undefined);

  it("returns object that compares well to static 7-4 ln classes", async () => {
    lnClass74.forEach((lnClass) => {
      const data = nsdToJson(lnClass)!;
      const sClass = lnClassData[lnClass];

      Object.keys(sClass).forEach((key) => {
        expect(data[key]).to.deep.equal(sClass[key]);
      });
    });
  }, 30000);

  it("returns object that compares well to static 7-3 ln classes", async () => {
    supportedCdc.forEach((cdc) => {
      const data = nsdToJson(cdc)!;
      const commonDataClass = cdcData[cdc];

      Object.keys(commonDataClass).forEach((key) => {
        expect(data[key]).to.deep.equal(commonDataClass[key]);
      });
    });
  }, 30000);

  it("returns object that compares well to static 7-420 classes", async () => {
    const data = nsdToJson("DSTK");
    expect(data).to.not.be.undefined;
  });

  it("allows to pass non default NSD files", async () => {
    const data = nsdToJson("MMXU", {
      81: doc81,
      74: doc74,
      7420: doc7420,
      73: doc73,
      72: doc72,
    });
    expect(data).to.not.be.undefined;
  });
});
