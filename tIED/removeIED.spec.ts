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

  it("updates LNode iedName attributes to None as well", () => {
    const edits = removeIED({ node: subscriber1 });

    expect(numberUpdates(edits, "LNode")).to.equal(1);
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
});

describe("Duplicate LNode keys after removing IEDs", () => {
  it("does not remove duplicate LNodes when removeLNodes is false", () => {
    const sclDom = new DOMParser().parseFromString(
      sclDuplicateLNodes,
      "application/xml",
    );
    const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
    const iedB = sclDom.querySelector('IED[name="IED_B"]')!;

    handleEdit(removeIED({ node: iedA }));
    const edits = removeIED({ node: iedB }, { removeLNodes: false });

    expect(numberUpdates(edits, "LNode")).to.equal(2);
    expect(numberRemoves(edits, "LNode")).to.equal(0);
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

  it("updates LNode to iedName None when no duplicate exists", () => {
    const sclDom = new DOMParser().parseFromString(
      sclDuplicateLNodes,
      "application/xml",
    );
    const iedA = sclDom.querySelector('IED[name="IED_A"]')!;

    const edits = removeIED({ node: iedA });
    handleEdit(edits);

    const ce = sclDom.querySelector('ConductingEquipment[name="QA1"]')!;
    const noneLNodes = ce.querySelectorAll(':scope > LNode[iedName="None"]');
    expect(noneLNodes.length).to.equal(2);
  });

  it("removes duplicate LNode instead of updating to None", () => {
    const sclDom = new DOMParser().parseFromString(
      sclDuplicateLNodes,
      "application/xml",
    );
    const iedA = sclDom.querySelector('IED[name="IED_A"]')!;
    const iedB = sclDom.querySelector('IED[name="IED_B"]')!;

    handleEdit(removeIED({ node: iedA }));
    handleEdit(removeIED({ node: iedB }));

    const ce = sclDom.querySelector('ConductingEquipment[name="QA1"]')!;
    const noneLNodes = ce.querySelectorAll(':scope > LNode[iedName="None"]');
    expect(noneLNodes.length).to.equal(2);
  });
});
