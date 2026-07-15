import { expect } from "vitest";
import { findElement } from "../foundation/helpers.test.js";

import { findControlBlockSubscription } from "./findControlSubscription.js";

const exampleSCL = `<SCL>
  <IED name="sinkIED">
    <LDevice inst="ldInst">  
      <LN>
        <Inputs>
          <ExtRef iedName="srcIED" srcLDInst="ldInst" srcLNClass="LLN0" 
                srcCBName="gse" serviceType="GOOSE" />
        </Inputs>
      </LN>
      <LN>
        <Inputs>
          <ExtRef iedName="srcIED" srcLDInst="ldInst" srcPrefix="" srcLNClass="LLN0" 
                srcLNInst="" srcCBName="gse" serviceType="GOOSE" />
        </Inputs>
      </LN>
    </LDevice>
  </IED>
  <IED name="srcIED">
    <LDevice inst="ldInst">
      <LN0 lnClass="LLN0" inst="">
        <GSEControl name="gse" />
      </LN0>
    </LDevice>
  </IED>
</SCL`;

const smvStr = `<SampledValueControl name="smv" />`;
const smv = findElement(smvStr, "SampledValueControl")!;

const gse = findElement(exampleSCL, "GSEControl")!;

describe("findControlBlockSubscription", () => {
  it("return empty array for orphans control", () =>
    expect(findControlBlockSubscription(smv)).to.be.empty);

  it("return all subscribed extRef elements", () => {
    const extRefs = findControlBlockSubscription(gse);

    expect(extRefs.length).to.equal(2);
    for (const extRef of extRefs) expect(extRef.tagName).to.equal("ExtRef");
  });
});
