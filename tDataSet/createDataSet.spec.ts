import { expect } from "vitest";

import { createDataSet } from "./createDataSet.js";

const doc = `
<SCL>
<IED name="IED1">
  <AccessPoint name="AP1">
    <Services>
        <ConfDataSet max="4" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="newDataSet_001" />
                <DataSet name="newDataSet_002" />
            </LN0>
            <LN lnClass="MMXU" inst="1">
                <DataSet name="newDataSet_001"/>
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
    <ConfDataSet max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <GOOSE max="2" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="dataSet"/>
            </LN0>
        </LDevice>
    </Server>
  </AccessPoint>
  <AccessPoint name="AP2">
    <ServerAp name="AP1" />
  </AccessPoint>
</IED>
<IED name="IED3">
  <Services>
    <ConfDataSet max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <ConfDataSet />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="dataSet1" />
                <DataSet name="dataSet2" />
                <DataSet name="dataSet3" />
            </LN0>
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED4">
  <Services>
    <ConfDataSet max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <ConfDataSet max="2" />
    </Services>
    <Server>
        <LDevice >
            <LN0 lnClass="LLN0" inst="">
                <DataSet name="dataSet"/>
            </LN0>
        </LDevice>
    </Server>
  </AccessPoint>
  <AccessPoint name="AP2">
    <ServerAp name="AP1" />
  </AccessPoint>
</IED>
</SCL>`;

const ied = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED1"]')!;

const ln = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector("LN")!;

const ln02 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED3"] > AccessPoint[name="AP1"] LN0')!;

const invalidParent = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('LDevice[inst="second"]')!;

describe("Utility function to create schema valid DataSet insert edit", () => {
  it("returns empty array with missing LN0", () => {
    const insert = createDataSet(invalidParent);
    expect(insert).to.be.null;
  });

  it("returns empty array when exceeding ConfDataSet.max ", () => {
    const insert = createDataSet(ln02);
    expect(insert).to.be.null;
  });

  it("returns empty array when name is duplicate ", () => {
    const insert = createDataSet(ln, {
      attributes: { name: "newDataSet_001" },
    });
    expect(insert).to.be.null;
  });

  it("return insert edit DataSet to first LDevice", () => {
    const insert = createDataSet(ied);

    expect((insert!.node as Element).getAttribute("name")).to.equal(
      "newDataSet_003",
    );
    expect((insert!.parent as Element).tagName).to.equal("LN0");
    expect(insert!.reference as Element).to.not.be.null;
  });

  it("return insert edit DataSet to LN", () => {
    const insert = createDataSet(ln);

    expect((insert!.node as Element).getAttribute("name")).to.equal(
      "newDataSet_002",
    );
  });
});
