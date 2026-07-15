import { expect } from "vitest";

import { Insert, Remove } from "@openscd/oscd-api";
import { isInsert, isRemove } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import {
  nulledGSE,
  partlyInstType,
  withInstType,
  woInstType,
} from "./changeGSEContent.testfiles.js";
import { changeGSEContent } from "./changeGSEContent.js";

const conv = {
  mac: "MAC-Address",
  appId: "APPID",
  vlanId: "VLAN-ID",
  vlanPriority: "VLAN-PRIORITY",
};

const content1 = {
  address: {
    mac: "01-0C-CD-01-00-13",
    appId: "0013",
    vlanId: "013",
    vlanPriority: "6",
  },
  timing: { MinTime: "99", MaxTime: "999" },
};

const content2 = {
  address: {
    mac: "01-0C-CD-01-00-13",
    appId: "0013",
    vlanId: "013",
    vlanPriority: "6",
  },
};

const content3 = {
  timing: { MinTime: "99", MaxTime: "999" },
};

const content4 = {
  timing: { MinTime: undefined, MaxTime: undefined },
};

const content5 = {
  address: {
    mac: "01-0C-CD-01-00-13",
    appId: "0013",
    vlanId: "013",
    vlanPriority: "6",
    instType: true,
  },
};

const content6 = {
  address: {
    mac: "01-0C-CD-01-00-13",
    appId: "0013",
    vlanId: "013",
    vlanPriority: "6",
    instType: false,
  },
};

function testPTypeChange(
  gSE: Element,
  key: string,
  value: string | undefined,
): void {
  const oldAddress = gSE.querySelector("Address");

  const content = JSON.parse(JSON.stringify(content2)); // need a deep copy of the object

  content.address[key] = value;

  const edits = changeGSEContent(gSE, content);

  expect(edits[0]).to.satisfies(isInsert);
  expect((edits[0] as Insert).parent).to.equal(gSE);
  expect(
    ((edits[0] as Insert).node as Element).querySelector(
      `Address > P[type="${conv[key as keyof typeof conv]}"]`,
    )?.textContent ?? null,
  ).to.equal(value ?? null);
  // eslint-disable-next-line no-unused-expressions
  expect((edits[0] as Insert).reference).to.exist;
  expect(edits[1]).to.satisfies(isRemove);
  expect((edits[1] as Remove).node).to.equal(oldAddress);
}

describe("Utility function to change the content of the element GSE", () => {
  it("always return edits ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;
    const edits = changeGSEContent(gSE, content1);

    expect(edits.length).to.equal(6);
  });

  it("returns edit array to update the MAC-Address ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "mac", "01-0C-CD-01-00-01");
  });

  it("returns edit array to remove the MAC-Address ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "mac", undefined);
  });

  it("returns edit array to update the APPID ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "appId", "0003");
  });

  it("returns edit array to remove the APPID ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "appId", undefined);
  });

  it("returns edit array to update the VLAN-ID ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "vlanId", "001");
  });

  it("returns edit array to remove the VLAN-ID ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "vlanId", undefined);
  });

  it("returns edit array to update the VLAN-PRIORITY ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "vlanPriority", "0");
  });

  it("returns edit array to remove the VLAN-PRIORITY ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    testPTypeChange(gSE, "vlanPriority", undefined);
  });

  it("change xsi:type as well with instType set", () => {
    const gSE = findElement(woInstType, "GSE") as Element;

    const edits = changeGSEContent(gSE, content5);

    expect(edits.length).to.equal(2);
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="MAC-Address"]')
        ?.getAttribute("xsi:type"),
    ).to.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="APPID"]')
        ?.getAttribute("xsi:type"),
    ).to.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-ID"]')
        ?.getAttribute("xsi:type"),
    ).to.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-PRIORITY"]')
        ?.getAttribute("xsi:type"),
    ).to.exist;
  });

  it("change xsi:type as well with instType set", () => {
    const gSE = findElement(withInstType, "GSE") as Element;

    const edits = changeGSEContent(gSE, content6);

    expect(edits.length).to.equal(2);
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="MAC-Address"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="APPID"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-ID"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-PRIORITY"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
  });

  it("does not change xsi:type when address.instType is undefined", () => {
    const gSE = findElement(partlyInstType, "GSE") as Element;

    const edits = changeGSEContent(gSE, content2);

    expect(edits.length).to.equal(2);
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="MAC-Address"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="APPID"]')
        ?.getAttribute("xsi:type"),
    ).to.equal("tP_APPID");
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-ID"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-PRIORITY"]')
        ?.getAttribute("xsi:type"),
    ).to.equal("tP_VLAN-PRIORITY");
  });

  it("does not change xsi:type when address.instType is undefined", () => {
    const gSE = findElement(nulledGSE, "GSE") as Element;

    const edits = changeGSEContent(gSE, content2);

    expect(edits.length).to.equal(1);
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="MAC-Address"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="APPID"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-ID"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
    expect(
      ((edits[0] as Insert).node as Element)
        .querySelector(':scope > P[type="VLAN-PRIORITY"]')
        ?.getAttribute("xsi:type"),
    ).to.not.exist;
  });

  it("returns edit array to update existing MinTime MaxTime ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;
    const content = { ...content3 };
    content.timing.MinTime = "54";
    content.timing.MaxTime = "678";

    const edits = changeGSEContent(gSE, content);
    expect(edits.length).to.equal(4);
    expect(edits[0]).to.satisfy(isInsert);
    expect((edits[0] as Insert).node.textContent).to.equal("54");
    expect(edits[1]).to.satisfy(isRemove);
    expect(edits[2]).to.satisfy(isInsert);
    expect((edits[2] as Insert).node.textContent).to.equal("678");
    expect(edits[3]).to.satisfy(isRemove);
  });

  it("returns edit array to remove existing MinTime/MaxTime ", () => {
    const gSE = findElement(woInstType, "GSE") as Element;
    const content = { ...content4 };

    const edits = changeGSEContent(gSE, content);
    expect(edits.length).to.equal(2);
    expect(edits[0]).to.satisfy(isRemove);
    expect(((edits[0] as Remove).node as Element).tagName).to.equal("MinTime");
    expect(edits[1]).to.satisfy(isRemove);
    expect(((edits[1] as Remove).node as Element).tagName).to.equal("MaxTime");
  });

  it("returns edit array to insert non existing MinTime MaxTime ", () => {
    const gSE = findElement(nulledGSE, "GSE") as Element;
    const content = { ...content3 };
    content.timing.MinTime = "54";
    content.timing.MaxTime = "678";

    const edits = changeGSEContent(gSE, content);
    expect(edits.length).to.equal(2);
    expect(edits[0]).to.satisfy(isInsert);
    expect((edits[0] as Insert).node.textContent).to.equal("54");
    expect(edits[1]).to.satisfy(isInsert);
    expect((edits[1] as Insert).node.textContent).to.equal("678");
  });

  it("returns empty edit array removing non existing MinTime MaxTime ", () => {
    const gSE = findElement(nulledGSE, "GSE") as Element;
    const content = { ...content4 };

    const edits = changeGSEContent(gSE, content);
    expect(edits.length).to.equal(0);
  });
});
