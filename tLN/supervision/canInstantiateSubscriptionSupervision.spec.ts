import { expect } from "vitest";

import { canInstantiateSubscriptionSupervision } from "./canInstantiateSubscriptionSupervision.js";

export const doc = new DOMParser().parseFromString(
  `<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4">
    <Header id="GOOSELaterBinding"/>
    <IED name="SupervisionNotSupported" desc="GOOSE subscriber" manufacturer="Dummy">
      <AccessPoint name="AP1">
        <Server>
          <LDevice inst="Earth_Switch">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0" />
            <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI" />
            <LN lnClass="LGOS" lnType="Dummy.LGOS2" />
            <LN lnClass="LSVS" lnType="Dummy.LSVS2" />
          </LDevice>
        </Server>
      </AccessPoint>
    </IED>
    <IED name="GOOSE_Subscriber" desc="GOOSE subscriber" manufacturer="Dummy">
      <Services>
        <SupSubscription maxGo="4" maxSv="0"/>
      </Services>
      <AccessPoint name="AP1">
        <Server>
          <LDevice inst="Supervision">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
            <LN lnClass="LGOS" inst="1" lnType="Dummy.LGOS">
              <DOI name="GoCBRef">
                <DAI name="setSrcRef">
                  <Val>PublisherQB2_Disconnector/LLN0.GOOSE1</Val>
                </DAI>
              </DOI>
            </LN>
            <LN lnClass="LGOS" inst="2" lnType="Dummy.LGOS">
              <Private type="OpenSCD.create"/>
              <DOI name="GoCBRef">
                <DAI name="setSrcRef">
                  <Val>PublisherQB2_Disconnector/LLN0.GOOSE2</Val>
                </DAI>
              </DOI>
            </LN>
            <LN lnClass="LGOS" inst="3" lnType="Dummy.LGOS">
              <DOI name="GoCBRef">
                <DAI name="setSrcRef">
                  <Val></Val>
                </DAI>
              </DOI>
            </LN>
            <LN lnClass="LGOS" inst="5" lnType="Dummy.LGOS">
              <DOI name="GoCBRef">
                <DAI name="setSrcRef">
                </DAI>
              </DOI>
            </LN>
          </LDevice>
        </Server>
      </AccessPoint>
    </IED>
    <IED name="SV_Subscriber" desc="GOOSE subscriber" manufacturer="Dummy">
      <Services>
        <SupSubscription maxGo="0" maxSv="2"/>
      </Services>
      <AccessPoint name="AP1">
        <Server>
          <LDevice inst="SV_supervision">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
            <LN lnClass="LSVS" inst="1" lnType="Dummy.LSVS2">
              <DOI name="SvCBRef">
                <DAI name="setSrcRef" valImport="true" valKind="Conf" />
              </DOI>
            </LN>
            <LN lnClass="LSVS" inst="2" lnType="Dummy.LSVS2" />
          </LDevice>
        </Server>
      </AccessPoint>
    </IED>
    <IED name="SvAndGo_Subscriber" desc="GOOSE subscriber" manufacturer="Dummy">
      <Services>
        <SupSubscription maxGo="1" maxSv="2"/>
      </Services>
      <AccessPoint name="AP1">
        <Server>
          <LDevice inst="SV_supervision">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
            <LN lnClass="LSVS" inst="1" lnType="Dummy.LSVS">
              <DOI name="SvCBRef">
                <DAI name="setSrcRef">
                  <Val>PublisherSampledValue/LLN0.someSmv</Val>
                </DAI>
              </DOI>
            </LN>
            <LN lnClass="LSVS" inst="2" lnType="Dummy.LSVS">
              <DOI name="SvCBRef">
                <DAI name="setSrcRef">
                  <Val>PublisherSampledValue/LLN0.someSmv2</Val>
                </DAI>
              </DOI>
            </LN>
          </LDevice>
          <LDevice inst="Go_supervision">
          <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
          <LN lnClass="LGOS" inst="1" lnType="Dummy.LGOS">
            <DOI name="GoCBRef">
              <DAI name="setSrcRef">
                <Val>PublisherQB2_Disconnector/LLN0.GOOSE2</Val>
              </DAI>
            </DOI>
          </LN>
        </LDevice>
        </Server>
      </AccessPoint>
    </IED>
    <IED name="Publisher" desc="Publisher IED" manufacturer="Dummy">
      <AccessPoint name="AP1">
        <Server>
          <LDevice inst="QB2_Disconnector">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
              <GSEControl name="GOOSE3" type="GOOSE" appID="GOOSE3" confRev="0" />
              <GSEControl name="GOOSE2" type="GOOSE" appID="GOOSE2" confRev="0" />
              <GSEControl name="GOOSE1" type="GOOSE" appID="GOOSE1" confRev="0" />
            </LN0>
          </LDevice>
          <LDevice inst="SampledValue">
            <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
              <SampledValueControl name="someSmv" confRev="0" />
              <SampledValueControl name="someSmv2" confRev="0" />
              <SampledValueControl name="someSmv3" confRev="0" />
            </LN0>
          </LDevice>
        </Server>
      </AccessPoint>
    </IED>
    <DataTypeTemplates>
      <LNodeType lnClass="LGOS" id="Dummy.LGOS">
        <DO name="GoCBRef" type="Dummy.ORG"/>
      </LNodeType>
      <LNodeType lnClass="LGOS" id="Dummy.LGOS1">
        <DO name="GoCBRef" type="Dummy.ORG1"/>
      </LNodeType>
      <LNodeType lnClass="LGOS" id="Dummy.LGOS2">
        <DO name="GoCBRef" type="Dummy.ORG2"/>
      </LNodeType>
      <LNodeType lnClass="LSVS" id="Dummy.LSVS">
        <DO name="SvCBRef" type="Dummy.ORG"/>
      </LNodeType>
      <LNodeType lnClass="LSVS" id="Dummy.LSVS1">
        <DO name="SvCBRef" type="Dummy.ORG1"/>
      </LNodeType>
      <DOType cdc="ORG" id="Dummy.ORG">
        <DA name="setSrcRef" bType="ObjRef" dchg="true" valKind="RO" valImport="true" fc="SP"/>
      </DOType>
      <DOType cdc="ORG" id="Dummy.ORG1">
        <DA name="setSrcRef" bType="ObjRef" dchg="true" valKind="Conf" valImport="true" fc="SP"/>
      </DOType>
      <DOType cdc="ORG" id="Dummy.ORG2">
        <DA name="setSrcRef" bType="ObjRef" dchg="true" fc="SP"/>
      </DOType>
    </DataTypeTemplates>
  </SCL>`,
  "application/xml",
);

describe("Function that checks whether subscription supervision can be instantiated", () => {
  describe("check for already existing control block supervision", () => {
    it("return false when control block supervision does already exist", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE1"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber"]',
      )!;

      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn,
        }),
      ).to.be.false;
    });

    it("checks for duplicate sibling supervision", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const iedOrLn1 = doc.querySelector(
        'IED[name="GOOSE_Subscriber"] LN[lnClass="LGOS"][inst="3"]',
      )!;
      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn: iedOrLn1,
        }),
      ).to.be.true;

      const iedOrLn2 = doc.querySelector(
        'IED[name="GOOSE_Subscriber"] LN[lnClass="LGOS"][inst="5"]',
      )!;
      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn: iedOrLn2,
        }),
      ).to.be.true;
    });

    it("return true when control block supervision does not exist", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber"]',
      )!;
      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn,
        }),
      ).to.be.true;
    });

    it("ignored check with checkDuplicateSupervisions set to false", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE1"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="GOOSE_Subscriber"]',
      )!;

      expect(
        canInstantiateSubscriptionSupervision(
          {
            sourceControlBlock,
            subscriberIedOrLn,
          },
          {
            newSupervisionLn: false,
            fixedLnInst: -1,
            checkDuplicateSupervisions: false,
            checkEditableSrcRef: true,
            checkMaxSupervisionLimits: true,
          },
        ),
      ).to.be.true;
    });
  });

  describe("check whether supervision logical nodes can be edited by SCT", () => {
    describe("for GSEControl", () => {
      it("return false when valImport or valKind is missing from LGOS", () => {
        const sourceControlBlock = doc.querySelector(
          'GSEControl[name="GOOSE3"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="SupervisionNotSupported"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock: sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.false;
      });

      it("return false when valImport or valKind is missing on selected LN", () => {
        const sourceControlBlock = doc.querySelector(
          'GSEControl[name="GOOSE3"]',
        )!;
        const lgos = doc.querySelector(
          'IED[name="SupervisionNotSupported"]  LN[lnClass="LGOS"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn: lgos,
          }),
        ).to.be.false;
      });

      it("checks for DA and DAI for valImport/valKind", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv"]',
        )!;
        const lsvs = doc.querySelector(
          'IED[name="SV_Subscriber"]  LN[lnClass="LSVS"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn: lsvs,
          }),
        ).to.be.true;
      });
    });

    describe("for SampledValueControl", () => {
      it("return false when valImport or valKind is missing on the from LSVS", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="SV_Subscriber"]',
        )!;

        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.true;
      });

      it("return false when valImport or valKind is missing on selected LN", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv"]',
        )!;
        const lsvs = doc.querySelector(
          'IED[name="SV_Subscriber"] LN[lnClass="LSVS"][inst="2"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn: lsvs,
          }),
        ).to.be.false;
      });

      it("checks for DA and DAI for valImport/valKind", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv"]',
        )!;
        const lsvs = doc.querySelector(
          'IED[name="SV_Subscriber"]  LN[lnClass="LSVS"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn: lsvs,
          }),
        ).to.be.true;
      });
    });

    it("ignores check with checkEditableSrcRef set to false", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SupervisionNotSupported"]',
      )!;

      expect(
        canInstantiateSubscriptionSupervision(
          {
            sourceControlBlock,
            subscriberIedOrLn,
          },
          {
            newSupervisionLn: false,
            fixedLnInst: -1,
            checkDuplicateSupervisions: true,
            checkEditableSrcRef: false,
            checkMaxSupervisionLimits: false,
          },
        ),
      ).to.be.true;
    });
  });

  describe("checks whether there is a form supervision logical node", () => {
    it("return false with missing LGOS", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector('IED[name="Publisher"]')!;
      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn,
        }),
      ).to.be.false;
    });

    it("return false with missing LSVS", () => {
      const sourceControlBlock = doc.querySelector(
        'SampledValueControl[name="someSmv"]',
      )!;
      const subscriberIedOrLn = doc.querySelector('IED[name="Publisher"]')!;
      expect(
        canInstantiateSubscriptionSupervision({
          sourceControlBlock,
          subscriberIedOrLn,
        }),
      ).to.be.false;
    });
  });

  describe("checks whether supervision limits are met", () => {
    describe("for GSEControl", () => {
      it("return false when existing supervisions is exceeding maxGo", () => {
        const sourceControlBlock = doc.querySelector(
          'GSEControl[name="GOOSE3"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="SvAndGo_Subscriber"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.false;
      });

      it("return true when existing supervisions is within maxGo", () => {
        const sourceControlBlock = doc.querySelector(
          'GSEControl[name="GOOSE3"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="GOOSE_Subscriber"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.true;
      });
    });

    describe("for SampledValueControl", () => {
      it("return false when existing supervisions is exceeding maxSv", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv3"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="SvAndGo_Subscriber"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.false;
      });

      it("return true when existing supervisions is within maxSv", () => {
        const sourceControlBlock = doc.querySelector(
          'SampledValueControl[name="someSmv3"]',
        )!;
        const subscriberIedOrLn = doc.querySelector(
          'IED[name="SV_Subscriber"]',
        )!;
        expect(
          canInstantiateSubscriptionSupervision({
            sourceControlBlock,
            subscriberIedOrLn,
          }),
        ).to.be.true;
      });
    });

    it("ignores check with checkEditableSrcRef set to false", () => {
      const sourceControlBlock = doc.querySelector(
        'GSEControl[name="GOOSE3"]',
      )!;
      const subscriberIedOrLn = doc.querySelector(
        'IED[name="SvAndGo_Subscriber"]',
      )!;

      expect(
        canInstantiateSubscriptionSupervision(
          {
            sourceControlBlock,
            subscriberIedOrLn,
          },
          {
            newSupervisionLn: false,
            fixedLnInst: -1,
            checkDuplicateSupervisions: true,
            checkEditableSrcRef: true,
            checkMaxSupervisionLimits: false,
          },
        ),
      ).to.be.true;
    });
  });

  it("makes sure to not overwrite valid supervision", () => {
    const sourceControlBlock = doc.querySelector('GSEControl[name="GOOSE3"]')!;
    const ln1 = doc.querySelector('LN[lnClass="LGOS"][inst="1"]')!;

    expect(
      canInstantiateSubscriptionSupervision({
        sourceControlBlock,
        subscriberIedOrLn: ln1,
      }),
    ).to.be.false;

    const ln2 = doc.querySelector('LN[lnClass="LGOS"][inst="3"]')!;

    expect(
      canInstantiateSubscriptionSupervision({
        sourceControlBlock,
        subscriberIedOrLn: ln2,
      }),
    ).to.be.true;
  });
});
