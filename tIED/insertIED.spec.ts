import { expect } from "vitest";

import { Insert, SetAttributes } from "@openscd/oscd-api";
import { handleEdit } from "../foundation/helpers.test.js";

import { insertIed } from "./insertIED.js";

function findEdit(
  edits: Insert[],
  type: "parent" | "node",
  node: Node,
): Insert | undefined {
  return edits.find(
    (edit) =>
      (type === "parent" && edit.parent === node) ||
      (type === "node" && edit.node === node),
  );
}

function numberInserts(
  edits: Insert[],
  type: "parent" | "node",
  tag: string,
): number {
  return edits.filter(
    (edit) =>
      (type === "parent" && (edit.parent as Element).tagName === tag) ||
      (type === "node" && (edit.node as Element).tagName === tag),
  ).length;
}

function findElements(scl: Element, tag: string): Element[] {
  return Array.from(scl.querySelectorAll(tag));
}

const emptyScl = (
  await fetch("tIED/insertIED/emptyproject.scd")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector("SCL")!;

const multipleIEDs = (
  await fetch("tIED/insertIED/multipleieds.scd")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector("SCL")!;

const validIed = (
  await fetch("tIED/insertIED/valid.iid")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector(':root > IED[name="TestImportIED"]')!;

const validWithMultipleConnAp = (
  await fetch("tIED/insertIED/validWithMultiSubnets.iid")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector(':root > IED[name="TestImportIED"]')!;

const duplicateIED = (
  await fetch("tIED/insertIED/duplicate.iid")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector(':root > IED[name="IED3"]')!;

const incompleteIED = (
  await fetch("tIED/insertIED/incomplete.iid")
    .then((response) => response.text())
    .then((str) => new DOMParser().parseFromString(str, "application/xml"))
).querySelector(':root > IED[name="incompleteIED"]')!;

describe("Function to an importIED and its referenced elements", () => {
  it("return empty string with invalid inputs", () => {
    expect(insertIed(validIed, validIed).length).to.equal(0);
    expect(insertIed(emptyScl, emptyScl).length).to.equal(0);
  });

  it("returns empty string with duplicate IED.name", () =>
    expect(insertIed(multipleIEDs, duplicateIED).length).to.equal(0));

  it("allows to insert incomplete IEDs", () =>
    expect(insertIed(multipleIEDs, incompleteIED).length).to.equal(1));

  it("passes on the IED element to the project", async () => {
    const imports = insertIed(emptyScl, validIed);
    expect(findEdit(imports, "node", validIed)).to.not.be.undefined;
  });

  it("adds data type templates elements", async () => {
    const emptyScl = (
      await fetch("tIED/insertIED/emptyproject.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const imports = insertIed(emptyScl, validIed);
    handleEdit(imports);

    expect(findElements(emptyScl, "DataTypeTemplates").length).to.equal(1);
    expect(findElements(emptyScl, "LNodeType").length).to.equal(5); // only referenced lnType
    expect(findElements(emptyScl, "DOType").length).to.equal(12); // only referenced do
    expect(findElements(emptyScl, "DAType").length).to.equal(5); // only referenced da
    expect(findElements(emptyScl, "EnumType").length).to.equal(4); // only referenced enumType
  });

  it("adds all missing ConnectedAP and SubNetwork", async () => {
    const emptyScl = (
      await fetch("tIED/insertIED/emptyproject.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const imports = insertIed(emptyScl, validWithMultipleConnAp);
    handleEdit(imports);

    expect(findElements(emptyScl, "Communication").length).to.equal(1);
    expect(findElements(emptyScl, "SubNetwork").length).to.equal(2);
    expect(findElements(emptyScl, "ConnectedAP").length).to.equal(4);
  });

  it("only adds ConnectedAP and SubNetwork if not already present", async () => {
    const emptyScl = (
      await fetch("tIED/insertIED/emptyproject.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    // try to import the same IED twice
    for (let count = 2; count--;) {
      const multipleIEDs = (
        await fetch("tIED/insertIED/multipleieds.scd")
          .then((response) => response.text())
          .then((str) =>
            new DOMParser().parseFromString(str, "application/xml"),
          )
      ).querySelector("SCL")!;

      const ied = multipleIEDs.querySelector('IED[name="IED3"]') as Element;

      const imports = insertIed(emptyScl, ied);
      handleEdit(imports);

      expect(findElements(emptyScl, "Communication").length).to.equal(1);
      expect(findElements(emptyScl, "SubNetwork").length).to.equal(1);
      expect(findElements(emptyScl, "ConnectedAP").length).to.equal(1);
    }
  });

  it("preserves SubNetwork children", async () => {
    const emptyScl = (
      await fetch("tIED/insertIED/emptyproject.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const multipleIEDs = (
      await fetch("tIED/insertIED/multipleieds.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const ied = multipleIEDs.querySelector('IED[name="IED3"]') as Element;

    const imports = insertIed(emptyScl, ied);
    handleEdit(imports);

    expect(findElements(emptyScl, "Text").length).to.equal(1);
    expect(findElements(emptyScl, "BitRate").length).to.equal(1);
  });

  it("with addCommunicationSection set to false does not add communication elements", async () => {
    const imports = insertIed(emptyScl, validIed, {
      addCommunicationSection: false,
    });
    expect(numberInserts(imports, "node", "Communication")).to.equal(0);
    expect(numberInserts(imports, "node", "SubNetwork")).to.equal(0);
    expect(numberInserts(imports, "node", "ConnectedAP")).to.equal(0);
  });

  it("skips importing isEqualNode data type template objects", async () => {
    const imports = insertIed(multipleIEDs, validIed);

    expect(numberInserts(imports, "node", "DataTypeTemplates")).to.equal(0);
    expect(numberInserts(imports, "node", "LNodeType")).to.equal(4); // only !isEqualNode
    expect(numberInserts(imports, "node", "DOType")).to.equal(3); // only !isEqualNode
    expect(numberInserts(imports, "node", "DAType")).to.equal(2); // only !isEqualNode
    expect(numberInserts(imports, "node", "EnumType")).to.equal(1); // only !isEqualNode
  });

  it("skips existing SubNetwork element", async () => {
    const multipleIEDs = (
      await fetch("tIED/insertIED/multipleieds.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const imports = insertIed(multipleIEDs, validWithMultipleConnAp);
    handleEdit(imports);

    expect(findElements(multipleIEDs, "Communication").length).to.equal(1);
    expect(findElements(multipleIEDs, "SubNetwork").length).to.equal(4);
    expect(findElements(multipleIEDs, "ConnectedAP").length).to.equal(7);
  });

  it("make sure to follow the schema definitions sequence", async () => {
    const scl = (
      await fetch("tIED/insertIED/multipleieds.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const validIed = (
      await fetch("tIED/insertIED/valid.iid")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector(':root > IED[name="TestImportIED"]')!;

    const imports = insertIed(scl, validIed);
    handleEdit(imports);

    expect(scl.querySelector("DataTypeTemplates + Communication")).to.be.null;
    expect(scl.querySelector("IED + Communication")).to.be.null;
    expect(scl.querySelector("LNodeType + DAType")).to.be.null;
    expect(scl.querySelector("LNodeType + EnumType")).to.be.null;
    expect(scl.querySelector("DOType + LNodeType")).to.be.null;
    expect(scl.querySelector("DAType + LNodeType")).to.be.null;
    expect(scl.querySelector("EnumType + LNodeType")).to.be.null;
    expect(scl.querySelector("DOType + EnumType")).to.be.null;
    expect(scl.querySelector("EnumType + DOType")).to.be.null;
    expect(scl.querySelector("EnumType + DAType")).to.be.null;
  });

  it("make sure to follow the schema definitions sequence with missing references", async () => {
    const scl = (
      await fetch("tIED/insertIED/emptyproject.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const validIed = (
      await fetch("tIED/insertIED/valid.iid")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector(':root > IED[name="TestImportIED"]')!;

    const imports = insertIed(scl, validIed);
    handleEdit(imports);

    expect(scl.querySelector("DataTypeTemplates + Communication")).to.be.null;
    expect(scl.querySelector("IED + Communication")).to.be.null;
    expect(scl.querySelector("LNodeType + DAType")).to.be.null;
    expect(scl.querySelector("LNodeType + EnumType")).to.be.null;
    expect(scl.querySelector("DOType + LNodeType")).to.be.null;
    expect(scl.querySelector("DAType + LNodeType")).to.be.null;
    expect(scl.querySelector("EnumType + LNodeType")).to.be.null;
    expect(scl.querySelector("DOType + EnumType")).to.be.null;
    expect(scl.querySelector("EnumType + DOType")).to.be.null;
    expect(scl.querySelector("EnumType + DAType")).to.be.null;
  });

  it("make sure lnType and type reference are not broken", async () => {
    const scl1 = (
      await fetch("tIED/insertIED/multipleieds.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const validIed1 = (
      await fetch("tIED/insertIED/valid.iid")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector(':root > IED[name="TestImportIED"]')!;

    const imports = insertIed(scl1, validIed1);
    handleEdit(imports);

    const brokenType = Array.from(
      scl1.querySelectorAll("DO, SDO, DA, BDA, LN, LN0 "),
    )
      .filter(
        (elem) => elem.hasAttribute("type") || elem.hasAttribute("lnType"),
      )
      .map((elem) => {
        if (elem.tagName === "LN" || elem.tagName === "LN0")
          return elem.getAttribute("lnType");
        return elem.getAttribute("type");
      })
      .filter(
        (type) =>
          scl1.querySelector(
            `LNodeType[id="${type}"], DOType[id="${type}"], DAType[id="${type}"], EnumType[id="${type}"]`,
          ) === null,
      );

    expect(brokenType.length).to.equal(0);
  });

  it("make sure no orphan data types are generated", async () => {
    const scl2 = (
      await fetch("tIED/insertIED/multipleieds.scd")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector("SCL")!;

    const validIed2 = (
      await fetch("tIED/insertIED/valid.iid")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"))
    ).querySelector(':root > IED[name="TestImportIED"]')!;

    const imports = insertIed(scl2, validIed2);
    handleEdit(imports);

    const orphanTypes = Array.from(
      scl2.querySelectorAll("LNodeType, DOType, DAType, EnumType"),
    )
      .map((type) => type.getAttribute("id"))
      .filter(
        (id) =>
          scl2.querySelector(
            `LN[lnType="${id}"], LN0[lnType="${id}"], DO[type="${id}"], SDO[type="${id}"], DA[type="${id}"], BDA[type="${id}"]`,
          ) === null,
      );

    expect(orphanTypes.length).to.equal(0);
  });

  it("Always provides unique names for LNodeTypes", async () => {
    const multipleIedDocument = await fetch("tIED/insertIED/multipleieds.scd")
      .then((response) => response.text())
      .then((str) => new DOMParser().parseFromString(str, "application/xml"));

    // On the second loop an incorrect datatype template name can readily be created
    // when we prepend the IED name to the datatype template id.
    // This regression test checks that this doesn't occur. We must remember to
    // rename the IED otherwise with duplicates this test wouldn't pass the preconditions.
    for (let count = 0; count < 2; count++) {
      const newIedDocument = await fetch("tIED/insertIED/valid.iid")
        .then((response) => response.text())
        .then((str) => new DOMParser().parseFromString(str, "application/xml"));
      const newIed = newIedDocument.querySelector("IED")!;

      const lNode = newIedDocument.querySelector('LNodeType[id="Dummy.LLN0"]')!;
      const differenceMaker = newIedDocument.createComment(
        `This will make things different_${count}`,
      );

      lNode.appendChild(differenceMaker);

      const imports = insertIed(multipleIedDocument.documentElement, newIed);
      handleEdit(imports);

      const importedIed = multipleIedDocument.querySelector(
        'IED[name="TestImportIED"]',
      )!;
      const renameEdit: SetAttributes = {
        element: importedIed,
        attributes: { name: `TestImportIED_${count}` },
      };
      handleEdit(renameEdit);
    }

    // check for duplicates
    const ids = Array.from(
      multipleIedDocument.querySelectorAll("LNodeType"),
    ).map((type) => type.getAttribute("id"));
    const uniqueIds = [...new Set(ids)];

    expect(ids.length).to.equal(uniqueIds.length);
  });
});
