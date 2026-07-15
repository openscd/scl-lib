import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { canAddDataSet } from "./canAddDataSet.js";

const sclBlob = `
<SCL version="2007">
<IED name="ied1">
    <AccessPoint name="someAP">
        <Services>
            <ConfDataSet max="6" />
        </Services>
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" />
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied2">
    <Services>
        <ConfDataSet max="7" />
    </Services> 
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" />
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied3">
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" >
                    <DataSet name="someName1" />
                    <DataSet name="someName2" />
                </LN0>
                <LN lnClass="USER" >
                    <DataSet name="someName1" />
                </LN>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
</SCL>`;

const ln01 = findElement(sclBlob, `IED[name="ied1"] LN0`) as Element;
const ln02 = findElement(sclBlob, `IED[name="ied2"] LN0`) as Element;
const accP3 = findElement(sclBlob, `IED[name="ied3"] > AccessPoint`) as Element;
const scl = findElement(sclBlob, `SCL`) as Element;

describe("Utility function to get maximum definable DataSet", () => {
  it("returns max DataSet per AccessPoint", () =>
    expect(canAddDataSet(ln01)).to.be.true);

  it("returns max DataSet per IED", () =>
    expect(canAddDataSet(ln02)).to.be.true);

  it("returns number of existing DataSet with missing max attributes", () =>
    expect(canAddDataSet(accP3)).to.be.false);

  it("returns -1 with invalid parent input", () =>
    expect(canAddDataSet(scl)).to.be.false);
});
