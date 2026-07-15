import { expect } from "vitest";
import { parentTags } from "./parentTags";

describe("Utility function to get parent tags for SCL element", () => {
  it("returns empty array for non SCL child", () =>
    expect(parentTags("NonSCL")).to.be.empty);

  it("returns parent tags for valid SCL tag", () =>
    expect(parentTags("LDevice")).to.deep.equal(["Server"]));
});
