import { expect } from "vitest";

import { orphanControlBlock, supervision } from "./supervision.testfiles.js";
import { instantiateSubscriptionSupervision } from "./instantiateSubscriptionSupervision.js";

const doc = new DOMParser().parseFromString(supervision, "application/xml");
const orphanCb = new DOMParser()
  .parseFromString(orphanControlBlock, "application/xml")
  .querySelector("GSEControl")!;

describe("Function that instantiates a subscription supervision (LGOS/LSVS)", () => {
  it("returns null with orphan source control block", () => {
    const subscriberIedOrLn = doc.querySelector(
      'IED[name="GOOSE_Subscriber1"]',
    )!;

    const insert = instantiateSubscriptionSupervision({
      subscriberIedOrLn,
      sourceControlBlock: orphanCb,
    });

    expect(insert).to.be.null;
  });

  describe("with enabled checks upfront", () => {
    it("returns null with failing check", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SvAndGo_Subscriber"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect(insert).to.be.null;
    });

    it("returns insert edit with passing check", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber1"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect(insert).to.not.be.null;
    });
  });

  describe("with disabled checks upfront", () => {
    it("always returns insert edit ", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SvAndGo_Subscriber"]',
      )!;

      const options = {
        newSupervisionLn: false,
        fixedLnInst: -1,
        checkEditableSrcRef: false,
        checkDuplicateSupervisions: false,
        checkMaxSupervisionLimits: false,
      };

      const insert = instantiateSubscriptionSupervision(
        {
          subscriberIedOrLn,
          sourceControlBlock,
        },
        options,
      );

      expect(insert).to.not.be.null;
    });
  });

  describe("with GOOSE control block", () => {
    it("add Val textContent with empty Val", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber1"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("Val");
      expect((insert?.node as Node).textContent).to.equal(
        "PublisherGOOSE/LLN0.GOOSE3",
      );
    });

    it("add Val Element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber2"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("DAI");
      expect((insert?.node as Element).tagName).to.equal("Val");
      expect((insert?.node as Element).textContent).to.equal(
        "PublisherGOOSE/LLN0.GOOSE3",
      );
    });

    it("add DAI element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber3"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("DOI");
      expect((insert?.node as Element).tagName).to.equal("DAI");
      expect(
        (insert?.node as Element).querySelector("Val")!.textContent,
      ).to.equal("PublisherGOOSE/LLN0.GOOSE3");
    });

    it("add DOI element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber4"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).tagName).to.equal("DOI");
      expect(
        (insert?.node as Element).querySelector("Val")!.textContent,
      ).to.equal("PublisherGOOSE/LLN0.GOOSE3");
    });

    it("add LN element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber5"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("LDevice");
      expect((insert?.node as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).getAttribute("inst")).to.equal("2");
      expect((insert?.node as Element).getAttribute("lnClass")).to.equal(
        "LGOS",
      );
      expect((insert?.node as Element).getAttribute("prefix")).to.be.null;
      expect(
        (insert?.node as Element)
          .querySelector("Private")
          ?.getAttribute("type"),
      ).to.equal("OpenSCD.create");
    });

    it("returns fixed inst with option.fixedLnInst > 0", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber5"]',
      )!;

      const options = {
        newSupervisionLn: false,
        fixedLnInst: 3,
        checkEditableSrcRef: false,
        checkDuplicateSupervisions: false,
        checkMaxSupervisionLimits: false,
      };

      const insert = instantiateSubscriptionSupervision(
        {
          subscriberIedOrLn,
          sourceControlBlock,
        },
        options,
      );

      expect((insert?.parent as Element).tagName).to.equal("LDevice");
      expect((insert?.node as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).getAttribute("inst")).to.equal("3");
      expect(
        (insert?.node as Element)
          .querySelector("Private")
          ?.getAttribute("type"),
      ).to.equal("OpenSCD.create");
    });

    it("always add a new LN with newSupervisionLn option", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber1"]',
      )!;

      const options = {
        newSupervisionLn: true,
        fixedLnInst: -1,
        checkEditableSrcRef: true,
        checkDuplicateSupervisions: true,
        checkMaxSupervisionLimits: true,
      };
      const insert = instantiateSubscriptionSupervision(
        {
          subscriberIedOrLn,
          sourceControlBlock,
        },
        options,
      );

      expect((insert?.node as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).getAttribute("inst")).to.equal("5");
      expect((insert?.node as Node).textContent).to.equal(
        "PublisherGOOSE/LLN0.GOOSE3",
      );
    });

    it("allows to fix inst attribute with newSupervisionLn option", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber1"]',
      )!;

      const options = {
        newSupervisionLn: true,
        fixedLnInst: 8,
        checkEditableSrcRef: true,
        checkDuplicateSupervisions: true,
        checkMaxSupervisionLimits: true,
      };
      const insert = instantiateSubscriptionSupervision(
        {
          subscriberIedOrLn,
          sourceControlBlock,
        },
        options,
      );

      expect((insert?.node as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).getAttribute("inst")).to.equal("8");
      expect((insert?.node as Node).textContent).to.equal(
        "PublisherGOOSE/LLN0.GOOSE3",
      );
    });
  });

  describe("with sampled value control block", () => {
    it("add Val textContent with empty Val", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber1"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("Val");
      expect((insert?.node as Node).textContent).to.equal(
        "PublisherSampledValue/LLN0.SMV3",
      );
    });

    it("add Val Element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber2"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("DAI");
      expect((insert?.node as Element).tagName).to.equal("Val");
      expect((insert?.node as Element).textContent).to.equal(
        "PublisherSampledValue/LLN0.SMV3",
      );
    });

    it("add DAI element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber3"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("DOI");
      expect((insert?.node as Element).tagName).to.equal("DAI");
      expect(
        (insert?.node as Element).querySelector("Val")!.textContent,
      ).to.equal("PublisherSampledValue/LLN0.SMV3");
    });

    it("add DOI element with correct Val child", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber4"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).tagName).to.equal("DOI");
      expect(
        (insert?.node as Element).querySelector("Val")!.textContent,
      ).to.equal("PublisherSampledValue/LLN0.SMV3");
    });

    it("add LN textContent with empty Val", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber5"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("LDevice");
      expect((insert?.node as Element).tagName).to.equal("LN");
      expect((insert?.node as Element).getAttribute("inst")).to.equal("2");
      expect((insert?.node as Element).getAttribute("lnClass")).to.equal(
        "LSVS",
      );
      expect((insert?.node as Element).getAttribute("prefix")).to.equal(
        "SMVPrefix",
      );
      expect(
        (insert?.node as Element)
          .querySelector("Private")
          ?.getAttribute("type"),
      ).to.equal("OpenSCD.create");
    });
  });

  describe("with LN being subscriberLnOrIed", () => {
    it("fills logical node with missing DAI element", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="SMV3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SV_Subscriber3"] LN[lnClass="LSVS"][inst="2"]',
      )!;

      const insert = instantiateSubscriptionSupervision({
        subscriberIedOrLn,
        sourceControlBlock,
      });

      expect((insert?.parent as Element).tagName).to.equal("DOI");
      expect((insert?.node as Element).tagName).to.equal("DAI");
      expect(
        (insert?.node as Element).querySelector("Val")!.textContent,
      ).to.equal("PublisherSampledValue/LLN0.SMV3");
    });
  });
});
