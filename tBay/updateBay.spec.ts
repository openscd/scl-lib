import { expect } from "chai";

import { isSetAttributes } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import { substation } from "../tSubstation/substation.testfiles.js";
import { updateBay } from "./updateBay.js";

const aa1 = findElement(substation, 'Substation[name="AA1"]') as Element;
const aa1e1q01 = findElement(
  substation,
  'Substation[name="AA1"]>VoltageLevel[name="E1"]>Bay[name="Q01"]',
) as Element;
const aa1e1bb1 = findElement(
  substation,
  'Substation[name="AA1"]>VoltageLevel[name="E1"]>Bay[name="BB1"]',
) as Element;
const aa2d1q01 = findElement(
  substation,
  'Substation[name="AA2"]>VoltageLevel[name="D1"]>Bay[name="Q01"]',
) as Element;
const aa3j1q01 = findElement(
  substation,
  'Substation[name="AA3"]>VoltageLevel[name="J1"]>Bay[name="Q01"]',
) as Element;

const orphanBay = new DOMParser()
  .parseFromString('<Bay name="Q01" />', "application/xml")
  .querySelector("Bay")!;

describe("update Bay element", () => {
  it("does not seek addition updates when input element is not Bay", () => {
    const edits = updateBay({ element: aa1, attributes: { name: "Q04" } });

    expect(edits.length).to.equal(1);
  });

  it("does not seek addition updates with orphan Bay element", () => {
    const edits = updateBay({
      element: orphanBay,
      attributes: { name: "Q04" },
    });

    expect(edits.length).to.equal(1);
  });

  describe("when no name attribute is changed", () => {
    it("updates desc attributes", () => {
      const edits = updateBay({
        element: aa1e1q01,
        attributes: { desc: "newDesc" },
      });

      expect(edits.length).to.equal(1);
      expect(edits[0].element).to.equal(aa1e1q01);
      expect(edits[0].attributes).to.deep.equal({
        desc: "newDesc",
      });
    });
  });

  describe("when name attribute is changed", () => {
    it("does not update when name has not changed", () => {
      const edits = updateBay({
        element: aa1e1q01,
        attributes: { name: "Q01" },
      });

      expect(edits.length).to.equal(1);
    });

    it("overwrites invalid ConnectivityNode path attribute", () => {
      const edits = updateBay({
        element: aa2d1q01,
        attributes: { name: "Q02" },
      });

      expect(edits.length).to.equal(2);
      expect(edits[1].attributes).to.deep.equal({
        pathName: "AA2/D1/Q02/L1",
      });
    });

    it("updates ConnectivityNode path", () => {
      const edits = updateBay({
        element: aa1e1q01,
        attributes: { name: "Q03" },
      });

      expect(edits.length).to.equal(6);
      expect(edits[0]).to.satisfy(isSetAttributes);
      expect(edits[0].element).to.equal(aa1e1q01);

      expect(
        edits
          .filter(isSetAttributes)
          .find(({ attributes }) => attributes?.pathName === "AA1/E1/Q03/L1"),
      ).to.exist;
      expect(
        edits
          .filter(isSetAttributes)
          .find(({ attributes }) => attributes?.pathName === "AA1/E1/Q03/L2"),
      ).to.exist;
    });

    it("updates Terminal connectivityNode and bayName", () => {
      const edits = updateBay({
        element: aa1e1q01,
        attributes: { name: "Q03" },
      });

      expect(edits.length).to.equal(6);
      expect(edits[0]).to.satisfy(isSetAttributes);
      expect(edits[0].element).to.equal(aa1e1q01);

      expect(
        edits
          .filter(isSetAttributes)
          .filter(
            ({ attributes }) =>
              attributes?.connectivityNode === "AA1/E1/Q03/L1" &&
              attributes?.bayName === "Q03",
          ),
      ).to.have.lengthOf(2);
      expect(
        edits
          .filter(isSetAttributes)
          .find(
            ({ attributes }) =>
              attributes?.connectivityNode === "AA1/E1/Q03/L2" &&
              attributes?.bayName === "Q03",
          ),
      ).to.exist;
    });

    it("updates Terminals and NeutralPoints outside the bay element", () => {
      const edits = updateBay({
        element: aa1e1bb1,
        attributes: { name: "BB2" },
      });

      expect(
        edits
          .filter(isSetAttributes)
          .find(
            ({ element, attributes }) =>
              attributes?.connectivityNode === "AA1/E1/BB2/L1" &&
              attributes?.bayName === "BB2" &&
              element.tagName === "NeutralPoint",
          ),
      ).to.exist;
      expect(edits.length).to.equal(6);
    });

    it("updates SourceRef source attribute", () => {
      const edits = updateBay({
        element: aa3j1q01,
        attributes: { name: "Q02" },
      });

      expect(edits.length).to.equal(5);
      // cSpell:ignore CSWI
      expect(edits[1].attributes!.source).to.equal(
        "AA3/J1/Q02/QA2/CBR/CSWI1/OpCls.general",
      );
      expect(edits[2].attributes!.source).to.equal(
        "AA3/J1/Q02/QA2/CBR/CSWI1/OpCls.q",
      );
      expect(edits[3].attributes!.source).to.equal(
        "AA3/J1/Q02/QA2/CBR/CSWI1/OpOpn.general",
      );
      expect(edits[4].attributes!.source).to.equal(
        "AA3/J1/Q02/QA2/CBR/CSWI1/OpOpn.q",
      );
    });
  });
});
