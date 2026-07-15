import { expect } from "vitest";

import { Insert } from "@openscd/oscd-api";
import { isInsert } from "@openscd/oscd-api/utils.js";

import { createGSE } from "./createGSE.js";


const parent = new DOMParser()
  .parseFromString(
    `<SCL>
    <Communication>
        <SubNetwork name="sub">
            <ConnectedAP iedName="ied" apName="AP1">
                <GSE ldInst="lDevice" cbName="cb1">
                    <Address>
                        <P type="MAC-Address">01-0C-CD-01-00-00</P>
                        <P type="APPID">0000</P>
                        <P type="VLAN-ID">000</P>
                        <P type="VLAN-PRIORITY">4</P>
                    </Address>
                    <MinTime unit="s" multiplier="m" >10</MinTime>
                    <MaxTime unit="s" multiplier="m" >10000</MaxTime>
                </GSE>
                <GSE ldInst="lDevice" cbName="cb2">
                    <Address>
                        <P type="MAC-Address">01-0C-CD-01-00-02</P>
                        <P type="APPID">0002</P>
                        <P type="VLAN-ID">000</P>
                        <P type="VLAN-PRIORITY">4</P>
                    </Address>
                    <MinTime unit="s" multiplier="m" >10</MinTime>
                    <MaxTime unit="s" multiplier="m" >10000</MaxTime>
                </GSE>
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

describe("Utility function to create insert edit for GSE element", () => {
  it("returns null with parent not being ConnectedAP", () =>
    expect(createGSE(invalidParent, { ldInst: "lDevice", cbName: "cbName" })).to
      .be.null);

  it("return insert edit with default values", () => {
    const edit = createGSE(parent, { ldInst: "lDevice", cbName: "cb3" });

    expect(edit).to.satisfy(isInsert);
    expect((edit as Insert).parent).to.equal(parent);
    expect(((edit as Insert).node as Element).tagName).to.equal("GSE");
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
    ).to.equal("01-0C-CD-01-00-01");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("0001");
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
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      ((edit as Insert).node as Element).querySelector(":scope > MinTime")
        ?.textContent,
    ).to.equal("10");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      ((edit as Insert).node as Element).querySelector(":scope > MaxTime")
        ?.textContent,
    ).to.equal("10000");
  });

  it("return insert edit with configured values", () => {
    const options = {
      mac: "01-0C-CD-01-10-11",
      appId: "0231",
      vlanId: "004",
      vlanPriority: "7",
      MinTime: "9",
      MaxTime: "9456",
    };
    const edit = createGSE(
      parent,
      { ldInst: "lDevice", cbName: "cb3" },
      options,
    );

    expect(edit).to.satisfy(isInsert);
    expect((edit as Insert).parent).to.equal(parent);
    expect(((edit as Insert).node as Element).tagName).to.equal("GSE");
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
    ).to.equal("01-0C-CD-01-10-11");
    expect(
      ((edit as Insert).node as Element).querySelector(
        ':scope > Address > P[type="APPID"]',
      )?.textContent,
    ).to.equal("0231");
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
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MinTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      ((edit as Insert).node as Element).querySelector(":scope > MinTime")
        ?.textContent,
    ).to.equal("9");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("unit"),
    ).to.equal("s");
    expect(
      ((edit as Insert).node as Element)
        .querySelector(":scope > MaxTime")
        ?.getAttribute("multiplier"),
    ).to.equal("m");
    expect(
      ((edit as Insert).node as Element).querySelector(":scope > MaxTime")
        ?.textContent,
    ).to.equal("9456");
  });
});
