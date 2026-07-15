import { expect } from "chai";

import { isSetAttributes } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import { updateReportControl } from "./updateReportControl.js";
import { subscribedReport } from "./tReportControl.testfiles.js";

describe("update ReportControl element", () => {
  const attributes = {
    desc: "someDesc",
    buffered: "true",
    rptID: "someRptID",
    indexed: "true",
    bufTime: "100",
    intPd: "40",
  };

  it("returns empty array when input element is not ReportControl", () => {
    const ln = findElement(subscribedReport, "LN0")! as Element;
    const edits = updateReportControl({
      element: ln,
      attributes: {},
    });

    expect(edits).to.be.empty;
  });

  describe("when no name attribute is changed", () => {
    it("updates ReportControl attributes and confRev", () => {
      const reportControl = findElement(
        subscribedReport,
        "ReportControl",
      )! as Element;
      const edits = updateReportControl({
        element: reportControl,
        attributes,
      });

      expect(edits.length).to.equal(1);
      expect(edits[0]).to.satisfy(isSetAttributes);
      expect(edits[0].element).to.equal(reportControl);
      expect(edits[0].attributes).to.deep.equal({
        ...attributes,
        confRev: "20001",
      });
    });

    it("updates confRev of DataSet change ReportControl", () => {
      const reportControl = findElement(
        subscribedReport,
        "ReportControl",
      )! as Element;
      const edits = updateReportControl({
        element: reportControl,
        attributes: { datSet: "someDataSet" },
      });

      expect(edits.length).to.equal(1);
      expect(edits[0]).to.satisfy(isSetAttributes);
      expect(edits[0].element).to.equal(reportControl);
      expect(edits[0].attributes).to.deep.equal({
        ...{ datSet: "someDataSet" },
        confRev: "20001",
      });
    });
  });

  describe("when name attribute is changed", () => {
    it("also updates subscribed ExtRefs", () => {
      const reportControl = findElement(
        subscribedReport,
        "ReportControl",
      )! as Element;
      const edits = updateReportControl({
        element: reportControl,
        attributes: {
          name: "someNewName",
          ...attributes,
        },
      });

      expect(edits.length).to.equal(3);
      expect(edits[0]).to.satisfy(isSetAttributes);
      expect(edits[0].element).to.equal(reportControl);
      expect(edits[0].attributes).to.deep.equal({
        name: "someNewName",
        ...attributes,
        confRev: "20001",
      });

      expect(edits[1]).to.satisfy(isSetAttributes);
      expect(edits[1].element.tagName).to.equal("ExtRef");
      expect(edits[1].attributes).to.deep.equal({
        srcCBName: "someNewName",
      });

      expect(edits[2]).to.satisfy(isSetAttributes);
      expect(edits[2].element.tagName).to.equal("ExtRef");
      expect(edits[2].attributes).to.deep.equal({
        srcCBName: "someNewName",
      });
    });
  });
});
