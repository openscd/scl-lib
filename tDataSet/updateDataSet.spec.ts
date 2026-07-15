import { expect } from "vitest";

import { updateDataSet } from "../tDataSet/updateDataSet.js";

function findElement(str: string, selector: string): Element {
  return new DOMParser()
    .parseFromString(str, "application/xml")
    .querySelector(selector)!;
}

export const orphanDataSet = `<DataSet name="someName"></DataSet>`;

export const validDataSet = `<LN0 lnClass="LLN0" inst="">
    <DataSet name="someName"></DataSet>
    <ReportControl name="rp1" datSet="someName"/>
    <GSEControl name="g1" datSet="someName"/>
    <GSEControl name="g2" datSet="someOtherName"/>
    <SampledValueControl name="sv1" datSet="someName"/>
</LN0>`;

describe("Utility function for DataSet element", () => {
  it("returns empty array non DataSet update", () => {
    const dataSet = findElement(validDataSet, "GSEControl");
    const update = { element: dataSet, attributes: {} };

    expect(updateDataSet(update)).to.deep.equal([]);
  });

  it("returns empty array for orphans DataSet", () => {
    const dataSet = findElement(orphanDataSet, "DataSet");
    const update = { element: dataSet, attributes: { name: "someNewName" } };

    expect(updateDataSet(update)).to.deep.equal([]);
  });

  it("returns only SetAttributes edit for DataSet when name is missing", () => {
    const dataSet = findElement(validDataSet, "DataSet");
    const update = { element: dataSet, attributes: { desc: "someDesc" } };

    const updateEdit = updateDataSet(update);
    expect(updateEdit.length).to.equal(1);
    expect(updateEdit[0].element.tagName).to.equal("DataSet");
    expect(updateEdit[0].attributes).to.deep.equal({ desc: "someDesc" });
  });

  it("return DataSet update and update for each referenced control block", () => {
    const dataSet = findElement(validDataSet, "DataSet");
    const update = {
      element: dataSet,
      attributes: {
        name: "someNewName",
        desc: "someDesc",
      },
    };

    const updateEdits = updateDataSet(update);

    expect(updateEdits.length).to.equal(4);

    expect(updateEdits[0].element.tagName).to.equal("DataSet");
    expect(updateEdits[0].attributes).to.deep.equal({
      name: "someNewName",
      desc: "someDesc",
    });

    updateEdits.shift();
    for (const edit of updateEdits) {
      expect(edit.element.tagName).to.be.oneOf([
        "ReportControl",
        "GSEControl",
        "SampledValueControl",
      ]);
      expect(edit.attributes).to.deep.equal({
        datSet: "someNewName",
        confRev: "1",
      });
    }
  });
});
