import { expect } from "vitest";

import { lnInstGenerator } from "./lnInstGenerator";

describe("Generator function for `inst` and `lnInst` attributes", () => {
  describe("For element with `tagName` `LNode`", () => {
    describe("with existing unique lnInst", () => {
      let generator: (lnClass: string) => string | undefined;

      beforeEach(() => {
        const parent = new DOMParser().parseFromString(
          `<Function name="someName">
                  <LNode name="None" lnClass="CSWI" lnInst="1"/>
                  <LNode name="None" lnClass="XCBR" lnInst="1"/>
                  <LNode name="None" lnClass="CILO" lnInst="1"/>
                  <LNode name="None" lnClass="CSWI" lnInst="2"/>
                  <LNode name="None" lnClass="PDIS" lnInst="1"/>
                  <LNode name="None" lnClass="CSWI" lnInst="5"/>
                  <LNode name="None" lnClass="CSWI" lnInst="6"/>
                  <LNode name="None" lnClass="CSWI" lnInst="8"/>
                </Function>`,
          "application/xml",
        ).documentElement;

        generator = lnInstGenerator(parent, "LNode");
      });

      it("returns unique lnInst called once", () =>
        expect(generator("CSWI")).to.equal("3"));

      it("returns unique lnInst called several times", () => {
        expect(generator("CSWI")).to.equal("3");
        expect(generator("CSWI")).to.equal("4");
        expect(generator("CSWI")).to.equal("7");
        expect(generator("CSWI")).to.equal("9");
      });
    });

    describe("with missing unique lnInst for lnClass PDIS", () => {
      let generator: (lnClass: string) => string | undefined;

      beforeEach(() => {
        const parent = new DOMParser().parseFromString(
          `<Function name="someName">
                </Function>`,
          "application/xml",
        ).documentElement;

        for (let i = 1; i <= 99; i++) {
          const lNode = new DOMParser().parseFromString(
            `<LNode iedName="None" lnClass="PDIS" lnInst="${i}" />`,
            "application/xml",
          ).documentElement;
          parent.appendChild(lNode);
        }

        generator = lnInstGenerator(parent, "LNode");
      });

      it("return undefined for the lnClass PDIS", () =>
        expect(generator("PDIS")).to.be.undefined);

      it("return unique lnInst for another lnClass", () =>
        expect(generator("CSWI")).to.equal("1"));
    });
  });

  describe("For element with `tagName` `LN`", () => {
    describe("with existing unique inst", () => {
      let generator: (lnClass: string) => string | undefined;

      beforeEach(() => {
        const parent = new DOMParser().parseFromString(
          `<LDevice inst="someInst">
                <LN prefix="SubSup" lnClass="LGOS" inst="1"/>
                <LN prefix="SubSup" lnClass="LSVS" inst="1"/>
                <LN lnClass="CILO" lnInst="1"/>
                <LN prefix="SubSup" lnClass="LGOS" inst="2"/>
                <LN lnClass="PDIS" lnInst="1"/>
                <LN prefix="SubSup" lnClass="LGOS" inst="5"/>
                <LN prefix="SubSup" lnClass="LGOS" inst="6"/>
                <LN prefix="SubSup" lnClass="LGOS" inst="8"/>
            </LDevice>`,
          "application/xml",
        ).documentElement;

        generator = lnInstGenerator(parent, "LN");
      });

      it("returns unique inst called once", () =>
        expect(generator("LGOS")).to.equal("3"));

      it("returns unique inst called several times", () => {
        expect(generator("LGOS")).to.equal("3");
        expect(generator("LGOS")).to.equal("4");
        expect(generator("LGOS")).to.equal("7");
        expect(generator("LGOS")).to.equal("9");
      });
    });

    describe("with missing unique lnInst for lnClass LGOS", () => {
      let generator: (lnClass: string) => string | undefined;

      beforeEach(() => {
        const parent = new DOMParser().parseFromString(
          `<LDevice name="someInst">
            </LDevice>`,
          "application/xml",
        ).documentElement;

        for (let i = 1; i <= 99; i++) {
          const lNode = new DOMParser().parseFromString(
            `<LN prefix="SubSub" lnClass="LGOS" inst="${i}" />`,
            "application/xml",
          ).documentElement;
          parent.appendChild(lNode);
        }

        generator = lnInstGenerator(parent, "LN");
      });

      it("return undefined for the lnClass LGOS", () =>
        expect(generator("LGOS")).to.be.undefined);

      it("return unique lnInst for another lnClass", () =>
        expect(generator("CSWI")).to.equal("1"));
    });
  });
});
