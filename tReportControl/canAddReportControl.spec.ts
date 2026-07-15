import { expect } from "vitest";

import { findElement } from "../foundation/helpers.test.js";
import { canAddReportControl } from "./canAddReportControl.js";

export const scl = `
<SCL version="2007">
<IED name="ied1">
    <AccessPoint name="ap1">
        <Services>
            <ConfReportControl max="6" maxBuf="3" />
        </Services>
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <ReportControl name="someRp" >
                        <RptEnabled max="2" />
                    </ReportControl>
                </LN0>
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
    <AccessPoint name="ap2">
        <Services>
            <ConfReportControl max="3" />
        </Services>
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="">
                    <ReportControl name="someRp" >
                        <RptEnabled max="2" />
                    </ReportControl>
                </LN0>
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
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <ReportControl name="someRp" buffered="true">
                        <RptEnabled max="2"/>
                    </ReportControl>
                </LN0>
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied3">
    <Services>
        <ConfReportControl max="7" maxBuf="3"/>
    </Services> 
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                    <ReportControl name="someRp" buffered="true">
                        <RptEnabled max="2"/>
                    </ReportControl>
                </LN0>
                <LN lnClass="USER" />
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied4">
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

const ap1ln01 = findElement(
    scl,
    `IED[name="ied1"]>AccessPoint[name="ap1"] LN0`,
)! as Element;
const ap2ln02 = findElement(
    scl,
    `IED[name="ied1"]>AccessPoint[name="ap2"] LN0`,
)! as Element;
const ln02 = findElement(scl, `IED[name="ied2"] LN0`)! as Element;
const ln03 = findElement(scl, `IED[name="ied3"] LN0`)! as Element;
const ln04 = findElement(scl, `IED[name="ied4"] LN0`)! as Element;

describe("Function determining whether ReportControl can be created", () => {
    describe("with existing maxBuf attribute", () => {
        it("returns true with one new buf instance below limit of maxBuf", () =>
            expect(canAddReportControl(ap1ln01, { buffered: true })).to.true);

        it("returns true with three new buf instance below limit of maxBuf", () =>
            expect(canAddReportControl(ap1ln01, { buffered: true, newInstances: 3 }))
                .to.true);

        it("returns false new instances exceed limit of maxBuf", () =>
            expect(canAddReportControl(ap1ln01, { buffered: true, newInstances: 10 }))
                .to.false);

        it("returns true with new unbuf instances within limit of max - maxBuf", () =>
            expect(canAddReportControl(ln03, { buffered: false, newInstances: 4 })).to
                .true);

        it("returns true with new unbuf instances exceed limit of max - maxBuf", () =>
            expect(canAddReportControl(ln03, { buffered: false, newInstances: 5 })).to
                .false);
    });

    describe("with missing maxBuf attribute", () => {
        it("returns true with one new buf instance below limit of max", () =>
            expect(canAddReportControl(ap2ln02)).to.true);

        it("returns false new instances exceed limit of max", () =>
            expect(canAddReportControl(ap2ln02, { buffered: true, newInstances: 2 }))
                .to.false);

        it("returns true with new unbuf within limit of max", () =>
            expect(canAddReportControl(ln02, { buffered: false })).to.true);

        it("returns true with five unbuf instances within limit of max", () =>
            expect(canAddReportControl(ln02, { buffered: false, newInstances: 5 })).to
                .true);

        it("returns true with new unbuf instances exceed limit of max", () =>
            expect(canAddReportControl(ln02, { buffered: false, newInstances: 6 })).to
                .false);
    });

    it("returns true with missing max for buf report", () =>
        expect(canAddReportControl(ln04)).to.false);

    it("returns true with missing max for unbuf report", () =>
        expect(canAddReportControl(ln04, { buffered: false })).to.false);
});
