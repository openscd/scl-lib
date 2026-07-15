import { expect } from "vitest";

import { macAddressGenerator } from "./macAddressGenerator.js";

function convertToMac(mac: number): string {
  const str = 0 + mac.toString(16).toUpperCase();
  const arr = str.match(/.{1,2}/g)!;
  return arr.join("-");
}

describe("MAC-Address generator function", () => {
  let macGenerator: () => string | null;
  let doc: XMLDocument;

  describe("for GSE elements", () => {
    const maxGseMacAddress = 0x010ccd0101ff;
    const minGseMacAddress = 0x010ccd010000;

    const gseMacRange = Array(maxGseMacAddress - minGseMacAddress)
      .fill(1)
      .map((_, i) => convertToMac(minGseMacAddress + i));

    const maxedMacAddress = new DOMParser().parseFromString(
      `<ConnectedAP>
          ${gseMacRange.map(
            (mac) =>
              `<GSE><Address><P type="MAC-Address">${mac}</P></Address></GSE>`,
          )}
        </ConnectedAP>`,
      "application/xml",
    );

    beforeEach(() => {
      doc = new DOMParser().parseFromString(
        `<ConnectedAP>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-00</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-01</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-02</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-04</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-06</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-07</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-08</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-09</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-10</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-12</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-13</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-14</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-15</P></Address></GSE>
              <GSE><Address><P type="MAC-Address">01-0C-CD-01-00-0F</P></Address></GSE>
          </ConnectedAP>`,
        "application/xml",
      );

      macGenerator = macAddressGenerator(doc, "GSE");
    });

    it("returns unique MAC-Address", () =>
      expect(macGenerator()).to.equal("01-0C-CD-01-00-03"));

    it("always returns unique MAC-Address", () => {
      expect(macGenerator()).to.equal("01-0C-CD-01-00-03");
      expect(macGenerator()).to.equal("01-0C-CD-01-00-05");
      expect(macGenerator()).to.equal("01-0C-CD-01-00-0A");
      expect(macGenerator()).to.equal("01-0C-CD-01-00-0B");
    });

    it("returns null with no unique MAC-Address left", () => {
      macGenerator = macAddressGenerator(maxedMacAddress, "GSE");
      expect(macGenerator()).to.equal(null);
    });
  });

  describe("for SMV elements", () => {
    const maxSmvMacAddress = 0x010ccd0401ff;
    const minSmvMacAddress = 0x010ccd040000;

    const smvMacRange = Array(maxSmvMacAddress - minSmvMacAddress)
      .fill(1)
      .map((_, i) => convertToMac(minSmvMacAddress + i));

    const maxedMacAddress = new DOMParser().parseFromString(
      `<ConnectedAP>
          ${smvMacRange.map(
            (mac) =>
              `<SMV><Address><P type="MAC-Address">${mac}</P></Address></SMV>`,
          )}
        </ConnectedAP>`,
      "application/xml",
    );

    beforeEach(() => {
      doc = new DOMParser().parseFromString(
        `<ConnectedAP>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-00</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-01</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-02</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-03</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-06</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-07</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-08</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-09</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-10</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-12</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-13</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-14</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-15</P></Address></SMV>
              <SMV><Address><P type="MAC-Address">01-0C-CD-04-00-0B</P></Address></SMV>
          </ConnectedAP>`,
        "application/xml",
      );

      macGenerator = macAddressGenerator(doc, "SMV");
    });

    it("returns unique MAC-Address", () =>
      expect(macGenerator()).to.equal("01-0C-CD-04-00-04"));

    it("always returns unique MAC-Address", () => {
      expect(macGenerator()).to.equal("01-0C-CD-04-00-04");
      expect(macGenerator()).to.equal("01-0C-CD-04-00-05");
      expect(macGenerator()).to.equal("01-0C-CD-04-00-0A");
      expect(macGenerator()).to.equal("01-0C-CD-04-00-0C");
    });

    it("returns null with no unique MAC-Address left", () => {
      macGenerator = macAddressGenerator(maxedMacAddress, "SMV");
      expect(macGenerator()).to.equal(null);
    });
  });
});
