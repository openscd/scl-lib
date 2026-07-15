import { expect } from "vitest";

import { SetAttributes } from "@openscd/oscd-api";
import { isRemove, isSetAttributes } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import {
  multipleConnectionsEd1,
  multipleConnectionsEd2,
  orphanFCDA,
  singleConnection,
} from "./removeFCDA.testfiles.js";
import { removeFCDA } from "./removeFCDA.js";

describe("Utility functions to remove FCDA element", () => {
  it("returns empty array with remove.node not being FCDA", () => {
    const nonFCDA = findElement(singleConnection, "DataSet") as Element;

    expect(removeFCDA({ node: nonFCDA })).to.be.empty;
  });

  it("returns ", () => {
    const orphan = findElement(orphanFCDA, "FCDA") as Element;

    expect(removeFCDA({ node: orphan })[0]).to.deep.equal({
      node: orphan,
    });
  });

  it("without subscription only removes FCDA", () => {
    const fcda = findElement(
      singleConnection,
      'DataSet[name="someDataSet2"] FCDA',
    ) as Element;

    expect(removeFCDA({ node: fcda })[0]).to.deep.equal({
      node: fcda,
    });
  });

  it("removes Ed1 subscription if any found", () => {
    const fcda = findElement(singleConnection, "FCDA") as Element;

    const edits = removeFCDA({ node: fcda });
    expect(edits.length).to.equal(3);
    expect(edits[1]).to.satisfies(isRemove);
    expect(edits[2]).to.satisfies(isRemove);
  });

  it("removes multiple Ed1 subscriptions if any found", () => {
    const fcda = findElement(multipleConnectionsEd1, "FCDA") as Element;

    const edits = removeFCDA({ node: fcda });
    expect(edits.length).to.equal(4);
    expect(edits[1]).to.satisfies(isRemove);
    expect(edits[2]).to.satisfies(isRemove);
    expect(edits[3]).to.satisfies(isSetAttributes);
  });

  it("removes Ed2 subscriptions if any found", () => {
    const fcda = findElement(
      multipleConnectionsEd2,
      'DataSet[name="someDataSet2"] FCDA',
    ) as Element;

    const edits = removeFCDA({ node: fcda });
    expect(edits.length).to.equal(2);
    expect(edits[0]).to.satisfies(isRemove);
    expect(edits[1]).to.satisfies(isSetAttributes);
    expect((edits[1] as SetAttributes).attributes).to.deep.equal({
      iedName: null,
      ldInst: null,
      prefix: null,
      lnClass: null,
      lnInst: null,
      doName: null,
      daName: null,
      srcLDInst: null,
      srcPrefix: null,
      srcLNClass: null,
      srcLNInst: null,
      srcCBName: null,
    });
  });
});
