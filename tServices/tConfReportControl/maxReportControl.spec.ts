import { expect } from "chai";

import { findElement } from "../../foundation/helpers.test.js";
import { maxReportControl } from "./maxReportControl.js";

export const scl = `
<SCL version="2007">
<IED name="ied1">
    <AccessPoint name="someAP">
        <Services>
            <ConfReportControl max="6" maxBuf="3" />
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
        <ConfReportControl max="7" />
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
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" />
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
</SCL>`;

const ln01 = findElement(scl, `IED[name="ied1"] LN0`)! as Element;
const ln02 = findElement(scl, `IED[name="ied2"] LN0`)! as Element;
const ln03 = findElement(scl, `IED[name="ied3"] LN0`)! as Element;
const ied = findElement(scl, `SCL`)! as Element;

describe("Function to get maximum definable ReportControl", () => {
  it("returns max buffered ReportControl per AccessPoint", () =>
    expect(maxReportControl(ln01)).to.deep.equal({ max: 6, maxBuf: 3 }));

  it("returns max buffered ReportControl per IED", () =>
    expect(maxReportControl(ln02)).to.deep.equal({ max: 7, maxBuf: -1 }));

  it("returns -1 with missing max attributes", () =>
    expect(maxReportControl(ln03)).to.deep.equal({ max: -1, maxBuf: -1 }));

  it("returns -1 with invalid parent input", () =>
    expect(maxReportControl(ied)).to.deep.equal({ max: -1, maxBuf: -1 }));
});
