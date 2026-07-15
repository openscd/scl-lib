import { expect } from "vitest";

import { findElement } from "../foundation/helpers.test.js";
import { publisherIED } from "./fcdaBaseTypes.testfiles.js";

import { fcdaBaseTypes } from "./fcdaBaseTypes.js";

const orphanFCDA = `<FCDA iedName="someIED" ldInst="someLdInst" lnClass="PTOC" lnInst="1" doName="Op" daName="general" fc="ST"/>`;

describe("Function to determine FCDAs cdc and base type", () => {
  it("returns undefined with orphan FCDA", () =>
    expect(fcdaBaseTypes(findElement(orphanFCDA, "FCDA")!)).to.be.undefined);

  it("returns undefined with missing ldInst", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="invalidFCDA1"]`)!),
    ).to.be.undefined);

  it("returns undefined with missing lnClass", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="invalidFCDA2"]`)!),
    ).to.be.undefined);

  it("returns undefined with missing anyLn", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="missingAnyLN"]`)!),
    ).to.be.undefined);

  it("returns undefined with invalid doName", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="invalidDoName"]`)!),
    ).to.be.undefined);

  it("returns undefined with invalid daName", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="invalidDaName"]`)!),
    ).to.be.undefined);

  it("returns valid SPS and Boolean", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="SPSBool"]`)!),
    ).to.deep.equal({ cdc: "SPS", bType: "BOOLEAN" }));

  it("returns valid DPC and Quality", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="DPCq"]`)!),
    ).to.deep.equal({ cdc: "DPC", bType: "Quality" }));

  it("returns valid DPC for FCD type FCDA", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="DPCnull"]`)!),
    ).to.deep.equal({ cdc: "DPC" }));

  it("returns valid LPL and VisibleString255", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="LPLVis"]`)!),
    ).to.deep.equal({ cdc: "LPL", bType: "VisString255" }));

  it("returns valid CMV and FLOAT32", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="CMVFLOAT32"]`)!),
    ).to.deep.equal({ cdc: "CMV", bType: "FLOAT32" }));

  it("returns valid WYE for FCD type FCDA", () =>
    expect(
      fcdaBaseTypes(findElement(publisherIED, `FCDA[desc="WYE"]`)!),
    ).to.deep.equal({ cdc: "WYE" }));
});
