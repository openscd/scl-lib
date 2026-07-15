import { expect } from "vitest";

import { controlBlockGseOrSmv } from "./controlBlockGseOrSmv.js";
import { controlBlockGseOrSmvDoc } from "./controlBlockGseOrSmv.testfiles.js";
import { findElement } from "../foundation/helpers.test.js";

const testDoc = findElement(controlBlockGseOrSmvDoc) as XMLDocument;

describe("Function to return a communication address for a control block", () => {
  it("returns a GSE for a GSEControl with the correct AP", () => {
    const gseControl = testDoc.querySelector(
      'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
    )!;
    const gseComm = testDoc.querySelector(
      'ConnectedAP[iedName="GOOSE_Publisher"] GSE[cbName="GOOSE2"]',
    )!;

    expect(gseControl).to.not.be.null;
    expect(gseComm).to.not.be.null;
    expect(controlBlockGseOrSmv(gseControl)).to.equal(gseComm);
  });

  it("returns a GSE for a GSEControl with the correct AP with no ServerAts defined", () => {
    const gseControl = testDoc.querySelector(
      'IED[name="GOOSE_Publisher2"] GSEControl[name="GOOSE2"]',
    )!;
    const gseComm = testDoc.querySelector(
      'ConnectedAP[iedName="GOOSE_Publisher2"] GSE[cbName="GOOSE2"]',
    )!;

    expect(gseControl).to.not.be.null;
    expect(gseComm).to.not.be.null;
    expect(controlBlockGseOrSmv(gseControl)).to.equal(gseComm);
  });

  it("returns null if a GSEControl has no GSE", () => {
    const gseControl = testDoc.querySelector(
      'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE3"]',
    )!;

    expect(gseControl).to.not.be.null;
    expect(controlBlockGseOrSmv(gseControl)).to.equal(null);
  });

  it("returns a GSE for a GSEControl referenced with ServerAt", () => {
    const gseControl = testDoc.querySelector(
      'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE1"]',
    )!;
    const gseComm = testDoc.querySelector(
      'ConnectedAP[apName="PP1"][iedName="GOOSE_Publisher"] > GSE[cbName="GOOSE1"]',
    )!;

    expect(gseControl).to.not.be.null;
    expect(gseComm).to.not.be.null;
    expect(controlBlockGseOrSmv(gseControl)).to.equal(gseComm);
  });

  it("returns null for an orphan GSEControl", () => {
    const orphanGse = `<GSEControl name="GOOSE3" type="GOOSE" appID="GOOSE3" confRev="1" datSet="GOOSE1sDataSet"/>`;
    const gse = <Element>findElement(orphanGse, "GSEControl");

    expect(gse).to.not.be.null;
    expect(controlBlockGseOrSmv(gse)).to.be.null;
  });

  it("returns an SMV for a SampledValueControl with the correct AP", () => {
    const smvControl = testDoc.querySelector(
      'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
    )!;
    const smvComm = testDoc.querySelector(
      'ConnectedAP[apName="AP1"][iedName="SMV_Publisher"] SMV[cbName="fullSmv"]',
    )!;

    expect(smvControl).to.not.be.null;
    expect(smvComm).to.not.be.null;
    expect(controlBlockGseOrSmv(smvControl)).to.equal(smvComm);
  });

  it("returns null if a SampledValueControl has no SMV", () => {
    const smvControl = testDoc.querySelector(
      'IED[name="SMV_Publisher"] SampledValueControl[name="currrentOnly"]',
    )!;

    expect(smvControl).to.not.be.null;
    expect(controlBlockGseOrSmv(smvControl)).to.equal(null);
  });

  it("returns a SMV for a SampledValueControl referenced with ServerAt", () => {
    const smvControl = testDoc.querySelector(
      'IED[name="SMV_Publisher"] SampledValueControl[name="currrentOnlyDifferentAp"]',
    )!;
    const smvComm = testDoc.querySelector(
      'ConnectedAP[apName="PP1"][iedName="SMV_Publisher"] > SMV[cbName="currrentOnlyDifferentAp"]',
    )!;

    expect(smvControl).to.not.be.null;
    expect(smvComm).to.not.be.null;
    expect(controlBlockGseOrSmv(smvControl)).to.equal(smvComm);
  });

  it("returns null for an orphan SampledValueControl", () => {
    const orphanSmv = `<SampledValueControl name="fullSmv" multicast="true" smvID="smv3" smpMod="SmpPerPeriod" smpRate="80" nofASDU="1" confRev="1" datSet="fullSmvsDataSet">
  <SmvOpts sampleRate="true" dataSet="true" synchSourceId="true"/>
</SampledValueControl>`;
    const smv = <Element>findElement(orphanSmv, "SampledValueControl");

    expect(smv).to.not.be.null;
    expect(controlBlockGseOrSmv(smv)).to.be.null;
  });
});
