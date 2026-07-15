import { expect } from "vitest";

import { isSetAttributes } from "@openscd/oscd-api/utils.js";

import { updateDatSet } from "./updateDatSet.js";

const ied = new DOMParser()
  .parseFromString(`<IED name="IED" /> `, "application/xml")
  .querySelector("IED")!;

const multipleDataSetUse = new DOMParser()
  .parseFromString(
    `<Parent>
        <DataSet name="dataSetName" />
        <GSEControl name="gse1" datSet="dataSetName" />
        <GSEControl name="gse2" datSet="dataSetName" />
    </Parent>`,
    "application/xml",
  )
  .querySelector("GSEControl")!;

const gseControl = new DOMParser()
  .parseFromString(
    `<Parent>
        <DataSet name="dataSetName" />
        <GSEControl name="gse1" datSet="dataSetName" />
    </Parent>`,
    "application/xml",
  )
  .querySelector("GSEControl")!;

const orphanReportControl = new DOMParser()
  .parseFromString(
    `<ReportControl name="rpControl" datSet="dataSetName" />`,
    "application/xml",
  )
  .querySelector("ReportControl")!;

const missingDatSet = new DOMParser()
  .parseFromString(
    `<Parent>
        <SampledValueControl name="smv" datSet="dataSetName" />
    </Parent>`,
    "application/xml",
  )
  .querySelector("SampledValueControl")!;

describe("Utility function updating tControl datSet attribute", () => {
  it("return empty edit array when element is no control block", () =>
    expect(updateDatSet({ element: ied, attributes: { datSet: "newDatSet" } }))
      .to.be.null);

  it("return empty edit array control block is orphan", () =>
    expect(
      updateDatSet({
        element: orphanReportControl,
        attributes: { datSet: "newDatSetName" },
      }),
    ).to.be.null);

  it("return empty edit array with missing DataSet element", () =>
    expect(
      updateDatSet({
        element: missingDatSet,
        attributes: { datSet: "newDatSetName" },
      }),
    ).to.be.null);

  it("return empty edit array DataSet in used by multiple control blocks", () =>
    expect(
      updateDatSet({
        element: multipleDataSetUse,
        attributes: { datSet: "newDatSetName" },
      }),
    ).to.be.null);

  it("return DataSet.name update edit for control block element datSet update", () => {
    const element = gseControl;
    const attributes = { datSet: "newDataSetName" };
    const update = updateDatSet({ element, attributes });

    expect(update).to.satisfy(isSetAttributes);
    expect(update!.element.tagName).to.equal("DataSet");
    expect(update!.attributes).to.deep.equal({
      name: "newDataSetName",
    });
  });
});
