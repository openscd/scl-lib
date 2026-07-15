import { expect } from "vitest";

import { Insert } from "@openscd/oscd-api";
import { isInsert } from "@openscd/oscd-api/utils.js";

import { createSMV } from "./createSMV.js";

const parent = new DOMParser()
  .parseFromString(
    `<SCL>
    <Communication>
        <SubNetwork name="sub">
            <ConnectedAP iedName="ied" apName="AP1">
                <SMV ldInst="lDevice" cbName="cb1">
                    <Address>
                        <P type="MAC-Address">01-0C-CD-04-00-00</P>
                        <P type="APPID">4000</P>
                        <P type="VLAN-ID">000</P>
                        <P type="VLAN-PRIORITY">4</P>
                    </Address>
                </SMV>
                <SMV ldInst="lDevice" cbName="cb2">
                    <Address>
                        <P type="MAC-Address">01-0C-CD-04-00-02</P>
                        <P type="APPID">4002</P>
                        <P type="VLAN-ID">000</P>
                        <P type="VLAN-PRIORITY">4</P>
                    </Address>
                </SMV>
            </ConnectedAP>
        </SubNetwork>
    </Communication>
</SCL>`,
    "application/xml",
  )
  .querySelector("ConnectedAP")!;

const invalidParent = new DOMParser()
  .parseFromString(`<NonConnectedAP />`, "application/xml")
  .querySelector("NonConnectedAP")!;

describe("Utility function to create insert edit for SMV element", () => {
  it("returns null with parent not being ConnectedAP", () =>
    expect(createSMV(invalidParent, { ldInst: "lDevice", cbName: "cbName" })).to
      .be.null);

  it("return insert edit with default values", () => {
    const edit = createSMV(parent, { ldInst: "lDevice", cbName: "cb3" });

    expect(edit).to.satisfy(isInsert);
    expect((edit as Insert).parent).to.equal(parent);
    expect(((edit as Insert).node as Element).tagName).to.equal("SMV");
    expect(((edit as Insert).node as Element).getAttribute("ldInst")).to.equal(
      "lDevice",
    );
    expect(((edit as Insert).node as Element).getAttribute("cbName")).to.equal(
      "cb3",
    );
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-04-00-01");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("4001");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="VLAN-ID"]',
      )?.textContent,
    ).to.equal("000");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="VLAN-PRIORITY"]',
      )?.textContent,
    ).to.equal("4");
  });

  it("return insert edit with configured values", () => {
    const options = {
      mac: "01-0C-CD-04-10-11",
      appId: "4231",
      vlanId: "004",
      vlanPriority: "7",
    };
    const edit = createSMV(
      parent,
      { ldInst: "lDevice", cbName: "cb3" },
      options,
    );

    expect(edit).to.satisfy(isInsert);
    expect((edit as Insert).parent).to.equal(parent);
    expect(((edit as Insert).node as Element).tagName).to.equal("SMV");
    expect(((edit as Insert).node as Element).getAttribute("ldInst")).to.equal(
      "lDevice",
    );
    expect(((edit as Insert).node as Element).getAttribute("cbName")).to.equal(
      "cb3",
    );
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="MAC-Address"]',
      )?.textContent,
    ).to.equal("01-0C-CD-04-10-11");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("4231");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="VLAN-ID"]',
      )?.textContent,
    ).to.equal("004");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="VLAN-PRIORITY"]',
      )?.textContent,
    ).to.equal("7");
  });
});
