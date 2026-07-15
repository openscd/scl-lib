import { expect } from "vitest";

import { sourceControlBlock } from "./sourceControlBlock.js";
import { sourceControlBlockDoc } from "./sourceControlBlock.testfiles.js";
import { findElement } from "../foundation/helpers.test.js";

const testDoc = findElement(sourceControlBlockDoc) as XMLDocument;

describe("Function to return a control block from an ExtRef", function () {
  describe("for GOOSE", () => {
    it("returns a GSEControl from an ExtRef with serviceType GOOSE", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="hasServiceType1"]',
      )!;
      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("it returns a GSEControl from an ExtRef with no ServiceType", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="noServiceType1"]',
      )!;
      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl from an ExtRef with only pServT GOOSE", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="hasServiceType2"]',
      )!;
      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl from an ExtRef using ldInst if srcLDInst is not declared", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="usingLDInst"]',
      )!;
      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl for a GOOSE ExtRef when the GSEControl LN has no prefix", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher2"][srcCBName="GOOSE2"][intAddr="gseCtrlHasNoPrefix"]',
      )!;

      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher2"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl from an ExtRef if srcLNClass not declared", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="hasNolnClass"]',
      )!;

      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl from an ExtRef if srcLNInst is present on the ExtRef", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="hasSrcLNInst"]',
      )!;

      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns a GSEControl from an ExtRef if srcPrefix is missing on the ExtRef", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="hasNoSrcPrefix"]',
      )!;

      const gseCtrl = testDoc.querySelector(
        'IED[name="GOOSE_Publisher"] GSEControl[name="GOOSE2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(gseCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(gseCtrl);
    });

    it("returns null for a GOOSE ExtRef if iedName is missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[srcCBName="GOOSE2"][intAddr="missingIEDName"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a GOOSE ExtRef if srcLDInst and ldInst are missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[srcCBName="GOOSE2"][intAddr="missingLDInst"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a GOOSE ExtRef if srcCBName is missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[intAddr="noSrcCBName"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a GOOSE ExtRef if a srcCBName is incorrect", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2DoesNotExist"]',
      )!;

      expect(sourceControlBlock(extRef)).to.be.null;
    });
  });

  describe("for SMV", () => {
    it("returns a SampledValueControl from an ExtRef with serviceType SMV", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="SMVhasServiceType1"]',
      )!;
      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("it returns a SampledValueControl from an ExtRef with no ServiceType", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="SMVhasNoServiceType1"]',
      )!;
      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("returns a SampledValueControl from an ExtRef with pServT SMV", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="SMVhasServiceType2"]',
      )!;
      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("returns a SampledValueControl from an ExtRef using ldInst if srcLDInst is not declared", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="SMVhasNoSrcLDInst"]',
      )!;
      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("returns a SampledValueControl from an ExtRef if lnClass not declared", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="SMVhasNoLnClass"]',
      )!;
      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("returns a SampledValueControl from an ExtRef if srcPrefix is missing on the ExtRef", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][srcCBName="fullSmv"][intAddr="SMVhasNoSrcPrefix"]',
      )!;

      const smvCtrl = testDoc.querySelector(
        'IED[name="SMV_Publisher"] SampledValueControl[name="fullSmv"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(smvCtrl).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.equal(smvCtrl);
    });

    it("returns null for a SMV ExtRef if iedName is missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[intAddr="SMVhasNoIedName"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a SMV ExtRef if srcLDInst and ldInst are missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[intAddr="SMVmissingLDInst"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a SMV ExtRef if srcCBName is missing", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[intAddr="SMVmissingCBName"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a SMV ExtRef if there is no match for a control block (on srcLDInst)", () => {
      const extRef = testDoc.querySelector(
        'IED[name="SMV_Subscriber"] Inputs > ExtRef[iedName="SMV_Publisher"][intAddr="AmpSv;TCTR2/AmpSv/instMag.i"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });
  });

  describe("for ReportControl", () => {
    it("it returns a ReportControl from an ExtRef with ServiceType", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasServiceType1"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="reportInLN"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef with ServiceType from pServT", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasServiceType2"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="reportInLN"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef with no ServiceType", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasNoServiceType"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="reportInLN"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef using ldInst if srcLDInst is not declared", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasNosrcLDInst"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="reportInLN"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl in LN0", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportCBinLN0"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="reportInLN0"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef if srcPrefix is missing on the ExtRef and prefix is missing on the LN", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasEmptyStrSrcLNInst2"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="rpLNPrefix2"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef if srcPrefix is missing on the ExtRef and prefix is an empty string on the LN", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasEmptyStrSrcLNInst3"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="rpLNPrefix1"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef if srcPrefix is an empty string on the ExtRef and prefix is missing on the LN", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasEmptyStrSrcLNInst4"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="rpLNPrefix2"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns a ReportControl from an ExtRef if srcPrefix is an empty string on the ExtRef and prefix is an empty string on the LN", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasEmptyStrSrcLNInst5"]',
      )!;
      const rptCtrl = testDoc.querySelector(
        'IED[name="Report_Publisher"] ReportControl[name="rpLNPrefix1"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(rptCtrl).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.equal(rptCtrl);
    });

    it("returns null for a Report ExtRef if iedName is missing", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportMissingIEDName"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.be.null;
    });

    it("returns null for a Report ExtRef if srcLDInst and ldInst are missing", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasNoLDInst"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.be.null;
    });

    it("returns null for a Report ExtRef if srcCBName is missing", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasNoSrcCBName"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.be.null;
    });

    it("returns null for a Report ExtRef if a srcCBName is incorrect", () => {
      const rptExtRef = testDoc.querySelector(
        'IED[name="Report_Subscriber"] ExtRef[intAddr="ReportHasWrongSrcCBName"]',
      )!;

      expect(rptExtRef).to.not.be.null;
      expect(sourceControlBlock(rptExtRef)).to.be.null;
    });
  });

  describe("for Poll", () => {
    it("it returns null for serviceType of poll", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="Poll1"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });

    it("returns null for a pServT of Poll", () => {
      const extRef = testDoc.querySelector(
        'IED[name="GOOSE_Subscriber"] Inputs > ExtRef[iedName="GOOSE_Publisher"][srcCBName="GOOSE2"][intAddr="Poll2"]',
      )!;

      expect(extRef).to.not.be.null;
      expect(sourceControlBlock(extRef)).to.be.null;
    });
  });
});
