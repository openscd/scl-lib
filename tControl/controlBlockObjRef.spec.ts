import { expect } from "vitest";

import { findElement } from "../foundation/helpers.test.js";
import { controlBlockObjRef } from "./controlBlockObjRef.js";

const orphanControlBlock = `
    <GSEControl name="someCbName" datSet="someDatSet" />
    `;

const singleIedWithCtrlBlocks = `
    <SCL version="2007">
    <IED name="someIED">
        <AccessPoint name="someAP">
            <Server>
                <LDevice inst="someLDevice">
                    <LN0 lnClass="LLN0" inst="" lnType="someLnType">
                        <GSEControl name="gseControl" />
                        <SampledValueControl name="smvControl" />
                    </LN0>
                    <LN0 prefix="II_" lnClass="PTOC" inst="1" lnType="someLnType">
                        <ReportControl name="rpControl" />
                    </LN0>
                </LDevice>
            </Server>
        </AccessPoint>
    </IED>`;

describe("Function generating a control block reference", () => {
  it("return null for orphan control block", () =>
    expect(controlBlockObjRef(findElement(orphanControlBlock, "GSEControl")!))
      .to.be.null);

  it("return correct object reference for GSEControl element", () =>
    expect(
      controlBlockObjRef(findElement(singleIedWithCtrlBlocks, "GSEControl")!),
    ).to.equal("someIEDsomeLDevice/LLN0.gseControl"));

  it("return correct object reference for ReportControl element", () =>
    expect(
      controlBlockObjRef(
        findElement(singleIedWithCtrlBlocks, "ReportControl")!,
      ),
    ).to.equal("someIEDsomeLDevice/II_PTOC1.rpControl"));

  it("return correct object reference for SampledValueControl element", () =>
    expect(
      controlBlockObjRef(
        findElement(singleIedWithCtrlBlocks, "SampledValueControl")!,
      ),
    ).to.equal("someIEDsomeLDevice/LLN0.smvControl"));
});
