import { expect } from "chai";

import { isSetAttributes } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import { substation } from "../tSubstation/substation.testfiles.js";
import { updateVoltageLevel } from "./updateVoltageLevel.js";

const aa1 = findElement(substation, 'Substation[name="AA1"]') as Element;
const aa1e1 = findElement(
  substation,
  'Substation[name="AA1"]>VoltageLevel[name="E1"]',
) as Element;

const aa2d1 = findElement(
  substation,
  'Substation[name="AA2"]>VoltageLevel[name="D1"]',
) as Element;
const aa3j1 = findElement(
  substation,
  'Substation[name="AA3"]>VoltageLevel[name="J1"]',
) as Element;

const orphanVoltageLevel = new DOMParser()
  .parseFromString('<VoltageLevel name="E2" />', "application/xml")
  .querySelector("VoltageLevel")!;

describe("update VoltageLevel element", () => {
  it("does not seek additional updates when input element is not VoltageLevel", () => {
    const edits = updateVoltageLevel({
      element: aa1,
      attributes: { name: "E03" },
    });

    expect(edits.length).to.equal(1);
  });

  it("does not seek additional updates with orphan VoltageLevel element", () => {
    const edits = updateVoltageLevel({
      element: orphanVoltageLevel,
      attributes: { name: "E04" },
    });

    expect(edits.length).to.equal(1);
  });

  describe("when no name attribute is changed", () => {
    it("updates only VoltageLevel attributes", () => {
      const edits = updateVoltageLevel({
        element: aa1e1,
        attributes: { desc: "newDesc", numPhases: "4", nomFreq: "60" },
      });

      expect(edits.length).to.equal(1);
      expect(edits[0].element).to.equal(aa1e1);
      expect(edits[0].attributes).to.deep.equal({
        desc: "newDesc",
        numPhases: "4",
        nomFreq: "60",
      });
    });
  });

  describe("when name attribute is changed", () => {
    it("does not add reference updates when attribute name has not changed", () => {
      const edits = updateVoltageLevel({
        element: aa1e1,
        attributes: { name: "E1" },
      });

      expect(edits.length).to.equal(1);
    });

    it("overwrites invalid ConnectivityNode path attribute", () => {
      const edits = updateVoltageLevel({
        element: aa2d1,
        attributes: { name: "D2" },
      });

      expect(edits.length).to.equal(2);
      expect(edits[1].attributes).to.deep.equal({
        pathName: "AA2/D2/Q01/L1",
      });
    });

    it("updates related ConnectivityNode path", () => {
      const edits = updateVoltageLevel({
        element: aa1e1,
        attributes: { name: "E2" },
      });

      expect(edits.length).to.equal(16);
      expect(edits[0].element).to.equal(aa1e1);

      const updates = edits.filter(isSetAttributes);

      expect(
        updates.find(
          ({ attributes }) => attributes?.pathName === "AA1/E2/BB1/L1",
        ),
      ).to.exist;

      expect(edits[1].attributes).to.deep.equal({
        pathName: "AA1/E2/BB1/L1",
      });

      expect(
        updates.find(
          ({ attributes }) => attributes?.pathName === "AA1/E2/Q01/L1",
        ),
      ).to.exist;

      expect(
        updates.find(
          ({ attributes }) => attributes?.pathName === "AA1/E2/Q01/L2",
        ),
      ).to.exist;

      expect(
        updates.find(
          ({ attributes }) => attributes?.pathName === "AA1/E2/Q02/L2",
        ),
      ).to.exist;

      expect(
        updates.find(
          ({ attributes }) => attributes?.pathName === "AA1/E2/Q02/L2",
        ),
      ).to.exist;
    });

    it("updates related Terminal and NeutralPoint connectivityNode and voltageLevelName", () => {
      const edits = updateVoltageLevel({
        element: aa1e1,
        attributes: { name: "E2" },
      });

      expect(edits.length).to.equal(16);

      const updates = edits.filter(isSetAttributes);

      expect(
        updates.find(
          ({ attributes }) =>
            attributes?.["voltageLevelName"] === "E2" &&
            attributes?.["connectivityNode"] === "AA1/E2/BB1/L1",
        ),
      ).to.exist;

      expect(
        updates.find(
          ({ element: { tagName }, attributes }) =>
            tagName === "NeutralPoint" &&
            attributes?.["voltageLevelName"] === "E2" &&
            attributes?.["connectivityNode"] === "AA1/E2/BB1/L1",
        ),
      ).to.exist;

      expect(
        updates.filter(
          ({ attributes }) =>
            attributes?.["voltageLevelName"] === "E2" &&
            attributes?.["connectivityNode"] === "AA1/E2/Q01/L1",
        ),
      ).to.have.lengthOf(2);
    });

    it("updates SourceRef source attribute", () => {
      const edits = updateVoltageLevel({
        element: aa3j1,
        attributes: { name: "F1" },
      });

      expect(edits.length).to.equal(5);
      expect(edits[1].attributes?.source).to.equal(
        "AA3/F1/Q01/QA2/CBR/CSWI1/OpCls.general",
      );
      expect(edits[2].attributes?.source).to.equal(
        "AA3/F1/Q01/QA2/CBR/CSWI1/OpCls.q",
      );
      expect(edits[3].attributes?.source).to.equal(
        "AA3/F1/Q01/QA2/CBR/CSWI1/OpOpn.general",
      );
      expect(edits[4].attributes?.source).to.equal(
        "AA3/F1/Q01/QA2/CBR/CSWI1/OpOpn.q",
      );
    });
  });
});
