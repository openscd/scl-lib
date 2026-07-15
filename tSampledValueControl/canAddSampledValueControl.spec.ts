import { expect } from "vitest";

import { canAddSampledValueControl } from "./canAddSampledValueControl.js";

const doc = `
<SCL>
<IED name="IED1">
    <Services>
        <SMVsc max="3" />
    </Services>
  <AccessPoint name="AP1">
    <Services>
        <SMVsc max="4" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="dataSet1" />
                <DataSet name="dataSet2" />
                <SampledValueControl name="newSampledValueControl_001" datSet="dataSet1" />
                <SampledValueControl name="newSampledValueControl_002" datSet="dataSet1" />
                <SampledValueControl name="newSampledValueControl_004" datSet="dataSet2" />
            </LN0>
            <LN lnClass="MMXU" inst="1">
                <SampledValueControl name="newSampledValueControl_001"/>
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
        <SMVsc max="1" />
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

describe("Utility function check SampledValueControl against Services section", () => {
  it("returns false with orphan LN0", () =>
    expect(canAddSampledValueControl(orphanLn0)).to.be.false);

  it("returns false with missing Services>SMVsc", () =>
    expect(canAddSampledValueControl(ied3ln0)).to.be.false);

  it("picks the limit on AccessPoint if it is available ", () =>
    expect(canAddSampledValueControl(ied1ln0)).to.be.true);

  it("picks the limit on IED if AccessPoint Services>SMVsc is not available ", () =>
    expect(canAddSampledValueControl(ied2ln0)).to.be.true);
});
