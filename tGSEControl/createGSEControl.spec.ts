import { expect } from "vitest";

import { createGSEControl } from "./createGSEControl.js";

const doc = `
<SCL>
  <Communication>
    <SubNetwork name="SubNet1">
        <ConnectedAP iedName="IED2" apName="AP1" />
        <ConnectedAP iedName="IED4" apName="AP1" />
    </SubNetwork>
    <SubNetwork name="SubNet2">
        <ConnectedAP iedName="IED2" apName="AP2" />
    </SubNetwork>
  </Communication>
<IED name="IED1">
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
    <GOOSE max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <GOOSE max="2" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <GSEControl name="gseControl"/>
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
    <GOOSE max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <GOOSE />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <GSEControl name="gseControl1" />
                <GSEControl name="gseControl2" />
            </LN0>
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED4">
  <Services>
    <GOOSE max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <GOOSE max="2" />
    </Services>
    <Server>
        <LDevice >
            <LN0 lnClass="LLN0" inst="">
                <GSEControl name="gseControl"/>
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

const ln0 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector("LN0")!;

const ln02 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED3"] > AccessPoint[name="AP1"] LN0')!;

const lDevice = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED2"] LDevice')!;

const lDevice2 = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('IED[name="IED4"] LDevice')!;

const invalidParent = new DOMParser()
  .parseFromString(doc, "application/xml")
  .querySelector('LDevice[inst="second"]')!;

describe("Utility function to create schema valid GSEControl insert edit", () => {
  it("returns null with missing LN0", () => {
    const insert = createGSEControl(invalidParent);
    expect(insert).to.be.empty;
  });

  it("returns null when added to LN", () => {
    const insert = createGSEControl(ln);
    expect(insert).to.be.empty;
  });

  it("returns null when exceeding GOOSE.max ", () => {
    const insert = createGSEControl(ln02);
    expect(insert).to.be.empty;
  });

  it("returns null when name is duplicate ", () => {
    const insert = createGSEControl(ln0, {
      gseControl: { name: "newGSEControl_001" },
    });
    expect(insert).to.be.empty;
  });

  it("returns null when datSet is not referencing an valid DataSet", () => {
    const insert = createGSEControl(ln0, {
      gseControl: { name: "newGSEControl_003", datSet: "invalidReference" },
    });
    expect(insert).to.be.empty;
  });

  it("return insert edit GSEControl to first LDevice", () => {
    const insert = createGSEControl(ied);

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newGSEControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("0");
    expect((insert[0].node as Element).getAttribute("type")).to.equal("GOOSE");
    expect((insert[0].node as Element).getAttribute("appID")).to.equal(
      "IED1/first/LLN0/newGSEControl_003",
    );
  });

  it("return insert edit GSEControl to LN0", () => {
    const insert = createGSEControl(ln0);

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newGSEControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("0");
    expect((insert[0].node as Element).getAttribute("type")).to.equal("GOOSE");
    expect((insert[0].node as Element).getAttribute("appID")).to.equal(
      "IED1/first/LLN0/newGSEControl_003",
    );
  });

  it("returns single insert with defined GSEControl values", () => {
    const insert = createGSEControl(ln0, {
      gseControl: {
        name: "newGSEControl_003",
        desc: "someDesc",
        confRev: "2",
        type: "GSSE",
        appID: "someAppID",
      },
    });

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newGSEControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("2");
    expect((insert[0].node as Element).getAttribute("type")).to.equal("GSSE");
    expect((insert[0].node as Element).getAttribute("appID")).to.equal(
      "someAppID",
    );
  });

  it("sets confRev to 1 when datSet is defined", () => {
    const insert = createGSEControl(ln0, {
      gseControl: { name: "newGSEControl_003", datSet: "dataSet2" },
    });
    expect(insert).to.not.be.empty;
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("1");
  });

  it("returns multiple inserts including GSE with connected IEDs access point", () => {
    const insert = createGSEControl(lDevice, {
      gseControl: {
        name: "newGSEControl_002",
        desc: "someDesc",
        confRev: "2",
        type: "GSSE",
        appID: "someAppID",
      },
    });
    expect(insert.length).to.equal(2);
    expect((insert[1].node as Element).getAttribute("ldInst")).to.equal(
      "first",
    );
    expect((insert[1].node as Element).getAttribute("cbName")).to.equal(
      "newGSEControl_002",
    );
    expect((insert[1].parent as Element).getAttribute("apName")).to.equal(
      "AP1",
    );
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-01-00-00");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("0000");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="VLAN-ID"]',
      )?.textContent,
    ).to.equal("000");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="VLAN-PRIORITY"]',
      )?.textContent,
    ).to.equal("4");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      (insert[1].node as Element).querySelector(":scope > MinTime")
        ?.textContent,
    ).to.equal("10");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      (insert[1].node as Element).querySelector(":scope > MaxTime")
        ?.textContent,
    ).to.equal("10000");
  });

  it("allows to define GSE parameters", () => {
    const insert = createGSEControl(lDevice, {
      gse: {
        apName: "AP2",
        mac: "01-0C-CD-01-00-13",
        appId: "0003",
        vlanId: "002",
        vlanPriority: "6",
        MinTime: "16",
        MaxTime: "1345",
      },
    });
    expect(insert.length).to.equal(2);
    expect((insert[1].node as Element).getAttribute("ldInst")).to.equal(
      "first",
    );
    expect((insert[1].node as Element).getAttribute("cbName")).to.equal(
      "newGSEControl_001",
    );
    expect((insert[1].parent as Element).getAttribute("apName")).to.equal(
      "AP2",
    );
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-01-00-13");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("0003");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="VLAN-ID"]',
      )?.textContent,
    ).to.equal("002");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="VLAN-PRIORITY"]',
      )?.textContent,
    ).to.equal("6");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      (insert[1].node as Element).querySelector(":scope > MinTime")
        ?.textContent,
    ).to.equal("16");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      (insert[1].node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      (insert[1].node as Element).querySelector(":scope > MaxTime")
        ?.textContent,
    ).to.equal("1345");
  });

  it("does not return GSE insert with missing ldInst", () => {
    const insert = createGSEControl(lDevice2);
    expect(insert.length).to.equal(1);
  });
});
