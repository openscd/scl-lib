import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { matchDataAttributes } from "./matchDataAttributes.js";

const extRefStr1 = `<ExtRef 
        iedName="IED1"
        ldInst="ldInst"
        prefix="prefix"
        lnClass="PTOC"
        lnInst="lnInst"
        doName="do.sdo"
        daName="da.bda" />`;
const extRef1 = findElement(extRefStr1, "ExtRef") as Element;

const extRefStr2 = `<ExtRef 
        iedName="IED1"
        ldInst="ldInst"
        prefix=""
        lnClass="LLN0"
        lnInst=""
        doName="do.sdo"
        daName="da.bda" />`;
const extRef2 = findElement(extRefStr2, "ExtRef") as Element;

const extRefStr3 = `<ExtRef 
        iedName="IED1"
        ldInst="ldInst"
        lnClass="LLN0"
        doName="do.sdo" />`;
const extRef3 = findElement(extRefStr3, "ExtRef") as Element;

const fcdaStr1 = `<FCDA 
        ldInst="ldInst"
        prefix="prefix"
        lnClass="PTOC"
        lnInst="lnInst"
        doName="do.sdo"
        daName="da.bda" 
        fc="ST" />`;
const fcda1 = findElement(fcdaStr1, "FCDA") as Element;

const fcdaStr2 = `<FCDA 
        ldInst="ldInst"
        lnClass="LLN0"
        doName="do.sdo"
        daName="da.bda" 
        fc="ST" />`;
const fcda2 = findElement(fcdaStr2, "FCDA") as Element;

const fcdaStr3 = `<FCDA 
        ldInst="ldInst"
        prefix=""
        lnClass="LLN0"
        doName="do.sdo"
        fc="ST" />`;
const fcda3 = findElement(fcdaStr3, "FCDA") as Element;

describe("Utility function to match FCDA's attributes to ExtRef's data attributes", () => {
  it("return true for equal LLN0 data attribute", () =>
    expect(matchDataAttributes(extRef1, fcda1)).to.be.true);

  it("return true for equal PTOC data attribute", () =>
    expect(matchDataAttributes(extRef2, fcda2)).to.be.true);

  it("return true for FCD type data", () =>
    expect(matchDataAttributes(extRef3, fcda3)).to.be.true);

  it("return false with different data attribute", () =>
    expect(matchDataAttributes(extRef1, fcda2)).to.be.false);

  it("return false with FCD to FCDA difference", () =>
    expect(matchDataAttributes(extRef2, fcda3)).to.be.false);
});
