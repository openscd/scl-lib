import { expect } from "vitest";

import { createSampledValueControl } from "./createSampledValueControl.js";

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
    <SMVsc max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <SMVsc max="2" />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <SampledValueControl name="SampledValueControl"/>
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
    <SMVsc max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <SMVsc />
    </Services>
    <Server>
        <LDevice inst="first">
            <LN0 lnClass="LLN0" inst="">
                <SampledValueControl name="SampledValueControl1" />
                <SampledValueControl name="SampledValueControl2" />
            </LN0>
        </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED4">
  <Services>
    <SMVsc max="3" />
  </Services>
  <AccessPoint name="AP1">
    <Services>
        <SMVsc max="2" />
    </Services>
    <Server>
        <LDevice >
            <LN0 lnClass="LLN0" inst="">
                <SampledValueControl name="SampledValueControl"/>
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

describe("Utility function to create schema valid SampledValueControl insert edit", () => {
  it("returns null with missing LN0", () => {
    const insert = createSampledValueControl(invalidParent);
    expect(insert).to.be.empty;
  });

  it("returns null when added to LN", () => {
    const insert = createSampledValueControl(ln);
    expect(insert).to.be.empty;
  });

  it("returns null when exceeding SMVsc.max ", () => {
    const insert = createSampledValueControl(ln02);
    expect(insert).to.be.empty;
  });

  it("returns null when name is duplicate ", () => {
    const insert = createSampledValueControl(ln0, {
      smvControl: {
        name: "newSampledValueControl_001",
        smpRate: "80",
        nofASDU: "1",
      },
    });
    expect(insert).to.be.empty;
  });

  it("returns null when datSet is not referencing an valid DataSet", () => {
    const insert = createSampledValueControl(ln0, {
      smvControl: {
        name: "newSampledValueControl_003",
        smpRate: "80",
        nofASDU: "1",
        datSet: "invalidReference",
      },
    });
    expect(insert).to.be.empty;
  });

  it("return insert edit SampledValueControl to first LDevice", () => {
    const insert = createSampledValueControl(ied);

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newSampledValueControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("0");
    expect((insert[0].node as Element).getAttribute("multicast")).to.equal(
      "true",
    );
    expect((insert[0].node as Element).getAttribute("smvID")).to.equal(
      "IED1/first/LLN0/newSampledValueControl_003",
    );
  });

  it("return insert edit SampledValueControl to LN0", () => {
    const insert = createSampledValueControl(ln0);

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newSampledValueControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("0");
    expect((insert[0].node as Element).getAttribute("multicast")).to.equal(
      "true",
    );
    expect((insert[0].node as Element).getAttribute("smpRate")).to.equal("80");
    expect((insert[0].node as Element).getAttribute("nofASDU")).to.equal("1");
  });

  it("returns single insert with defined SampledValueControl values", () => {
    const insert = createSampledValueControl(ln0, {
      smvControl: {
        name: "newSampledValueControl_003",
        smpRate: "90",
        nofASDU: "2",
        desc: "someDesc",
        confRev: "2",
        multicast: "false",
        smvID: "someSmvID",
        securityEnable: "Signature",
        smpMod: "SecPerSmp",
      },
    });

    expect(insert.length).to.equal(1);
    expect((insert[0].node as Element).getAttribute("name")).to.equal(
      "newSampledValueControl_003",
    );
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("2");
    expect((insert[0].node as Element).getAttribute("multicast")).to.equal(
      "false",
    );
    expect((insert[0].node as Element).getAttribute("smvID")).to.equal(
      "someSmvID",
    );
    expect((insert[0].node as Element).getAttribute("smpRate")).to.equal("90");
    expect((insert[0].node as Element).getAttribute("nofASDU")).to.equal("2");
    expect((insert[0].node as Element).getAttribute("smpMod")).to.equal(
      "SecPerSmp",
    );
  });

  it("sets confRev to 1 when datSet is defined", () => {
    const insert = createSampledValueControl(ln0, {
      smvControl: {
        name: "newSampledValueControl_003",
        datSet: "dataSet2",
      },
    });
    expect(insert).to.not.be.empty;
    expect((insert[0].node as Element).getAttribute("confRev")).to.equal("1");
  });

  it("returns multiple inserts including SMV with connected IEDs access point", () => {
    const insert = createSampledValueControl(lDevice, {
      smvControl: {
        name: "newSampledValueControl_002",
      },
    });
    expect(insert.length).to.equal(2);
    expect((insert[1].node as Element).getAttribute("ldInst")).to.equal(
      "first",
    );
    expect((insert[1].node as Element).getAttribute("cbName")).to.equal(
      "newSampledValueControl_002",
    );
    expect((insert[1].parent as Element).getAttribute("apName")).to.equal(
      "AP1",
    );
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-04-00-00");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("4000");
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
  });

  it("allows to define SMV parameters", () => {
    const insert = createSampledValueControl(lDevice, {
      smv: {
        apName: "AP2",
        mac: "01-0C-CD-04-00-13",
        appId: "4003",
        vlanId: "002",
        vlanPriority: "6",
      },
    });
    expect(insert.length).to.equal(2);
    expect((insert[1].node as Element).getAttribute("ldInst")).to.equal(
      "first",
    );
    expect((insert[1].node as Element).getAttribute("cbName")).to.equal(
      "newSampledValueControl_001",
    );
    expect((insert[1].parent as Element).getAttribute("apName")).to.equal(
      "AP2",
    );
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-04-00-13");
    expect(
      (insert[1].node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("4003");
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
  });

  it("always add required SmvOpts child element", () => {
    const insert = createSampledValueControl(ied);
    expect((insert[0].node as Element).querySelector("SmvOpts")).to.not.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("refreshTime"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("sampleSynchronized"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("sampleRate"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("dataSet"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("security"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("timestamp"),
    ).to.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("synchSourceId"),
    ).to.be.null;
  });

  it("allows to set non default SmvOpts attributes add required SmvOpts child element", () => {
    const insert = createSampledValueControl(ied, {
      smvOpts: {
        refreshTime: "true",
        sampleSynchronized: "false",
        sampleRate: "true",
        dataSet: "true",
        security: "true",
        timestamp: "true",
        synchSourceId: "true",
      },
    });

    expect((insert[0].node as Element).querySelector("SmvOpts")).to.not.be.null;
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("refreshTime"),
    ).to.equal("true");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("sampleSynchronized"),
    ).to.equal("false");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("sampleRate"),
    ).to.equal("true");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("dataSet"),
    ).to.equal("true");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("security"),
    ).to.equal("true");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("timestamp"),
    ).to.equal("true");
    expect(
      (insert[0].node as Element)
        .querySelector("SmvOpts")
        ?.getAttribute("synchSourceId"),
    ).to.equal("true");
  });

  it("does not return SMV insert with missing ldInst", () => {
    const insert = createSampledValueControl(lDevice2);
    expect(insert.length).to.equal(1);
  });
});
