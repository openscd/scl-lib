import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { matchSrcAttributes } from "./matchSrcAttributes.js";

describe("matchSrcAttributes", () => {
  const extRefStr = `<ExtRef 
        srcLDInst="ldInst" 
        srcPrefix="prefix" 
        srcLNClass="USER" 
        srcLNInst="1" 
        srcCBName="gse" 
        serviceType="GOOSE" />`;
  const extRef = findElement(extRefStr, "ExtRef")! as Element;

  const ldInstStr = `<LDevice inst="ldInst" />`;
  const ln0Str = `<LN0 lnClass="LLN0" inst="1" />`;
  const lnStr = `<LN prefix="prefix" lnClass="USER" inst="1" />`;
  const gseStr = `<GSEControl name="gse" />`;
  const smvStr = `<SampledValueControl name="smv" />`;
  const rpStr = `<ReportControl name="rp" />`;
  const LDevice = findElement(ldInstStr, "LDevice")!;
  const ln0 = findElement(ln0Str, "LN0")! as Element;
  const ln = findElement(lnStr, "LN")! as Element;
  const gse = findElement(gseStr, "GSEControl")! as Element;
  const smv = findElement(smvStr, "SampledValueControl")! as Element;
  const rp = findElement(rpStr, "ReportControl")! as Element;

  it("return false with orphan control block", () =>
    expect(matchSrcAttributes(extRef, gse)).to.equal(false));

  it("return true with matching values", () => {
    LDevice.appendChild(ln);
    ln.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to null prefix", () => {
    ln.removeAttribute("prefix");
    extRef.setAttribute("srcPrefix", "");

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to empty string prefix", () => {
    extRef.removeAttribute("srcPrefix");
    ln.setAttribute("prefix", "");

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("allows LN0 as parent", () => {
    extRef.removeAttribute("srcPrefix");
    extRef.setAttribute("srcLNClass", "LLN0");

    LDevice.appendChild(ln0);
    ln0.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("allows LN0 as parent when srcLNClass is undefined", () => {
    extRef.removeAttribute("srcPrefix");
    extRef.removeAttribute("srcLNClass");

    LDevice.appendChild(ln0);
    ln0.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to empty string srcLNClass", () => {
    extRef.setAttribute("srcLNClass", "");

    LDevice.appendChild(ln0);
    ln0.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("it uses ldInst when srcLDInst is undefined", () => {
    extRef.removeAttribute("srcLDInst");
    extRef.setAttribute("ldInst", "ldInst");

    LDevice.appendChild(ln0);
    ln0.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to empty string srcLDInst", () => {
    extRef.setAttribute("srcLDInst", "");
    extRef.setAttribute("ldInst", "ldInst");

    LDevice.appendChild(ln0);
    ln0.appendChild(gse);

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to null inst", () => {
    ln0.setAttribute("inst", "");
    extRef.setAttribute("srcLNInst", "");

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("is insensitive to empty string inst", () => {
    extRef.removeAttribute("srcLNInst");
    ln0.setAttribute("inst", "");

    expect(matchSrcAttributes(extRef, gse)).to.equal(true);
  });

  it("checks cbName and serviceType", () => {
    extRef.setAttribute("srcCBName", "rp");
    extRef.setAttribute("serviceType", "Report");

    ln0.appendChild(rp);

    expect(matchSrcAttributes(extRef, rp)).to.equal(true);
  });

  it("checks cbName and serviceType with SampledValueControl", () => {
    extRef.setAttribute("srcCBName", "smv");
    extRef.setAttribute("serviceType", "SMV");

    ln0.appendChild(smv);

    expect(matchSrcAttributes(extRef, smv)).to.equal(true);
  });
});
