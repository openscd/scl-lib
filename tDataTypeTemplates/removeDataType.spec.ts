import { expect } from "chai";
import { findElement } from "../foundation/helpers.test.js";

import { invalidScl, mmxu } from "./removeDataType.testfiles.js";
import { removeDataType } from "./removeDataType.js";

const invalidLNodeType = findElement(invalidScl, "LNodeType") as XMLDocument;
const doType = findElement(mmxu, "DOType") as XMLDocument;
const lNodeType = findElement(mmxu, "LNodeType") as XMLDocument;

describe("Function to recursively remove data types ", () => {
  it("returns empty array with SCL files", () => {
    expect(removeDataType({ node: invalidLNodeType }).length).equals(0);
  });

  it("does not remove linked data types per default", () => {
    const removes = removeDataType({ node: doType });
    expect(removes.length).equals(0);
  });

  it("removes linked data types with force option set", () => {
    const removes = removeDataType({ node: doType }, { force: true });

    expect(removes.length).equals(6);
    expect(removes[0].node).equal(doType);

    removes.forEach(
      (remove) => expect(remove.node.parentElement).to.not.be.null,
    );
  });

  it("does not remove linked data types with force option set", () => {
    const removes = removeDataType({ node: lNodeType });

    expect(removes.length).equals(15);
    expect(removes[0].node).equal(lNodeType);

    removes.forEach(
      (remove) => expect(remove.node.parentElement).to.not.be.null,
    );
  });
});
