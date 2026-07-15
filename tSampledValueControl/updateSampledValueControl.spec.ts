import { expect } from "chai";

import { Insert, Remove, SetAttributes } from "@openscd/oscd-api";
import {
  isInsert,
  isRemove,
  isSetAttributes,
} from "@openscd/oscd-api/utils.js";

import { smvControlDoc } from "./smvcontrol.testfiles.js";

import { updateSampledValueControl } from "./updateSampledValueControl.js";

function findElement(str: string, selector: string): Element | null {
  return new DOMParser()
    .parseFromString(str, "application/xml")
    .querySelector(selector);
}

function buildAttr(
  type: "name" | "datSet" | "datSetOnly" | "none" = "none",
): Record<string, string | null> {
  if (type === "name")
    return {
      name: "someNewSmvName",
      desc: "someDesc",
      multicast: "true",
      smvID: "someSmvID",
      smpRate: "90",
      nofASDU: "2",
    };

  if (type === "datSet")
    return {
      datSet: "someNewDatSet",
      desc: "someDesc",
      multicast: "false",
      smvID: "someSmvID",
      smpRate: "70",
      nofASDU: "3",
    };

  if (type === "datSetOnly")
    return {
      datSet: "someNewDatSet",
    };

  return {
    desc: "someDesc",
    smpMod: "SmpPerSec",
    securityEnabled: "SignatureAndEncryption",
    confRev: "50",
  };
}

describe("Utility function to update SampledValueControl attributes", () => {
  it("returns empty array when update.element is not SampledValueControl update", () => {
    const ied = findElement(smvControlDoc, ":root > IED")!;
    const actions = updateSampledValueControl({
      element: ied,
      attributes: buildAttr(),
    });

    expect(actions.length).to.equal(0);
  });

  describe("with intention to change name attributes", () => {
    it("also updates subscribed ExtRefs", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv3"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("name"),
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        name: "someNewSmvName",
        desc: "someDesc",
        multicast: "true",
        smvID: "someSmvID",
        smpRate: "90",
        nofASDU: "2",
      });

      expect(actions[1]).to.satisfy(isSetAttributes);
      expect((actions[1] as SetAttributes).element.tagName).to.equal("ExtRef");
      expect((actions[1] as SetAttributes).attributes).to.deep.equal({
        srcCBName: "someNewSmvName",
      });
    });

    it("also updates subscriber supervision Val element", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("name"),
      });

      expect(actions.length).to.equal(4);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        name: "someNewSmvName",
        desc: "someDesc",
        multicast: "true",
        smpRate: "90",
        nofASDU: "2",
        smvID: "someSmvID",
      });

      expect(actions[1]).to.satisfy(isSetAttributes);
      expect((actions[1] as SetAttributes).element.tagName).to.equal("ExtRef");
      expect((actions[1] as SetAttributes).attributes).to.deep.equal({
        srcCBName: "someNewSmvName",
      });

      const oldText = Array.from(
        smvControl.ownerDocument.querySelector(
          'LN[lnClass="LSVS"][inst="1"] Val',
        )?.childNodes ?? [],
      ).find((node) => node.nodeType === Node.TEXT_NODE)!;
      expect(actions[2]).to.satisfy(isRemove);
      expect((actions[2] as Remove).node).to.equal(oldText);

      expect(actions[3]).to.satisfy(isInsert);
      expect((actions[3] as Insert).parent).to.equal(oldText.parentElement);
      expect((actions[3] as Insert).node.textContent).to.equal(
        "srcIEDsomeLDInst/LLN0.someNewSmvName",
      );
    });

    it("also updates SMV cbName attribute", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv2"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("name"),
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        name: "someNewSmvName",
        desc: "someDesc",
        multicast: "true",
        smpRate: "90",
        nofASDU: "2",
        smvID: "someSmvID",
      });

      expect(actions[1]).to.satisfy(isSetAttributes);
      expect((actions[1] as SetAttributes).element.tagName).to.equal("SMV");
      expect((actions[1] as SetAttributes).attributes).to.deep.equal({
        cbName: "someNewSmvName",
      });
    });
  });

  describe("with intention to change datSet attributes", () => {
    it("also updates DataSet.name with DataSet being single used", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv3"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("datSet"),
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        desc: "someDesc",
        datSet: "someNewDatSet",
        smvID: "someSmvID",
        confRev: "30001",
        smpRate: "70",
        nofASDU: "3",
        multicast: "false",
      });

      expect(actions[1]).to.satisfy(isSetAttributes);
      expect((actions[1] as SetAttributes).element.tagName).to.equal("DataSet");
      expect((actions[1] as SetAttributes).attributes).to.deep.equal({
        name: "someNewDatSet",
      });
    });

    it("also updates DataSet.name with DataSet being single used", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv2"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("datSet"),
      });

      expect(actions.length).to.equal(1);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        desc: "someDesc",
        confRev: "10001",
        smpRate: "70",
        nofASDU: "3",
        multicast: "false",
        smvID: "someSmvID",
      });
    });

    it("also updates SampledValueControl.confRev on datSet change", () => {
      const smvControl = findElement(
        smvControlDoc,
        'SampledValueControl[name="someSmv3"]',
      )!;
      const actions = updateSampledValueControl({
        element: smvControl,
        attributes: buildAttr("datSetOnly"),
      });

      expect(actions.length).to.equal(2);
      expect(actions[0]).to.satisfy(isSetAttributes);
      expect((actions[0] as SetAttributes).element).to.equal(smvControl);
      expect((actions[0] as SetAttributes).attributes).to.deep.equal({
        datSet: "someNewDatSet",
        confRev: "30001",
      });

      expect(actions[1]).to.satisfy(isSetAttributes);
      expect((actions[1] as SetAttributes).element.tagName).to.equal("DataSet");
      expect((actions[1] as SetAttributes).attributes).to.deep.equal({
        name: "someNewDatSet",
      });
    });
  });
});
