import { expect } from "vitest";
import { getChildren } from "./getChildren.js";

const nonSense = new DOMParser()
  .parseFromString('<NonSense name="e1" />', "application/xml")
  .querySelector("NonSense")!;

const scl = new DOMParser()
  .parseFromString('<SCL name="e1" />', "application/xml")
  .querySelector("SCL")!;

describe("return children for given SCL parent ", () => {
  it("return empty array for non SCL parent", () =>
    expect(getChildren(nonSense)).to.deep.equal([]));

  it("return valid array for SCL parent SCL", () =>
    expect(getChildren(scl)).to.deep.equal([
      "Text",
      "Private",
      "Header",
      "Substation",
      "Communication",
      "IED",
      "DataTypeTemplates",
      "Line",
      "Process",
    ]));
});
