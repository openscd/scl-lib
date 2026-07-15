import { expect } from "vitest";
import { getReference } from "./getReference.js";

describe("getReference", () => {
  it("returns null for invalid SCL tag", () => {
    const scl = new DOMParser().parseFromString(
      `<SCL>
          <Header></Header>
          <IED name="IED"></IED>
          <DataTypeTemplates></DataTypeTemplates>
        </SCL>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "SomeInvalidTag")).to.equal(null);
  });

  it("returns null for tag not included in parent element", () => {
    const scl = new DOMParser().parseFromString(
      `<SCL>
          <Header></Header>
          <IED name="IED"></IED>
          <DataTypeTemplates></DataTypeTemplates>
        </SCL>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "VoltageLevel")).to.equal(null);
  });

  it("returns null for invalid parent element", () => {
    const scl = new DOMParser().parseFromString(
      `SomeInvalidSCL`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "Bay")).to.equal(null);
  });

  it("returns correct reference for LNode element", () => {
    const scl = new DOMParser().parseFromString(
      `<Bay>
          <Private>testprivate</Private>
          <ConductingEquipment name="QA1"></ConductingEquipment>
        </Bay>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "LNode")).to.equal(
      scl.querySelector("ConductingEquipment"),
    );

    const scl2 = new DOMParser().parseFromString(
      `<Bay>
          <Private>testprivate</Private>
          <PowerTransformer name="pTrans"></PowerTransformer>
          <ConductingEquipment name="QA1"></ConductingEquipment>
        </Bay>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl2, "LNode")).to.equal(
      scl2.querySelector("PowerTransformer"),
    );
  });

  it("returns correct reference for Substation element", () => {
    const scl = new DOMParser().parseFromString(
      `<SCL>
          <Header></Header>
          <IED name="IED"></IED>
          <DataTypeTemplates></DataTypeTemplates>
        </SCL>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "Substation")).to.equal(scl.querySelector("IED"));
  });

  it("returns correct reference for VoltageLevel element", () => {
    const scl = new DOMParser().parseFromString(
      `<Substation>
          <Private></Private>
          <LNode></LNode>
        </Substation>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "VoltageLevel")).to.be.null;
  });

  it("returns correct reference for Bay element", () => {
    const scl = new DOMParser().parseFromString(
      `<VoltageLevel>
          <Private></Private>
          <Function></Function>
        </VoltageLevel>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "Bay")).to.equal(scl.querySelector("Function"));
  });

  it("returns correct reference for ConductingEquipment element", () => {
    const scl = new DOMParser().parseFromString(
      `<Bay>
          <Private></Private>
          <ConnectivityNode></ConnectivityNode>
        </Bay>`,
      "application/xml",
    ).documentElement;
    expect(getReference(scl, "ConductingEquipment")).to.equal(
      scl.querySelector("ConnectivityNode"),
    );
  });
});
