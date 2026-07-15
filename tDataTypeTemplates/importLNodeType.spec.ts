import { expect } from "vitest";
import { Insert } from "@openscd/oscd-api";

import { isInsert, isRemove } from "@openscd/oscd-api/utils.js";

import { importLNodeType } from "./importLNodeType.js";
import {
  baseDataTypes,
  emptyBayTemplate,
  competeBayTemplate,
  invalidBayTemplate,
  hardUpdate,
} from "./importLNodeType.testfiles.js";

import { findElement } from "../foundation/helpers.test.js";

const emptyTemplate = findElement(emptyBayTemplate) as XMLDocument;
const completeTemplate = findElement(competeBayTemplate) as XMLDocument;
const invalidTemplate = findElement(invalidBayTemplate) as XMLDocument;
const tctrLNodeType = findElement(
  baseDataTypes,
  'LNodeType[id="Dummy.TCTR"]'
) as Element;
const mmxuLNodeType = findElement(
  baseDataTypes,
  'LNodeType[id="Dummy.MMXU"]'
) as Element;
const tctrHardUpdate = findElement(
  hardUpdate,
  'LNodeType[id="Dummy.TCTR"]'
) as Element;

describe("Function to import LNodeType with its sub data", () => {
  it("is returning an empty string on invalid SCL files", () => {
    const edits = importLNodeType(tctrLNodeType, invalidTemplate);

    expect(edits.length).to.equal(0);
  });

  it("is inserting the LNodeType element itself when missing", () => {
    const edits = importLNodeType(tctrLNodeType, emptyTemplate) as Insert[];

    expect(edits.length).to.equal(6);
    expect((edits[1].node as Element).tagName).to.equal(tctrLNodeType.tagName);
  });

  it("is inserting DataTypeTemplate element when missing", () => {
    const edits = importLNodeType(tctrLNodeType, emptyTemplate) as Insert[];

    expect(edits.length).to.equal(6);
    expect((edits[0].node as Element).tagName).to.equal("DataTypeTemplates");
  });

  it("can deal with structure DOs and DAs", () => {
    const edits = importLNodeType(mmxuLNodeType, completeTemplate);

    expect(edits.length).to.equal(14);
  });

  it("is checking for duplicate data types", () => {
    const edits = importLNodeType(tctrLNodeType, completeTemplate) as Insert[];

    expect(edits.length).to.equal(0);
  });

  it("does not cut out data type from the base project", () => {
    const edits = importLNodeType(mmxuLNodeType, emptyTemplate) as Insert[];

    edits.forEach((edit) => expect(edit.node.isConnected).to.be.false);
  });

  it("insert when not duplicate", () => {
    const edits = importLNodeType(tctrHardUpdate, completeTemplate) as Insert[];

    expect(edits.length).to.equal(1);
  });

  it("allows to overwrite existing LNodeType", () => {
    const edits1 = importLNodeType(tctrHardUpdate, completeTemplate, { overwrite: true }) as Insert[];

    expect(edits1.length).to.equal(2);

    expect(edits1[0]).to.satisfies(isInsert);
    expect(edits1[1]).to.satisfies(isRemove);

    const edits2 = importLNodeType(tctrHardUpdate, completeTemplate, { overwrite: false }) as Insert[];

    expect(edits2.length).to.equal(1);

    expect(edits2[0]).to.satisfies(isInsert);
  });
});
