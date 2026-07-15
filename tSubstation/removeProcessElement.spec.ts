import { expect } from "vitest";

import { findElement } from "../foundation/helpers.test.js";

import { substation } from "./removeProcessElement.testfile.js";
import { removeProcessElement } from "./removeProcessElement.js";

const aa1e1bb1 = findElement(
  substation,
  'Substation[name="AA1"]>VoltageLevel[name="E1"]>Bay[name="BB1"]',
) as Element;

const aa1ptr1 = findElement(
  substation,
  'Substation[name="AA1"]>PowerTransformer[name="PTR1"]',
) as Element;

const aa1e1q01qa1 = findElement(
  substation,
  'Substation[name="AA1"]>VoltageLevel[name="E1"]>Bay[name="Q01"]>ConductingEquipment[name="QA1"]',
) as Element;

const aa1 = findElement(substation, 'Substation[name="AA1"]') as Element;

describe("remove process elements", () => {
  it("remove orphan Terminal with removing bus bars", () => {
    const removes = removeProcessElement({ node: aa1e1bb1 });
    expect(removes.length).to.equal(4);
    expect((removes[1].node as Element).tagName).to.equal("Terminal");
    expect((removes[2].node as Element).tagName).to.equal("Terminal");
    expect((removes[3].node as Element).tagName).to.equal("Terminal");
  });

  it("doe not ever remove bub bars ConnectivityNode", () => {
    const removes = removeProcessElement({ node: aa1ptr1 });
    expect(removes.length).to.equal(1);
    expect(removes[0].node).to.equal(aa1ptr1);
  });

  it("remove orphan ConnectivityNode ", () => {
    const removes = removeProcessElement({ node: aa1e1q01qa1 });
    expect(removes.length).to.equal(2);
    expect((removes[1].node as Element).tagName).to.equal("ConnectivityNode");
  });

  it("does only consider left over orphan ConnectivityNode and Terminal ", () => {
    const removes = removeProcessElement({ node: aa1 });
    expect(removes.length).to.equal(1);
  });
});
