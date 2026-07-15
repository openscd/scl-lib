import { expect } from "vitest";

import { findElement } from "../foundation/helpers.test.js";
import { subscribedReport } from "./tReportControl.testfiles.js";

import { createReportControl } from "./createReportControl.js";

const defaultReport = `
<ReportControl name="newReportControl_002" buffered="true" rptID="" bufTime="100" confRev="0" />`;

const completeReport = `
<ReportControl name="someName" desc="someDesc" buffered="true" rptID="someRptID" indexed="true" bufTime="200" intgPd="40" confRev="45" ><TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/><OptFields seqNum="true" timeStamp="true" reasonCode="true" dataRef="true" entryID="true" configRef="true" bufOvfl="true" /><RptEnabled max="8" /></ReportControl>`;

const defaultIntgPdReport = `
<ReportControl name="someName" desc="someDesc" buffered="true" rptID="someRptID" indexed="true" bufTime="200" intgPd="1000" confRev="0" ><TrgOps period="true"/></ReportControl>`;

const defaultPeriodReport = `
<ReportControl name="someName" desc="someDesc" buffered="true" rptID="someRptID" indexed="true" bufTime="200" intgPd="342" confRev="0" ><TrgOps period="true"/></ReportControl>`;

describe("ReportControl related functions", () => {
  describe("create ReportControl element", () => {
    const ied = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector("IED")!;

    const ln = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector("LN")!;

    const ln0 = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector("LN0")!;

    const ln02 = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector('IED[name="srcIED"] LN0')!;

    const lDevice = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector('IED[name="srcIED"] LDevice')!;

    const invalidParent = new DOMParser()
      .parseFromString(subscribedReport, "application/xml")
      .querySelector('LDevice[inst="second"]')!;

    describe("with skipped consistency check", () => {
      it("with parent IED adds ReportControl to first LDevices LLN0 ", () => {
        const insert = createReportControl(ied, { skipCheck: true });

        expect(insert).to.exist;
        expect((insert!.parent as Element).tagName).to.equal("LN0");
        expect(insert!.reference as Element).to.not.be.null;
      });

      it("with parent LDevice adds ReportControl to its LN0", () => {
        const insert = createReportControl(lDevice, { skipCheck: true });

        expect(insert).to.exist;
        expect((insert!.parent as Element).tagName).to.equal("LN0");
      });

      it("with parent LN0 adds ReportControl to this LN0", () => {
        const insert = createReportControl(ln0, { skipCheck: true });

        expect(insert).to.exist;
        expect(insert!.parent as Element).to.equal(ln0);
      });

      it("with parent LN adds ReportControl to this LN", () => {
        const insert = createReportControl(ln, { skipCheck: true });

        expect(insert).to.exist;
        expect(insert!.parent as Element).to.equal(ln);
      });

      it("returns null with missing LN0 or LN", () => {
        const insert = createReportControl(invalidParent, { skipCheck: true });

        expect(insert).to.not.exist;
      });

      it("adds required attributes when missing", () => {
        const insert = createReportControl(ln02, { skipCheck: true });
        const expectedReport = findElement(defaultReport, "ReportControl")!;

        expect(insert).to.exist;
        expect(insert!.node.isEqualNode(expectedReport)).to.be.true;
      });

      it("adds all handed attributes", () => {
        const insert = createReportControl(ln02, {
          rpt: {
            name: "someName",
            desc: "someDesc",
            buffered: "true",
            rptID: "someRptID",
            indexed: "true",
            bufTime: "200",
            intgPd: "40",
          },
          trgOps: {
            dchg: "true",
            qchg: "true",
            dupd: "true",
            period: "true",
            gi: "true",
          },
          optFields: {
            seqNum: "true",
            timeStamp: "true",
            reasonCode: "true",
            dataRef: "true",
            entryID: "true",
            configRef: "true",
            bufOvfl: "true",
          },
          confRev: "45",
          instances: "8",
          skipCheck: true,
        });
        const expectedReport = findElement(completeReport, "ReportControl")!;

        expect(insert).to.exist;
        expect(insert!.node.isEqualNode(expectedReport)).to.be.true;
      });

      it("defaults missing intgPd with TrgOps period active", () => {
        const insert = createReportControl(ln02, {
          rpt: {
            name: "someName",
            desc: "someDesc",
            buffered: "true",
            rptID: "someRptID",
            indexed: "true",
            bufTime: "200",
          },
          trgOps: {
            period: "true",
          },
          skipCheck: true,
        });
        const expectedReport = findElement(
          defaultIntgPdReport,
          "ReportControl",
        )!;

        expect(insert).to.exist;
        expect(insert!.node.isEqualNode(expectedReport)).to.be.true;
      });

      it("defaults missing period with existing intgPd ", () => {
        const insert = createReportControl(ln02, {
          rpt: {
            name: "someName",
            desc: "someDesc",
            buffered: "true",
            rptID: "someRptID",
            indexed: "true",
            bufTime: "200",
            intgPd: "342",
          },
          trgOps: { period: "false" },
          skipCheck: true,
        });
        const expectedReport = findElement(
          defaultPeriodReport,
          "ReportControl",
        )!;

        expect(insert).to.exist;
        expect(insert!.node.isEqualNode(expectedReport)).to.be.true;
      });
    });

    describe("with default consistency check", () => {
      it("adds required attributes when missing", () => {
        const insert = createReportControl(ln02);
        const expectedReport = findElement(defaultReport, "ReportControl")!;

        expect(insert).to.exist;
        expect(insert!.node.isEqualNode(expectedReport)).to.be.true;
      });

      it("return null with duplicate name", () =>
        expect(createReportControl(ln02, { rpt: { name: "someReport" } })).to.be
          .null);

      it("return null with invalid datSet reference", () => {
        expect(
          createReportControl(ln02, { rpt: { datSet: "someInvalidDatSet" } }),
        ).to.be.null;
      });

      it("return valid insert edit with valid datSet reference", () => {
        expect(createReportControl(ln02, { rpt: { datSet: "rptDataSet" } })).to
          .not.be.null;
      });

      it("return confRev = 1 with valid datSet reference", () => {
        const insert = createReportControl(ln02, {
          rpt: { datSet: "rptDataSet" },
        });
        const report = insert?.node as Element;

        expect(report.getAttribute("confRev")).to.equal("1");
      });
    });
  });
});
