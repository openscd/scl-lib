import { expect } from "vitest";

import { EditV2 } from "@openscd/oscd-api";
import { isSetAttributes } from "@openscd/oscd-api/utils.js";

import { handleEdit } from "../foundation/helpers.test.js";

import { scl } from "./updateIED.testfile.js";

import { updateIED } from "./updateIED.js";

function numberUpdates(edits: EditV2[], tag: string): number {
  return edits.filter((edit) => isSetAttributes(edit) && edit.element.tagName === tag)
    .length;
}

const pub = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="Pub"]')!;

const publi = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="Publi"]')!;

const client = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="Client"]')!;

const substation = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector("Substation")!;

describe("Function to an update the IED name attributes and its referenced elements", () => {
  it("returns empty array with non IED update", () =>
    expect(updateIED({ element: substation, attributes: {} }).length).to.equal(
      0,
    ));

  it("returns empty array with missing old IED name", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const publi = sclDom.querySelector('IED[name="Publi"]')!;
    publi.removeAttribute("name");

    expect(
      updateIED({ element: publi, attributes: { name: "newIedName" } }).length,
    ).to.equal(0);
  });

  it("returns no additional edits when name attribute is not updated", () =>
    expect(
      updateIED({ element: pub, attributes: { desc: "newDesc" } }).length,
    ).to.equal(1));

  it("updates LNode iedName attributes as well", () => {
    const edits = updateIED({ element: pub, attributes: { name: "newPub" } });

    expect(numberUpdates(edits, "LNode")).to.equal(2);
  });

  it("updates ConnectedAP iedName attributes as well", () => {
    const edits = updateIED({ element: pub, attributes: { name: "newPub" } });

    expect(numberUpdates(edits, "ConnectedAP")).to.equal(1);
  });

  it("updates ExtRef iedName attributes as well", () => {
    const edits = updateIED({ element: pub, attributes: { name: "newPub" } });

    expect(numberUpdates(edits, "ExtRef")).to.equal(8);
  });

  it("updates KDC iedName attributes as well", () => {
    const edits = updateIED({ element: pub, attributes: { name: "newPub" } });

    expect(numberUpdates(edits, "KDC")).to.equal(1);
  });

  it("updates Association iedName attributes as well", () => {
    const edits = updateIED({ element: publi, attributes: { name: "newPub" } });

    expect(numberUpdates(edits, "Association")).to.equal(1);
  });

  it("updates ClientLN iedName attributes as well", () => {
    const edits = updateIED({
      element: client,
      attributes: { name: "newIED" },
    });

    expect(numberUpdates(edits, "ClientLN")).to.equal(2);
  });

  it("updates IEDName content as well", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const subscriber1 = sclDom.querySelector('IED[name="Subscriber1"]')!;

    const before = Array.from(sclDom.querySelectorAll("IEDName")).filter(
      (iedName) => iedName.textContent === "newIedName",
    );
    expect(before.length).to.equal(0);

    const edits = updateIED({
      element: subscriber1,
      attributes: { name: "newIedName" },
    });

    handleEdit(edits);

    const after = Array.from(sclDom.querySelectorAll("IEDName")).filter(
      (iedName) => iedName.textContent === "newIedName",
    );
    expect(after.length).to.equal(8);
  });

  it("updates LGOS/LSVS object reference", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const publi = sclDom.querySelector('IED[name="Publi"]')!;

    const before = Array.from(
      sclDom.querySelectorAll('LN[lnClass="LGOS"] Val, LN[lnClass="LSVS"] Val'),
    ).filter((iedName) => iedName.textContent?.startsWith("newIedName"));
    expect(before.length).to.equal(0);

    const edits = updateIED({
      element: publi,
      attributes: { name: "newIedName" },
    });

    handleEdit(edits);

    const after = Array.from(
      sclDom.querySelectorAll('LN[lnClass="LGOS"] Val, LN[lnClass="LSVS"] Val'),
    ).filter((iedName) => iedName.textContent?.startsWith("newIedName"));
    expect(after.length).to.equal(4);
  });

  it("updates object references without checking permissions", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const sub2 = sclDom.querySelector('IED[name="Subscriber2"]')!;

    const edits = updateIED({
      element: sub2,
      attributes: { name: "newIedName" },
    });

    handleEdit(edits);

    const after = Array.from(
      sclDom.querySelectorAll(
        'DOI[name^="InRef"] > DAI[name="setSrcRef"] > Val',
      ),
    ).filter((val) => val.textContent?.startsWith("newIedName"));

    expect(after.length).to.equal(5);
  });

  it("updates object references and checks permissions", () => {
    const sclDom = new DOMParser().parseFromString(scl, "application/xml");
    const sub2 = sclDom.querySelector('IED[name="Subscriber2"]')!;

    const edits = updateIED(
      {
        element: sub2,
        attributes: { name: "newIedName" },
      },
      true,
    );

    handleEdit(edits);

    const after = Array.from(
      sclDom.querySelectorAll(
        'DOI[name^="InRef"] > DAI[name="setSrcRef"] > Val',
      ),
    ).filter((val) => val.textContent?.startsWith("newIedName"));

    expect(after.length).to.equal(4);
  });
});
