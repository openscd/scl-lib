import { expect } from "vitest";
import { isSubscribed } from "./isSubscribed";

const scl = `
<SCL>
    <IED name="publisher">
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst">
                    <LN0 lnClass="LLN0" inst="">
                        <DataSet name="datSet">
                            <FCDA desc="multiControl" ldInst="ldInst" prefix="prefix" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA desc="ed1type" ldInst="ldInst" prefix="prefix" lnClass="PTOC" lnInst="1" doName="Beh" daName="q" fc="ST" />
                            <FCDA desc="unsubscribed" ldInst="ldInst" prefix="prefix" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.mag.f" fc="MX" />
                        </DataSet>
                        <DataSet name="noDatSet">
                            <FCDA desc="unlinked" ldInst="ldInst" prefix="prefix" lnClass="PDIF" lnInst="1" doName="Mod" daName="stVal" fc="ST" />
                        </DataSet>
                        <GSEControl name="gse1" datSet="datSet" />
                        <ReportControl name="rp1" datSet="datSet" />
                    </LN0>
                    <LN prefix="prefix" lnClass="PTOC" inst="1" >
                        <DataSet name="datSet">
                            <FCDA desc="singleControl" ldInst="ldInst" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                            <FCDA ldInst="ldInst" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                        </DataSet>
                        <ReportControl name="rp1" datSet="datSet" />
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
    <IED name="subscriber">
        <AccessPoint name="AP1">
            <Server>
                <LDevice inst="ldInst">
                    <LN0 lnClass="LLN0">
                        <Inputs>
                            <ExtRef iedName="publisher" ldInst="ldInst" prefix="prefix" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" serviceType="GOOSE" srcLDInst="ldInst" srcLNClass="LLN0" srcCBName="gse1" />
                            <ExtRef iedName="publisher" ldInst="ldInst" prefix="prefix" lnClass="PTOC" lnInst="1" doName="Beh" daName="stVal" serviceType="Report" srcLDInst="ldInst" srcLNClass="LLN0" srcCBName="rp1" />
                            <ExtRef iedName="publisher" ldInst="ldInst" prefix="prefix" lnClass="PTOC" lnInst="1" doName="Beh" daName="q" />
                        </Inputs>
                    </LN0>
                    <LN prefix="prefix" lnClass="PTOC" inst="1" >
                        <Inputs>
                            <ExtRef iedName="publisher" ldInst="ldInst" prefix="" lnClass="LLN0" lnInst="" doName="Beh" daName="stVal" serviceType="Report" srcLDInst="ldInst" srcPrefix="prefix" srcLNClass="PTOC" srcLNInst="1" srcCBName="rp1" />
                        </Inputs>
                    </LN>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>
</SCL>
`;

const unlinked = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('FCDA[desc="unlinked"]')!;

const unsubscribed = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('FCDA[desc="unsubscribed"]')!;

const ed1type = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('FCDA[desc="ed1type"]')!;

const singleControl = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('FCDA[desc="singleControl"]')!;

const multiControl = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('FCDA[desc="multiControl"]')!;

const ied = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="subscriber"]')!;

const ln = new DOMParser()
  .parseFromString(scl, "application/xml")
  .querySelector('IED[name="subscriber"] LN')!;

describe("Utility function to check for subscription status", () => {
  it("return false when FCDA is not linked to control block", () =>
    expect(isSubscribed(unlinked, ied)).to.be.false);

  it("return false no valid subscription is found", () =>
    expect(isSubscribed(unsubscribed, ied)).to.be.false);

  it("return false no when ExtRef is outside scope", () =>
    expect(isSubscribed(multiControl, ln)).to.be.false);

  it("returns true for Ed1 type subscriptions", () =>
    expect(isSubscribed(ed1type, ied)).to.be.true);

  it("return true when subscription via one control block is found", () =>
    expect(isSubscribed(singleControl, ied)).to.be.true);

  it("return true when subscription via all control blocks are found", () =>
    expect(isSubscribed(multiControl, ied)).to.be.true);
});
