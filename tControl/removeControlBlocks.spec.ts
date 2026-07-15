import { expect } from "vitest";
import { Remove } from "../foundation/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import {
  ed2Subscription,
  orphanControlBlock,
} from "./removeControlBlock.testfiles.js";

import { removeControlBlock } from "./removeControlBlock.js";

describe("Utility function to remove control blocks", () => {
  const ctrlBlock6 = findElement(
    ed2Subscription,
    'SampledValueControl[name="someSmv2"]',
  ) as Element;
  const ctrlBlock5 = findElement(
    ed2Subscription,
    'GSEControl[name="someGse5"]',
  ) as Element;
  const ctrlBlock4 = findElement(
    ed2Subscription,
    'GSEControl[name="someGse4"]',
  ) as Element;
  const ctrlBlock3 = findElement(
    ed2Subscription,
    'GSEControl[name="someGse3"]',
  ) as Element;
  const ctrlBlock2 = findElement(
    ed2Subscription,
    'GSEControl[name="someGse2"]',
  ) as Element;
  const ctrlBlock1 = findElement(
    ed2Subscription,
    'SampledValueControl[name="someSmv"]',
  ) as Element;
  const orphanCtrlBlock = findElement(
    orphanControlBlock,
    "GSEControl",
  ) as Element;
  const someExtRef = findElement(ed2Subscription, "ExtRef") as Element;

  it("return empty array with invalid control block tagName", () =>
    expect(removeControlBlock({ node: someExtRef })).to.be.empty);

  it("return empty array on orphan inputs", () => {
    const edits = removeControlBlock({ node: orphanCtrlBlock });

    expect((edits[0] as Remove).node).equals(orphanCtrlBlock);
  });

  it("it only remove the control block without referenced DataSet", () => {
    const edits = removeControlBlock({ node: ctrlBlock4 });

    expect(edits.length).equals(1);
    expect((edits[0] as Remove).node).equal(ctrlBlock4);
  });

  it("it only remove the control with multi used DataSet", () => {
    const edits = removeControlBlock({ node: ctrlBlock3 });

    expect(edits.length).equals(1);
    expect((edits[0] as Remove).node).equal(ctrlBlock3);
  });

  it("it removes subscribed data in case of multi use DataSet", () => {
    const edits = removeControlBlock({ node: ctrlBlock2 });
    const extRef = ctrlBlock2.ownerDocument.querySelector(
      'ExtRef[srcCBName="someGse2"]',
    );

    expect(edits.length).equals(3);
    expect((edits[1] as Remove).node).equal(extRef);
  });

  it("it removes subscribed data form single use DataSet", () => {
    const edits = removeControlBlock({ node: ctrlBlock1 });
    const dataSet = ctrlBlock1.ownerDocument.querySelector(
      'DataSet[name="smvDataSet"]',
    );

    expect(edits.length).equals(6);
    expect((edits[1] as Remove).node).equal(dataSet);
    expect(((edits[2] as Remove).node as Element).tagName).equal("ExtRef");
    expect(((edits[3] as Remove).node as Element).tagName).equal("ExtRef");
    expect(((edits[4] as Remove).node as Element).tagName).equal("Inputs");
  });

  it("it removes GSE referenced element", () => {
    const edits = removeControlBlock({ node: ctrlBlock5 });
    const extRef = ctrlBlock5.ownerDocument.querySelector(
      'ExtRef[srcCBName="someGse5"]',
    );
    const gse = ctrlBlock5.ownerDocument.querySelector("GSE");

    expect(edits.length).equals(3);
    expect((edits[1] as Remove).node).equal(extRef);
    expect((edits[2] as Remove).node).equal(gse);
  });

  it("it removes SMV referenced element", () => {
    const edits = removeControlBlock({ node: ctrlBlock6 });
    const smv = ctrlBlock6.ownerDocument.querySelector("SMV");

    expect(edits.length).equals(2);
    expect((edits[1] as Remove).node).equal(smv);
  });
});
