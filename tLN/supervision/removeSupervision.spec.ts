import { expect } from "vitest";

import { supervision } from "./supervision.testfiles";
import { removeSupervision } from "./removeSupervision";

const doc = new DOMParser().parseFromString(supervision, "application/xml");

describe("Function to remove an existing supervision from an supervision LN", () => {
  it("does not remove when valImport/valKind check fails", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="SupervisionNotSupported"] LN[lnClass="LGOS"]',
    )!;

    expect(removeSupervision(supervisionLn)).to.be.null;
  });

  it("does not remove when an subscription does exist", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] LN[lnClass="LGOS"]',
    )!;

    expect(removeSupervision(supervisionLn)).to.be.null;
  });

  it("allows to disable the check for existing subscription of the supervision", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber4"] LN[lnClass="LGOS"]',
    )!;

    expect(
      removeSupervision(supervisionLn, {
        removeSupervisionLn: false,
        checkSubscription: false,
      }),
    ).to.not.be.null;
  });

  it("does not remove when there is no supervision Val", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber3"] LN[lnClass="LGOS"][inst="3"]',
    )!;

    expect(removeSupervision(supervisionLn)).to.be.null;
  });

  it("per default empties control block object reference", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber3"] LN[lnClass="LGOS"][inst="4"]',
    )!;

    const removeEdit = removeSupervision(supervisionLn);
    expect(removeEdit).to.not.be.null;
    expect(removeEdit!.node.nodeType).to.equal(3);
  });

  it("per default empties control block object reference", () => {
    const supervisionLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber3"] LN[lnClass="LGOS"][inst="4"]',
    )!;

    const removeEdit = removeSupervision(supervisionLn, {
      removeSupervisionLn: true,
      checkSubscription: true,
    });
    expect(removeEdit).to.not.be.null;
    expect(removeEdit!.node.nodeType).to.equal(1);
    expect((removeEdit!.node as Element).tagName).to.equal("LN");
  });
});
