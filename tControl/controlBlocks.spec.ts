import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { controlBlocks } from "./controlBlocks.js";

const orphan = `<FCDA />`;
const report = `
<LN >
    <DataSet name="data" />
    <ReportControl datSet="data" />
</LN> />`;
const gseControl = `
<LN >
    <DataSet name="data" >
        <FCDA />
    </DataSet>
    <GSEControl datSet="data" />
</LN> />`;
const multiple = `
<LN >
    <DataSet name="data" >
        <FCDA />
    </DataSet>
    <ReportControl datSet="data" />
    <GSEControl datSet="data" />
    <SampledValueControl datSet="data" />
</LN> />`;

describe("Utility function return control blocks for given FCDA/DataSet", () => {
  it("returns empty array for orphan FCDA", () =>
    expect(controlBlocks(findElement(orphan, "FCDA"))).to.be.empty);

  it("returns ReportControl for DataSet", () =>
    expect(controlBlocks(findElement(report, "DataSet")).length).to.equal(1));

  it("returns GSEControl for FCDA", () =>
    expect(controlBlocks(findElement(gseControl, "FCDA")).length).to.equal(1));

  it("returns multiple control blocks for FCDA", () =>
    expect(controlBlocks(findElement(multiple, "FCDA")).length).to.equal(3));
});
