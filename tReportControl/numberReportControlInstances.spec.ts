import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { numberReportControlInstances } from "./numberReportControlInstances.js";

export const scl = `
<SCL version="2007">
<IED name="sinkIED">
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <ReportControl name="someName1" buffered="true" >
                        <RptEnabled max="3"/>
                    </ReportControl>
                    <ReportControl name="someName2"></ReportControl>
                </LN0>
                <LN lnClass="USER">
                    <ReportControl name="someName1" buffered="true" />
                    <ReportControl name="someName2" buffered="false" >
                        <RptEnabled max="2"/>
                    </ReportControl>
                </LN>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
</SCL>`;

const ied = findElement(scl, "IED")!;
const ln0 = findElement(scl, "LN0")!;

describe("Function to get the number of ReportControl instances", () => {
  it("returns ReportControl per root", () =>
    expect(numberReportControlInstances(ln0)).to.deep.equal({
      bufInstances: 3,
      unBufInstances: 1,
    }));

  it("return number of buffered ReportControl blocks", () =>
    expect(numberReportControlInstances(ied)).to.deep.equal({
      bufInstances: 4,
      unBufInstances: 3,
    }));
});
