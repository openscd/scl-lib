import { expect } from "vitest";

import { Insert, SetAttributes } from "@openscd/oscd-api";
import { isInsert, isSetAttributes } from "@openscd/oscd-api/utils.js";

import { subscriptionEd2, subscriptionEd1 } from "./subscribe.testfiles.js";
import { subscribe } from "./subscribe.js";
import { findElement } from "../foundation/helpers.test.js";

const docEd2 = findElement(subscriptionEd2) as XMLDocument;
const docEd1 = findElement(subscriptionEd1) as XMLDocument;

describe("Function to connect source data to sink elements (subscribe)", () => {
  describe("with invalid inputs", () => {
    it("invalid sink element LDevice", () => {
      const controlBlock = docEd1.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd1.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd1.querySelector(`LDevice[inst="Earth_Switch"]`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
      expect(edits.length).to.equal(0);
    });

    it("invalid sink element missing ExtRef intAddr", () => {
      const controlBlock = docEd2.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd2.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd2.querySelector(`ExtRef[desc="missingIntAddr"]`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
      expect(edits.length).to.equal(0);
    });

    it("invalid sink element subscriber later binding ExtRef", () => {
      const controlBlock = docEd2.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd2.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd2.querySelector(`ExtRef[desc="subscribedExtRef"]`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
      expect(edits.length).to.equal(0);
    });

    it("invalid source.fcda element", () => {
      const fcda = docEd1.querySelector(`FCDA[desc="missingDoName"]`)!;
      const sink = docEd1.querySelector(`Inputs`)!;

      const edits = subscribe([{ sink, source: { fcda } }]);
      expect(edits.length).to.equal(0);
    });

    it("invalid with orphan FCDA", () => {
      const source = docEd1.querySelector(`FCDA[desc="goose1q"]`)!;
      const orphanFcda = source.cloneNode(true) as Element;
      const sink = docEd2.querySelector(`Inputs`)!;

      expect(
        subscribe([{ sink, source: { fcda: orphanFcda } }]).length,
      ).to.equal(0);
    });

    it("overrules validity check with force option", () => {
      const controlBlock = docEd2.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd2.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd2.querySelector(`ExtRef[desc="missingIntAddr"]`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }], {
        force: true,
        ignoreSupervision: true,
        checkOnlyBType: false,
      });
      expect(edits.length).to.equal(1);
    });
  });

  describe("with edition 1 projects", () => {
    it("return update edit for later binding type ExtRef ", () => {
      const controlBlock = docEd1.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd1.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd1.querySelector(`ExtRef[intAddr="Pos;CSWI1/Pos/q"]`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
      expect(edits.length).to.equal(1);
      expect(edits[0]).to.satisfies(isSetAttributes);
      expect((edits[0] as SetAttributes).element).to.equal(sink);
      expect((edits[0] as SetAttributes).attributes).to.deep.equal({
        iedName: "Publisher",
        ldInst: "QB1_Disconnector",
        prefix: "",
        lnClass: "CSWI",
        lnInst: "1",
        doName: "Pos",
        daName: "q",
      });
    });

    it("returns insert edit for non later binding type subscription", () => {
      const controlBlock = docEd1.querySelector(`GSEControl[desc="goose1"]`)!;
      const fcda = docEd1.querySelector(`FCDA[desc="goose1q"]`)!;
      const sink = docEd1.querySelector(`Inputs`)!;

      const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
      expect(edits.length).to.equal(1);
      expect(edits[0]).to.satisfies(isInsert);
      expect(((edits[0] as Insert).parent as Element).tagName).to.equal(
        "Inputs",
      );
      expect(((edits[0] as Insert).node as Element).tagName).to.equal("ExtRef");
      expect(((edits[0] as Insert).reference as Element).tagName).to.equal(
        "ExtRef",
      );

      const extRef = (edits[0] as Insert).node as Element;
      expect(extRef.getAttribute("iedName")).to.equal("Publisher");
      expect(extRef.getAttribute("ldInst")).to.equal("QB1_Disconnector");
      expect(extRef.getAttribute("prefix")).to.equal("");
      expect(extRef.getAttribute("lnClass")).to.equal("CSWI");
      expect(extRef.getAttribute("lnInst")).to.equal("1");
      expect(extRef.getAttribute("doName")).to.equal("Pos");
      expect(extRef.getAttribute("daName")).to.equal("q");
      expect(extRef.hasAttribute("serviceType")).to.be.false;
      expect(extRef.hasAttribute("srcLDInst")).to.be.false;
      expect(extRef.hasAttribute("srcPrefix")).to.be.false;
      expect(extRef.hasAttribute("srcLNClass")).to.be.false;
      expect(extRef.hasAttribute("srcLNInst")).to.be.false;
      expect(extRef.hasAttribute("srcCBName")).to.be.false;
    });
  });

  describe("with edition 2 and upward projects", () => {
    describe("for later binding type subscription", () => {
      it("checks for invalid pLN to lnClass", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(subscribe([{ sink, source }]).length).to.equal(0);
      });

      it("checks for invalid pDO to doName", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(subscribe([{ sink, source }]).length).to.equal(0);
      });

      it("checks for invalid pDA to daName", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(subscribe([{ sink, source }]).length).to.equal(0);
      });

      it("allows subscription with invalid pLN with option checkOnlyBType", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(
          subscribe([{ sink, source }], {
            ignoreSupervision: false,
            force: false,
            checkOnlyBType: true,
          }).length,
        ).to.equal(1);
      });

      it("allows subscription with invalid pDO with option checkOnlyBType", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(
          subscribe([{ sink, source }], {
            ignoreSupervision: false,
            force: false,
            checkOnlyBType: true,
          }).length,
        ).to.equal(1);
      });

      it("allows subscription with invalid pDA to daName with option checkOnlyBType", () => {
        const controlBlock = docEd2.querySelector("ReportControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="invalAnalogue1"]`)!;
        expect(
          subscribe([{ sink, source }], {
            ignoreSupervision: false,
            force: false,
            checkOnlyBType: true,
          }).length,
        ).to.equal(1);
      });

      it("checks for invalid pServT to controlBlock.tagName", () => {
        const controlBlock = docEd2.querySelector("GSEControl")!;
        const fcda = docEd2.querySelector(`DataSet[name="Meas"] > FCDA`)!;
        const source = { fcda, controlBlock };

        const sink = docEd2.querySelector(`ExtRef[intAddr="validAnalogue"]`)!;
        expect(subscribe([{ sink, source }]).length).to.equal(0);
      });

      it("is strict with incorrect FCDA definition", () => {
        const fcda = docEd2.querySelector(`FCDA[ldInst="NonExistingLDinst"]`)!;
        const sink = docEd2.querySelector(`ExtRef[intAddr="validAnalogue"]`)!;

        expect(subscribe([{ sink, source: { fcda } }]).length).to.equal(0);
      });

      it("returns no update edit with failing SPS/BOOLEAN check", () => {
        const controlBlock = docEd2.querySelector(`GSEControl[name="GOOSE1"]`)!;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1q"]`)!;
        const sink = docEd2.querySelector(`ExtRef[intAddr="restrictExtRef"]`)!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(0);
      });

      it("returns no update edit with failing CMV/FLOAT32 check ", () => {
        const controlBlock = docEd2.querySelector(`ReportControl`)!;
        const fcda = docEd2.querySelector(` DataSet[name="Meas"] > FCDA`)!;
        const sink = docEd2.querySelector(`ExtRef[intAddr="wrongAnalogue"]`)!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(0);
      });

      it("returns update edit with passing SPC/BOOLEAN check", () => {
        const controlBlock = docEd2.querySelector(`GSEControl[name="GOOSE1"]`)!;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1stVal"]`)!;
        const sink = docEd2.querySelector(`ExtRef[intAddr="restrictExtRef"]`)!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(1);
      });

      it("returns update edit with passing CMV/FLOAT32 check", () => {
        const controlBlock = docEd2.querySelector(` ReportControl`)!;
        const fcda = docEd2.querySelector(` DataSet[name="Meas"] > FCDA`)!;
        const sink = docEd2.querySelector(`ExtRef[intAddr="validAnalogue"]`)!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(1);
      });

      it("return update edit with srcxxx attributes with controlBlock set", () => {
        const controlBlock = docEd2.querySelector(`GSEControl[name="GOOSE1"]`)!;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1stVal"]`)!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] ExtRef[intAddr="Pos;CSWI1/Pos/stVal"]`,
        )!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(1);
        expect(edits[0]).to.satisfies(isSetAttributes);
        expect((edits[0] as SetAttributes).element).to.equal(sink);
        expect((edits[0] as SetAttributes).attributes).to.deep.equal({
          iedName: "Publisher",
          ldInst: "QB1_Disconnector",
          prefix: "",
          lnClass: "CSWI",
          lnInst: "1",
          doName: "Pos",
          daName: "stVal",
          srcLDInst: "QB2_Disconnector",
          srcPrefix: "",
          srcLNClass: "LLN0",
          srcLNInst: null,
          srcCBName: "GOOSE1",
          serviceType: "GOOSE",
        });
      });

      it("return update edit without srcXXX attributes with controlBlock set", () => {
        const controlBlock = undefined;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1stVal"]`)!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] ExtRef[intAddr="Pos;CSWI1/Pos/stVal"]`,
        )!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }]);
        expect(edits.length).to.equal(1);
        expect(edits[0]).to.satisfies(isSetAttributes);
        expect((edits[0] as SetAttributes).element).to.equal(sink);
        expect((edits[0] as SetAttributes).attributes).to.deep.equal({
          iedName: "Publisher",
          ldInst: "QB1_Disconnector",
          prefix: "",
          lnClass: "CSWI",
          lnInst: "1",
          doName: "Pos",
          daName: "stVal",
          srcLDInst: null,
          srcPrefix: null,
          srcLNClass: null,
          srcLNInst: null,
          srcCBName: null,
          serviceType: null,
        });
      });
    });

    describe("for non later binding type subscription", () => {
      it("return insert edit to add ExtRef", () => {
        const controlBlock = docEd2.querySelector(`GSEControl[name="GOOSE1"]`)!;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1q"]`)!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] LN[lnClass="XSWI"]`,
        )!;

        const edits = subscribe([{ sink, source: { fcda, controlBlock } }], {
          force: false,
          ignoreSupervision: true,
          checkOnlyBType: false,
        });
        expect(edits.length).to.equal(2);
        expect(edits[0]).to.satisfies(isInsert);
        expect(((edits[0] as Insert).parent as Element).tagName).to.equal("LN");
        expect(((edits[0] as Insert).node as Element).tagName).to.equal(
          "Inputs",
        );
        expect((edits[0] as Insert).reference).to.equal(null);

        const extRef = (edits[1] as Insert).node as Element;
        expect(extRef.getAttribute("iedName")).to.equal("Publisher");
        expect(extRef.getAttribute("ldInst")).to.equal("QB1_Disconnector");
        expect(extRef.getAttribute("prefix")).to.equal("");
        expect(extRef.getAttribute("lnClass")).to.equal("CSWI");
        expect(extRef.getAttribute("lnInst")).to.equal("1");
        expect(extRef.getAttribute("doName")).to.equal("Pos");
        expect(extRef.getAttribute("daName")).to.equal("q");
        expect(extRef.getAttribute("srcLDInst")).to.equal("QB2_Disconnector");
        expect(extRef.getAttribute("srcPrefix")).to.be.equal("");
        expect(extRef.getAttribute("srcLNClass")).to.equal("LLN0");
        expect(extRef.getAttribute("srcLNInst")).to.be.null;
        expect(extRef.getAttribute("srcCBName")).to.equal("GOOSE1");
        expect(extRef.getAttribute("serviceType")).to.equal("GOOSE");
      });

      it("makes sure to create as many inputs as needed", () => {
        const controlBlock = undefined;
        let fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE2sDataSet"] > FCDA[daName="stVal"]`,
        )!;
        let sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] LN[lnClass="XSWI"]`,
        )!;
        const extRef3 = { sink, source: { fcda, controlBlock } };

        fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE2sDataSet"] > FCDA[daName="q"]`,
        )!;
        sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] LN[lnClass="XSWI"]`,
        )!;
        const extRef4 = { sink, source: { fcda, controlBlock } };

        const edits = subscribe([extRef3, extRef4], {
          force: false,
          ignoreSupervision: true,
          checkOnlyBType: false,
        });
        expect(edits.length).to.equal(3);
        expect(edits[0]).to.satisfies(isInsert);
        expect(edits[1]).to.satisfies(isInsert);
        expect(edits[2]).to.satisfies(isInsert);
      });
    });

    describe("independent of the Edition definition", () => {
      it("allows to input single Connection", () => {
        const controlBlock = docEd2.querySelector(`GSEControl[name="GOOSE1"]`)!;
        const fcda = docEd2.querySelector(`FCDA[desc="goose1stVal"]`)!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] ExtRef[intAddr="Pos;CSWI1/Pos/stVal"]`,
        )!;

        const edits = subscribe({ sink, source: { fcda, controlBlock } });
        expect(edits.length).to.equal(1);
      });

      it("allows multiple subscriptions at once", () => {
        let controlBlock: Element | undefined =
          docEd2.querySelector(`SampledValueControl`)!;
        let fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="SamplVal"] > FCDA[daName="instMag.i"]`,
        )!;
        let sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] ExtRef[intAddr="someTCTRinstMag"]`,
        )!;
        const extRef1 = {
          sink,
          source: { fcda, controlBlock },
        };

        fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="SamplVal"] > FCDA[daName="q"]`,
        )!;
        sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] ExtRef[intAddr="someTCTRq"]`,
        )!;
        const extRef2 = { sink, source: { fcda, controlBlock } };

        controlBlock = undefined;
        fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE2sDataSet"] > FCDA[daName="stVal"]`,
        )!;
        sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] LN[lnClass="XSWI"]`,
        )!;
        const extRef3 = { sink, source: { fcda, controlBlock } };

        fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE2sDataSet"] > FCDA[daName="q"]`,
        )!;
        sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber"] LDevice[inst="Earth_Switch"] LN[lnClass="XSWI"]`,
        )!;
        const extRef4 = { sink, source: { fcda, controlBlock } };

        const edits = subscribe([extRef1, extRef2, extRef3, extRef4]);
        expect(edits.length).to.equal(5);
        expect(edits[0]).to.satisfies(isInsert);
        expect(edits[1]).to.satisfies(isSetAttributes);
        expect((edits[1] as SetAttributes).attributes).to.deep.equal({
          iedName: "Publisher",
          ldInst: "SampledValue",
          prefix: "L1",
          lnClass: "TCTR",
          lnInst: "1",
          doName: "AmpSv",
          daName: "instMag.i",
          srcLDInst: "SampledValue",
          srcPrefix: "",
          srcLNClass: "LLN0",
          srcLNInst: null,
          srcCBName: "someSmv",
          serviceType: "SMV",
        });
        expect(edits[2]).to.satisfies(isSetAttributes);
        expect(edits[3]).to.satisfies(isInsert);
        expect(edits[4]).to.satisfies(isInsert);
      });
    });

    describe("handles subscription supervision", () => {
      it("per default tries to add a subscription supervision", () => {
        const controlBlock: Element | undefined =
          docEd2.querySelector(`SampledValueControl`)!;
        const fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="SamplVal"] > FCDA[daName="instMag.i"]`,
        )!;
        const sink = docEd2.querySelector(
          `IED[name="SMV_Subscriber1"] LDevice[inst="Earth_Switch"] > LN0`,
        )!;
        const extRefEdit1 = {
          sink,
          source: { fcda, controlBlock },
        };

        const edits = subscribe([extRefEdit1]);
        expect(edits.length).to.equal(3);
      });

      it("with ignoreSupervision set to false tries to add a subscription supervision", () => {
        const controlBlock: Element | undefined = docEd2.querySelector(
          `IED[name="Publisher"] GSEControl[name="GOOSE3"]`,
        )!;
        const fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE1sDataSet"] > FCDA[daName="stVal"]`,
        )!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber1"] ExtRef[intAddr="Pos;CSWI1/Pos/stVal"]`,
        )!;
        const extRefEdit1 = {
          sink,
          source: { fcda, controlBlock },
        };

        const edits = subscribe([extRefEdit1], {
          force: false,
          ignoreSupervision: false,
          checkOnlyBType: false,
        });
        expect(edits.length).to.equal(2);
      });

      it("with ignoreSupervision set to true does not make an attempt to ad a subscription supervision", () => {
        const controlBlock: Element | undefined = docEd2.querySelector(
          `IED[name="Publisher"] GSEControl[name="GOOSE3"]`,
        )!;
        const fcda = docEd2.querySelector(
          `IED[name="Publisher"] DataSet[name="GOOSE1sDataSet"] > FCDA[daName="q"]`,
        )!;
        const sink = docEd2.querySelector(
          `IED[name="GOOSE_Subscriber1"] ExtRef[intAddr="Pos;CSWI1/Pos/q"]`,
        )!;
        const extRefEdit1 = {
          sink,
          source: { fcda, controlBlock },
        };

        const edits = subscribe([extRefEdit1], {
          force: false,
          ignoreSupervision: true,
          checkOnlyBType: false,
        });
        expect(edits.length).to.equal(1);
      });
    });
  });
});
