import { expect } from "chai";

import { EditV2 } from "@openscd/oscd-api";
import { isRemove, isUpdate } from "@openscd/oscd-api/utils.js";

import { handleEdit } from "../foundation/helpers.test.js";

import { scl, sclDuplicateLNodes } from "./removeIED.testfile.js";

import { removeIED } from "./removeIED.js";

function numberRemoves(edits: EditV2[], tag: string): number {
  return edits.filter((edit) => isRemove(edit) && edit.node.nodeName === tag)
    .length;
}

function numberUpdates(edits: EditV2[], tag: string): number {
  return edits.filter((edit) => isUpdate(edit) && edit.element.nodeName === tag)
    .length;
}

const publisher = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="Publisher"]')!;

const subscriber1 = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="GOOSE_Subscriber1"]')!;

const client = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="Client"]')!;

const substation = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector("Substation")!;

describe("Function to an remove the IED and its referenced elements", () => {
  it("returns empty array with non-IED update", () =>
    expect(removeIED({ node: substation }).length).to.equal(0));

  it("returns just the IED element with missing IED name", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const publi = sclDom.querySelector('IED[name="Publisher"]')!;
    publi.removeAttribute("name");

    expect(removeIED({ node: publi }).length).to.equal(0);
  });

  it("removes all bound LNodes", () => {
    const edits = removeIED({ node: subscriber1 });

    expect(numberRemoves(edits, "LNode")).to.equal(1);
  });

  it("removes ConnectedAPs as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberRemoves(edits, "ConnectedAP")).to.equal(1);
  });

  it("removes non-later-binding ExtRefs as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberRemoves(edits, "ExtRef")).to.equal(4);
  });

  it("updates ExtRef iedName attributes as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberUpdates(edits, "ExtRef")).to.equal(7);
  });

  it("removes empty Inputs elements as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberRemoves(edits, "Inputs")).to.equal(1);
  });

  it("removes the KDC iedName attributes as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberRemoves(edits, "KDC")).to.equal(1);
  });

  it("removes Associations as well", () => {
    const edits = removeIED({ node: publisher });

    expect(numberRemoves(edits, "Association")).to.equal(1);
  });

  it("removes ClientLNs as well", () => {
    const edits = removeIED({
      node: client,
    });

    expect(numberRemoves(edits, "ClientLN")).to.equal(2);
  });

  it("removes IEDName elements as well", () => {
    const edits = removeIED({
      node: subscriber1,
    });

    expect(numberRemoves(edits, "IEDName")).to.equal(1);
  });

  it("removes LGOS/LSVS object reference", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const publisher = sclDom.querySelector('IED[name="Publisher"]')!;

    const before = Array.from(
      sclDom.querySelectorAll('LN[lnClass="LGOS"] Val, LN[lnClass="LSVS"] Val'),
    ).filter((iedName) => iedName.textContent?.startsWith("Publisher"));
    expect(before.length).to.equal(3);

    const edits = removeIED({
      node: publisher,
    });

    handleEdit(edits);

    const after = Array.from(
      sclDom.querySelectorAll('LN[lnClass="LGOS"] Val, LN[lnClass="LSVS"] Val'),
    ).filter((iedName) => iedName.textContent?.startsWith("Publisher"));
    // 1 supervised control block is not subscribed so is not removed
    expect(after.length).to.equal(1);
  });

  describe("referenced LNode's", () => {
    /*
     * Here we need to test:
     * - Delete all LNode references found with matching iedName, BUT only inside the substation section (but not inside Private sections).
     * - Find all LNode references with matching iedName and either set them to None, or delete them if setting them to None would result in duplicate LNode keys within the same scope.
     *   The scope is defined as the nearest Bay, VL or Substation parent.
     */
    describe("without 'preservveNodes' set (default)", () => {
      //TODO consider changing this into a forEach (Substation, VL and Bay) array test.
      ["Bay", "VoltageLevel", "Substation"].forEach((scope) => {
        it(`deletes all LNodes found directly within a ${scope}`, () => {
          const sclDom = new DOMParser().parseFromString(
            sclDuplicateLNodes,
            "application/xml",
          );
          const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
          const beforeSpec_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='None']`) ?? []
          ).length;

          const edits = removeIED({ node: iedA });
          handleEdit(edits);
          const after_iedA_lNodes = Array.from(
            sclDom.querySelectorAll(`${scope} LNode[iedName="IED_A"]`),
          ).length;
          const after_spec_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='None']`) ?? []
          ).length;
          expect(after_iedA_lNodes).to.equal(0);
          // The number of LNodes set to None should not have changed.
          expect(after_spec_LNodeCount).to.equal(beforeSpec_LNodeCount);

          //
        });
      });
    });

    describe.only("with preserveLNodes set", () => {
      // Broke this into 3 separate tests, so the scope of the failure "might" be narrower.
      // Do keep in mind however, the subject SCL has 2 of everything. E.g. S1 & S2
      ["Bay", "VoltageLevel", "Substation"].forEach((scope) => {
        it(`Within a ${scope}, it sets all bound LNodes to None`, () => {
          //we're using the "duplicates" test file, but by only deleting 1 IED, no duplicates occur (yet).
          const sclDom = new DOMParser().parseFromString(
            sclDuplicateLNodes,
            "application/xml",
          );
          const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
          const beforeSpec_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='None']`) ?? []
          ).length;
          const beforeIedA_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='IED_A']`) ?? []
          ).length;

          const edits = removeIED({ node: iedA }, { preserveLNodes: true });
          handleEdit(edits);
          const lNodes = Array.from(
            sclDom.querySelectorAll(`${scope} > LNode[iedName="None"]`),
          );
          expect(lNodes.length).to.equal(
            beforeSpec_LNodeCount + beforeIedA_LNodeCount,
          );
          //
        });
      });

      ["Bay", "VoltageLevel", "Substation"].forEach((scope) => {
        it(`Within a ${scope}, it removes 'would-be' duplicates`, () => {
          //we're using the "duplicates" test file, but by only deleting 1 IED, no duplicates occur.
          const sclDom = new DOMParser().parseFromString(
            sclDuplicateLNodes,
            "application/xml",
          );
          const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
          const iedB = sclDom.querySelector('IED[name="IED_B"]')!;

          handleEdit(removeIED({ node: iedA }, { preserveLNodes: true }));
          const beforeSpec_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='None']`) ?? []
          ).length;
          // After the first wave of deletions the SCL already has LNodes(iedName=None),
          // which exactly match the LNodes we're about to remove.
          // So when IED_B is removed (with preserveLNodes set), the LNodes(None)
          // should not have changed.
          handleEdit(removeIED({ node: iedB }, { preserveLNodes: true }));
          const iedB_lNodesCount = Array.from(
            sclDom.querySelectorAll(`${scope} > LNode[iedName="IED_B"]`),
          ).length;
          expect(iedB_lNodesCount).to.equal(0);
          // Although we've removed IED_A and IED_B, the count should remain unchanged after
          // removing IED_A, because both IED's are bound exactly the same.
          const afterSpec_LNodeCount = (
            sclDom.querySelectorAll(`${scope} > LNode[iedName='None']`) ?? []
          ).length;
          expect(afterSpec_LNodeCount).to.equal(beforeSpec_LNodeCount);
        });
      });

      it("does not create duplicate LNode keys when removing both IEDs", () => {
        const sclDom = new DOMParser().parseFromString(
          sclDuplicateLNodes,
          "application/xml",
        );
        const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
        const iedB = sclDom.querySelector('IED[name="IED_B"]')!;

        handleEdit(removeIED({ node: iedA }));
        handleEdit(removeIED({ node: iedB }));

        const ce = sclDom.querySelector('ConductingEquipment[name="QA1"]')!;
        const lNodes = Array.from(ce.querySelectorAll(":scope > LNode"));
        const keys = lNodes.map(
          (ln) =>
            `${ln.getAttribute("ldInst")}|${ln.getAttribute(
              "lnClass",
            )}|${ln.getAttribute("lnInst")}|${ln.getAttribute(
              "prefix",
            )}|${ln.getAttribute("iedName")}`,
        );
        const uniqueKeys = new Set(keys);

        expect(keys.length).to.equal(
          uniqueKeys.size,
          `Duplicate LNode keys found: ${keys
            .filter((k, i) => keys.indexOf(k) !== i)
            .join(", ")}`,
        );
      });
    });
  });
});
