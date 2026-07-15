import { expect } from "vitest";

import { canAddGSEControl } from "./canAddGSEControl.js";

const doc = `
<SCL>
<IED name="IED1">
    <Services>
        <GOOSE max="3" />
    </Services>
  <AccessPoint name="AP1">
    <Services>
        <GOOSE max="4" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="dataSet1" />
                <DataSet name="dataSet2" />
                <GSEControl name="newGSEControl_001" datSet="dataSet1" />
                <GSEControl name="newGSEControl_002" datSet="dataSet1" />
                <GSEControl name="newGSEControl_004" datSet="dataSet2" />
            </LN0>
            <LN lnClass="MMXU" inst="1">
                <GSEControl name="newGSEControl_001"/>
            </LN>
            <LN lnClass="MMXU" inst="2" />
        </LDevice>
        <LDevice inst="second"/>
        <LDevice inst="third">
            <LN0 lnClass="LLN0" inst=""/>
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED2">
    <Services>
        <GOOSE max="1" />
    </Services>
  <AccessPoint name="AP1">
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="" />
            <LN lnClass="MMXU" inst="1" />
            <LN lnClass="MMXU" inst="2" />
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED3">
  <AccessPoint name="AP1">
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="" />
            <LN lnClass="MMXU" inst="1" />
            <LN lnClass="MMXU" inst="2" />
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
</SCL>`;

const ied1ln0 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED1"] LN0')!;

const ied2ln0 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED2"] LN0')!;

const ied3ln0 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED3"] LN0')!;

const orphanLn0 = new DOMParser()
  .parseFromString(`<LN0 lnClass="LLN0" inst="" />`, "application/xml")
  .querySelector("LN0")!;

describe("Utility function check GSEControl against Services section", () => {
  it("returns false with orphan LN0", () =>
    expect(canAddGSEControl(orphanLn0)).to.be.false);

  it("returns false with missing Services>GOOSE", () =>
    expect(canAddGSEControl(ied3ln0)).to.be.false);

  it("picks the limit on AccessPoint if it is available ", () =>
    expect(canAddGSEControl(ied1ln0)).to.be.true);

  it("picks the limit on IED if AccessPoint Services>GOOSE is not available ", () =>
    expect(canAddGSEControl(ied2ln0)).to.be.true);
});
