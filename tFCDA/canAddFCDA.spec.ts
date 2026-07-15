import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { canAddFCDA, maxAttributes } from "./canAddFCDA.js";

const sclBlob = `
<SCL version="2007">
<IED name="ied1">
    <AccessPoint name="someAP">
        <Services>
            <ConfDataSet maxAttributes="6" />
        </Services>
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="3" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="4" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN0>
                <LN lnClass="USER" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="3" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="4" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="6" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied2">
    <Services>
        <ConfDataSet maxAttributes="7" />
    </Services> 
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="3" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="4" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="6" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="7" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN0>
                <LN lnClass="USER" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="3" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="4" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="6" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
<IED name="ied3">
    <AccessPoint name="someAP">
        <Server>
            <LDevice inst="someLDevice" >
                <LN0 lnClass="LLN0" inst="" lnType="someLnType" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN0>
                <LN lnClass="USER" >
                    <DataSet name="someDataSet" >
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="2" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="3" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="4" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="5" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="6" doName="Beh" daName="stVal" fc="ST" />
                        <FCDA ldInst="ldInst" lnClass="PTOC" lnInst="7" doName="Beh" daName="stVal" fc="ST" />
                    </DataSet>
                </LN>
            </LDevice>
        </Server>
    </AccessPoint>
</IED>
</SCL>`;

const apDs1 = findElement(sclBlob, `IED[name="ied1"] LN0 > DataSet`) as Element;
const apDs2 = findElement(sclBlob, `IED[name="ied1"] LN > DataSet`) as Element;
const iedDs1 = findElement(sclBlob, `IED[name="ied2"] LN0>DataSet`) as Element;
const iedDs2 = findElement(sclBlob, `IED[name="ied2"] LN>DataSet`) as Element;
const ds1 = findElement(sclBlob, `IED[name="ied3"] LN0>DataSet`) as Element;
const ds2 = findElement(sclBlob, `IED[name="ied3"] LN>DataSet`) as Element;
const orphan = findElement(
  "<DataSet ><FCDA /></DataSet>",
  `DataSet`,
) as Element;

describe("Utility function to get maximum definable FCDA per DataSet", () => {
  describe("per AccessPoint", () => {
    it("returns maxAttribute definition", () =>
      expect(maxAttributes(apDs1)).to.deep.equal({
        max: 6,
        scope: "AccessPoint",
      }));

    it("returns true if max Attributes per AccessPoint", () =>
      expect(canAddFCDA(apDs1)).to.be.true);

    it("returns max Attributes per AccessPoint", () =>
      expect(canAddFCDA(apDs2)).to.be.false);
  });

  describe("per IED", () => {
    it("returns maxAttribute definition", () =>
      expect(maxAttributes(iedDs1)).to.deep.equal({
        max: 7,
        scope: "IED",
      }));

    it("returns true if maxAttributes > existing FCDA", () =>
      expect(canAddFCDA(iedDs1)).to.be.false);

    it("returns true maxAttributes < existing FCDA", () =>
      expect(canAddFCDA(iedDs2)).to.be.true);
  });

  describe("with missing ConfDataSet maxAttributes definition", () => {
    it("returns maxAttribute definition", () =>
      expect(maxAttributes(ds1)).to.deep.equal({
        max: 3,
        scope: "DataSet",
      }));

    it("always returns false - new FCDA element cannot be added", () => {
      expect(canAddFCDA(ds1)).to.be.false;
      expect(canAddFCDA(ds2)).to.be.false;
    });
  });

  describe("for orphan DataSet elements", () => {
    it("returns maxAttribute definition", () =>
      expect(maxAttributes(orphan)).to.deep.equal({
        max: -1,
        scope: "IED",
      }));

    it("always returns false - new FCDA element cannot be added", () =>
      expect(canAddFCDA(orphan)).to.be.false);
  });
});
