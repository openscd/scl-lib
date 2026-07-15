import { expect } from "chai";

import { Insert, Remove } from "@openscd/oscd-api";

import {
  docWithComplexMmxuTarget,
  newMmxuLNodeTypeWithChanges,
} from "./updateLNodeType.testfiles.js";

import { updateLNodeType } from "./updateLNodeType.js";

describe("updateLnType", () => {
  it("handles complex MMXU update scenario with multiple changes", () => {
    const doc = new DOMParser().parseFromString(
      docWithComplexMmxuTarget,
      "application/xml",
    );

    // Create the new LNodeType with changes (external source)
    const newDoc = new DOMParser().parseFromString(
      newMmxuLNodeTypeWithChanges,
      "application/xml",
    );
    const newLNodeType = newDoc.querySelector('LNodeType[id="MMXU_1"]')!;

    const edits = updateLNodeType(newLNodeType, doc) as (Insert | Remove)[];

    // Expected removals:
    // 1. DOS name="PhV" (entire DO removed from LNodeType)
    // 2. SDS name="ang" in PhPh.phsAB.cVal (ang BDA removed from Vector type)
    // 3. SDS name="ang" in PhPh.phsBC.cVal (ang BDA removed from Vector type)
    // 4-9. 6 SourceRef elements that reference invalid paths
    expect(edits).to.have.lengthOf(15);

    // Check data structure removals
    const removedDataElements = edits.filter(
      (r) =>
        (r.node as Element).tagName === "eTr_6-100:DOS" ||
        (r.node as Element).tagName === "eTr_6-100:SDS" ||
        (r.node as Element).tagName === "eTr_6-100:DAS",
    );
    expect(removedDataElements).to.have.lengthOf(3);

    const removedDataNames = removedDataElements.map((r) =>
      (r.node as Element).getAttribute("name"),
    );
    expect(removedDataNames).to.include("PhV"); // DOS removed
    expect(removedDataNames.filter((name) => name === "ang")).to.have.lengthOf(
      2,
    ); // 2 SDS ang removed

    // Check SourceRef removals
    const removedSourceRefs = edits.filter(
      (r) => (r.node as Element).localName === "SourceRef",
    );
    expect(removedSourceRefs).to.have.lengthOf(6);

    const removedResourceNames = removedSourceRefs.map((r) =>
      (r.node as Element).getAttribute("resourceName"),
    );

    // SourceRefs that should be removed due to PhV removal
    expect(removedResourceNames).to.include("InvalidPhVRef");
    expect(removedResourceNames).to.include("InvalidPhVRef2");
    expect(removedResourceNames).to.include("CrossInvalidPhVRef");

    // SourceRefs that should be removed due to ang removal in PhPh
    expect(removedResourceNames).to.include("InvalidPhPhAngRef");
    expect(removedResourceNames).to.include("InvalidPhPhAngRef2");
    expect(removedResourceNames).to.include("CrossInvalidPhPhAngRef");

    // SourceRefs that should NOT be removed (valid paths)
    expect(removedResourceNames).to.not.include("ValidAPhsAMag");
    expect(removedResourceNames).to.not.include("ValidAPhsAAng");
    expect(removedResourceNames).to.not.include("ValidARes"); // A.res.cVal.mag.f is valid with new LNodeType
    expect(removedResourceNames).to.not.include("ValidPhPhMag");
    expect(removedResourceNames).to.not.include("CrossValidARef");
  });
});
