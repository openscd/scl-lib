import { expect } from "vitest";

import { Insert, Remove } from "@openscd/oscd-api";
import { isInsert, isRemove } from "@openscd/oscd-api/utils.js";

import { findElement } from "../foundation/helpers.test.js";

import {
  nulledSMV,
  partlyInstType,
  withInstType,
  woInstType,
} from "./changeSMVContent.testfiles.js";
import { changeSMVContent } from "./changeSMVContent.js";

const conv = {
  mac: "MAC-Address",
  appId: "APPID",
  vlanId: "VLAN-ID",
  vlanPriority: "VLAN-PRIORITY",
};

const content1 = {
  mac: "01-0C-CD-04-00-13",
  appId: "4013",
  vlanId: "013",
  vlanPriority: "6",
};

const content2 = {
  mac: "01-0C-CD-04-00-13",
  appId: "4013",
  vlanId: "013",
  vlanPriority: "6",
};

const content5 = {
  mac: "01-0C-CD-04-00-13",
  appId: "4013",
  vlanId: "013",
  vlanPriority: "6",
  instType: true,
};

const content6 = {
  mac: "01-0C-CD-04-00-13",
  appId: "4013",
  vlanId: "013",
  vlanPriority: "6",
  instType: false,
};

function testPTypeChange(
  gSE: Element,
  key: keyof typeof conv,
  value: string | undefined,
): void {
  const oldAddress = gSE.querySelector("Address");

  const content = JSON.parse(JSON.stringify(content2)); // need a deep copy of the object

  content[key] = value;

  const edits = changeSMVContent(gSE, content);

  expect(edits[0]).to.satisfies(isInsert);
  expect((edits[0] as Insert).parent).to.equal(gSE);
  expect(
    ((edits[0] as Insert).node as Element).querySelector(
      `Address > P[type="${conv[key]}"]`,
    )?.textContent ?? null,
  ).to.equal(value ?? null);
  // eslint-disable-next-line no-unused-expressions
  expect((edits[0] as Insert).reference).to.exist;
  expect(edits[1]).to.satisfies(isRemove);
  expect((edits[1] as Remove).node).to.equal(oldAddress);
}

describe("Utility function to change the content of the element SMV", () => {
  it("always return edits ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;
    const edits = changeSMVContent(gSE, content1);

    expect(edits.length).to.equal(2);
  });

  it("returns edit array to update the MAC-Address ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "mac", "01-0C-CD-04-00-01");
  });

  it("returns edit array to remove the MAC-Address ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "mac", undefined);
  });

  it("returns edit array to update the APPID ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "appId", "4003");
  });

  it("returns edit array to remove the APPID ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "appId", undefined);
  });

  it("returns edit array to update the VLAN-ID ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "vlanId", "001");
  });

  it("returns edit array to remove the VLAN-ID ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "vlanId", undefined);
  });

  it("returns edit array to update the VLAN-PRIORITY ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "vlanPriority", "0");
  });

  it("returns edit array to remove the VLAN-PRIORITY ", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    testPTypeChange(gSE, "vlanPriority", undefined);
  });

  it("change xsi:type as well with instType set", () => {
    const gSE = findElement(woInstType, "SMV") as Element;

    const edits = changeSMVContent(gSE, content5);

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
    const gSE = findElement(withInstType, "SMV") as Element;

    const edits = changeSMVContent(gSE, content6);

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
    const gSE = findElement(partlyInstType, "SMV") as Element;

    const edits = changeSMVContent(gSE, content2);

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
    const gSE = findElement(nulledSMV, "SMV") as Element;

    const edits = changeSMVContent(gSE, content2);

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
});
