import { expect } from "vitest";

import { createElement } from "../../foundation/utils.js";

import { supervision } from "./supervision.testfiles.js";

import { insertSubscriptionSupervisions } from "./insertSubscriptionSupervisions.js";

const doc = new DOMParser().parseFromString(supervision, "application/xml");

describe("Functions that inserts supervision to subscription edits", () => {
  it("return empty array with already supervised source control block", () => {
    const inputs = doc.querySelector('IED[name="GOOSE_Subscriber4"] Inputs')!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE4",
      serviceType: "GOOSE",
    };
    const extref = createElement(inputs.ownerDocument, "ExtRef", attributes1);
    const insert1 = { parent: inputs, node: extref, reference: null };

    const edits = insertSubscriptionSupervisions([insert1]);

    expect(edits.length).to.equal(0);
  });

  it("return empty array with unsufficient insert edit ", () => {
    const inputs = doc.querySelector('IED[name="GOOSE_Subscriber4"] Inputs')!;

    const attributes1 = {};
    const extref = createElement(inputs.ownerDocument, "ExtRef", attributes1);
    const insert1 = { parent: inputs, node: extref, reference: null };

    const edits = insertSubscriptionSupervisions([insert1]);

    expect(edits.length).to.equal(0);
  });

  it("return empty array with unsufficient update edit", () => {
    const extRef1 = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] ExtRef[intAddr="Pos.stVal"]',
    )!;

    const attributes1 = {};
    const update1 = { element: extRef1, attributes: attributes1 };

    const edits = insertSubscriptionSupervisions([update1]);

    expect(edits.length).to.equal(0);
  });

  it("properly add subscription supervision to new empty LN0", () => {
    const ln0 = doc.querySelector('IED[name="GOOSE_Subscriber4"] LN0')!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const inputs = createElement(ln0.ownerDocument, "Inputs", {});
    const extref = createElement(ln0.ownerDocument, "ExtRef", attributes1);
    const insert1 = {
      parent: ln0,
      node: inputs,
      reference: null,
    };
    const insert2 = {
      parent: inputs,
      node: extref,
      reference: null,
    };

    const edits = insertSubscriptionSupervisions([insert1, insert2]);

    expect(edits.length).to.equal(1);
  });

  it("returns empty array when sink IED cannot be determined", () => {
    const ln0 = doc.querySelector('IED[name="GOOSE_Subscriber4"] LN0')!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const inputs = createElement(ln0.ownerDocument, "Inputs", {});
    const extref = createElement(ln0.ownerDocument, "ExtRef", attributes1);
    const insert2 = {
      parent: inputs,
      node: extref,
      reference: null,
    };

    const edits = insertSubscriptionSupervisions([insert2]);

    expect(edits.length).to.equal(0);
  });

  it("return empty array invalid edit parent definition", () => {
    const inputs = doc.querySelector('IED[name="GOOSE_Subscriber4"] Inputs')!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const extref = createElement(inputs.ownerDocument, "ExtRef", attributes1);
    const insert1 = { parent: inputs, node: extref, reference: null };

    const edits = insertSubscriptionSupervisions([insert1]);

    expect(edits.length).to.equal(1);
  });

  it("return array of edits for update subscription edits", () => {
    const extRef1 = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] ExtRef[intAddr="Pos.stVal"]',
    )!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "stVal",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const update1 = { element: extRef1, attributes: attributes1 };

    const extRef2 = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] ExtRef[intAddr="Pos.q"]',
    )!;

    const attributes2 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };

    const update2 = { element: extRef2, attributes: attributes2 };

    const edits = insertSubscriptionSupervisions([update1, update2]);

    expect(edits.length).to.equal(1);
  });

  it("return array of edits for insert subscription edits", () => {
    const inputs = doc.querySelector('IED[name="GOOSE_Subscriber4"] Inputs')!;

    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const attributes2 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "stVal",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const extref1 = createElement(inputs.ownerDocument, "ExtRef", attributes1);
    const extref2 = createElement(inputs.ownerDocument, "ExtRef", attributes2);
    const insert1 = { parent: inputs, node: extref1, reference: null };
    const insert2 = { parent: inputs, node: extref2, reference: null };

    const edits = insertSubscriptionSupervisions([insert1, insert2]);

    expect(edits.length).to.equal(1);
  });

  it("return array for multiple combined update/insert edits to multiple IEDs", () => {
    const ied4e1 = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] ExtRef[intAddr="Pos.stVal"]',
    )!;
    const ied5e1 = doc.querySelector(
      'IED[name="GOOSE_Subscriber5"] ExtRef[intAddr="Pos.stVal"]',
    )!;
    const attributes1 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "stVal",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE3",
      serviceType: "GOOSE",
    };
    const update1 = { element: ied4e1, attributes: attributes1 };
    const update2 = { element: ied5e1, attributes: attributes1 };

    const ied4inp = doc.querySelector('IED[name="GOOSE_Subscriber4"] Inputs')!;
    const ied5inp = doc.querySelector('IED[name="GOOSE_Subscriber5"] Inputs')!;
    const attributes2 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE5",
      serviceType: "GOOSE",
    };
    const ied4e2 = createElement(ied4inp.ownerDocument, "ExtRef", attributes2);
    const ied5e2 = createElement(ied5inp.ownerDocument, "ExtRef", attributes2);
    const ied4insert1 = { parent: ied4inp, node: ied4e2, reference: null };
    const ied5insert1 = { parent: ied5inp, node: ied5e2, reference: null };

    const attributes3 = {
      iedName: "Publisher",
      ldInst: "CB",
      prefix: "CB",
      lnClass: "CSWI",
      lnInst: "1",
      doName: "Pos",
      daName: "q",
      srcLDInst: "GOOSE",
      srcLNClass: "LLN0",
      srcCBName: "GOOSE6",
      serviceType: "GOOSE",
    };
    const ied4e3 = createElement(ied4inp.ownerDocument, "ExtRef", attributes3);
    const ied5e3 = createElement(ied5inp.ownerDocument, "ExtRef", attributes3);
    const ied4insert2 = { parent: ied4inp, node: ied4e3, reference: null };
    const ied5insert2 = { parent: ied5inp, node: ied5e3, reference: null };

    const edits = insertSubscriptionSupervisions([
      update1,
      update2,
      ied4insert1,
      ied4insert2,
      ied5insert1,
      ied5insert2,
    ]);

    expect(edits.length).to.equal(6);
    expect(
      (edits[0].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE3");
    expect(
      (edits[1].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE3");
    expect((edits[1].node as Element).getAttribute("inst")).to.equal("2");
    expect(
      (edits[2].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE5");
    expect((edits[2].node as Element).getAttribute("inst")).to.equal("4");
    expect(
      (edits[3].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE6");
    expect((edits[3].node as Element).getAttribute("inst")).to.equal("6");
    expect(
      (edits[4].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE5");
    expect((edits[4].node as Element).getAttribute("inst")).to.equal("3");
    expect(
      (edits[5].node as Element).querySelector("Val")?.textContent,
    ).to.equal("PublisherGOOSE/LLN0.GOOSE6");
    expect((edits[5].node as Element).getAttribute("inst")).to.equal("6");
  });
});
