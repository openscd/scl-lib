import { expect } from "vitest";
import { Remove, SetAttributes } from "@openscd/oscd-api";

import { findElement } from "../foundation/helpers.test.js";

import { withSubscriptionSupervision } from "./dataset.testfiles.js";

import { removeDataSet } from "./removeDataSet.js";

describe("Utility function to remove DataSet element", () => {
  const dataSet = findElement(
    withSubscriptionSupervision,
    "DataSet",
  ) as Element;
  const edits = removeDataSet({ node: dataSet });
  const extRefs = Array.from(
    dataSet.ownerDocument.querySelectorAll(
      'ExtRef[srcCBName="someGse"], ExtRef[srcCBName="someGse2"], ExtRef[srcCBName="someGse3"]',
    ),
  );
  const val = extRefs[0].ownerDocument.querySelector(
    'LN[lnClass="LGOS"][inst="1"] > DOI[name="GoCBRef"] > DAI[name="setSrcRef"] > Val',
  )!;
  const ln = extRefs[0].ownerDocument.querySelector(
    'LN[lnClass="LGOS"][inst="2"]',
  );

  it("returns empty string when remove.node is not DataSet", () =>
    expect(removeDataSet({ node: val })).to.be.empty);

  it("removes DataSet also removes/updates dependant data", () =>
    expect(edits.length).to.equal(10));

  it("including the DataSet itself", () =>
    expect((edits[0] as Remove).node).to.equal(dataSet));

  it("including the external references", () => {
    expect((edits[1] as Remove).node).to.equal(extRefs[0]);
    expect((edits[2] as Remove).node).to.equal(extRefs[1]);
    expect((edits[3] as Remove).node).to.equal(extRefs[3]);
    expect((edits[4] as SetAttributes).element).to.equal(extRefs[2]);
  });

  it("including the subscriber supervision", () => {
    expect((edits[5] as Remove).node).to.equal(val.firstChild);
    expect((edits[6] as Remove).node).to.equal(ln);
  });

  it("including control Block updates", () => {
    expect((edits[7] as SetAttributes).attributes).to.deep.equal({
      datSet: null,
      confRev: "10340",
    });
    expect((edits[8] as SetAttributes).attributes).to.deep.equal({
      datSet: null,
      confRev: "10342",
    });
    expect((edits[9] as SetAttributes).attributes).to.deep.equal({
      datSet: null,
      confRev: "10344",
    });
  });
});
