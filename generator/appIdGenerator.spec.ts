import { expect } from "vitest";

import { appIdGenerator } from "./appIdGenerator.js";

describe("APPID generator function", () => {
  let appidGenerator: () => string | null;
  let doc: XMLDocument;

  describe("for GSE elements Type1B (default)", () => {
    const maxGseAppId = 0x3fff;
    const minGseAppId = 0x0000;

    const gseAppIdRange = Array(maxGseAppId - minGseAppId)
      .fill(1)
      .map((_, i) =>
        (minGseAppId + i).toString(16).toUpperCase().padStart(4, "0"),
      );

    const maxedAppIds = new DOMParser().parseFromString(
      `<ConnectedAP>
            ${gseAppIdRange.map(
              (appId) =>
                `<GSE><Address><P type="APPID">${appId}</P></Address></GSE>`,
            )}
          </ConnectedAP>`,
      "application/xml",
    );

    beforeEach(() => {
      doc = new DOMParser().parseFromString(
        `<ConnectedAP>
                <GSE><Address><P type="APPID">0001</P></Address></GSE>
                <GSE><Address><P type="APPID">0002</P></Address></GSE>
                <GSE><Address><P type="APPID">0004</P></Address></GSE>
                <GSE><Address><P type="APPID">0005</P></Address></GSE>
                <GSE><Address><P type="APPID">0006</P></Address></GSE>
                <GSE><Address><P type="APPID">0007</P></Address></GSE>
                <GSE><Address><P type="APPID">0008</P></Address></GSE>
                <GSE><Address><P type="APPID">0009</P></Address></GSE>
                <GSE><Address><P type="APPID">000A</P></Address></GSE>
                <GSE><Address><P type="APPID">000C</P></Address></GSE>
                <GSE><Address><P type="APPID">000E</P></Address></GSE>
                <GSE><Address><P type="APPID">000F</P></Address></GSE>
                <GSE><Address><P type="APPID">0010</P></Address></GSE>
            </ConnectedAP>`,
        "application/xml",
      );

      appidGenerator = appIdGenerator(doc, "GSE");
    });

    it("returns unique APPID", () => expect(appidGenerator()).to.equal("0000"));

    it("always returns unique APPID", () => {
      expect(appidGenerator()).to.equal("0000");
      expect(appidGenerator()).to.equal("0003");
      expect(appidGenerator()).to.equal("000B");
      expect(appidGenerator()).to.equal("000D");
      expect(appidGenerator()).to.equal("0011");
    });

    it("returns null with no unique APPID left", () => {
      appidGenerator = appIdGenerator(maxedAppIds, "GSE");
      expect(appidGenerator()).to.equal(null);
    });
  });

  describe("for GSE elements Type1A (Trip)", () => {
    // APPID range for Type1A(Trip) GOOSE acc. IEC 61850-8-1
    const maxGseTripAppId = 0xbfff;
    const minGseTripAppId = 0x8000;

    const gseTripAppIdRange = Array(maxGseTripAppId - minGseTripAppId)
      .fill(1)
      .map((_, i) =>
        (minGseTripAppId + i).toString(16).toUpperCase().padStart(4, "0"),
      );

    const maxedAppIds = new DOMParser().parseFromString(
      `<ConnectedAP>
              ${gseTripAppIdRange.map(
                (appId) =>
                  `<GSE><Address><P type="APPID">${appId}</P></Address></GSE>`,
              )}
            </ConnectedAP>`,
      "application/xml",
    );

    beforeEach(() => {
      doc = new DOMParser().parseFromString(
        `<ConnectedAP>
                <GSE><Address><P type="APPID">8001</P></Address></GSE>
                <GSE><Address><P type="APPID">8002</P></Address></GSE>
                <GSE><Address><P type="APPID">8004</P></Address></GSE>
                <GSE><Address><P type="APPID">8005</P></Address></GSE>
                <GSE><Address><P type="APPID">8006</P></Address></GSE>
                <GSE><Address><P type="APPID">8007</P></Address></GSE>
                <GSE><Address><P type="APPID">8008</P></Address></GSE>
                <GSE><Address><P type="APPID">8009</P></Address></GSE>
                <GSE><Address><P type="APPID">800A</P></Address></GSE>
                <GSE><Address><P type="APPID">800C</P></Address></GSE>
                <GSE><Address><P type="APPID">800E</P></Address></GSE>
                <GSE><Address><P type="APPID">800F</P></Address></GSE>
                <GSE><Address><P type="APPID">8010</P></Address></GSE>
            </ConnectedAP>`,
        "application/xml",
      );

      appidGenerator = appIdGenerator(doc, "GSE", true);
    });

    it("returns unique APPID", () => expect(appidGenerator()).to.equal("8000"));

    it("always returns unique APPID", () => {
      expect(appidGenerator()).to.equal("8000");
      expect(appidGenerator()).to.equal("8003");
      expect(appidGenerator()).to.equal("800B");
      expect(appidGenerator()).to.equal("800D");
      expect(appidGenerator()).to.equal("8011");
    });

    it("returns null with no unique APPID left", () => {
      appidGenerator = appIdGenerator(maxedAppIds, "GSE", true);
      expect(appidGenerator()).to.equal(null);
    });
  });

  describe("for SMV elements", () => {
    const maxSmvAppId = 0x7fff;
    const minSmvAppId = 0x4000;

    const smvAppIdRange = Array(maxSmvAppId - minSmvAppId)
      .fill(1)
      .map((_, i) =>
        (minSmvAppId + i).toString(16).toUpperCase().padStart(4, "0"),
      );

    const maxedAppIds = new DOMParser().parseFromString(
      `<ConnectedAP>
                ${smvAppIdRange.map(
                  (appId) =>
                    `<SMV><Address><P type="APPID">${appId}</P></Address></SMV>`,
                )}
              </ConnectedAP>`,
      "application/xml",
    );

    beforeEach(() => {
      doc = new DOMParser().parseFromString(
        `<ConnectedAP>
              <SMV><Address><P type="APPID">4000</P></Address></SMV>
              <SMV><Address><P type="APPID">4001</P></Address></SMV>
              <SMV><Address><P type="APPID">4002</P></Address></SMV>
              <SMV><Address><P type="APPID">4004</P></Address></SMV>
              <SMV><Address><P type="APPID">4005</P></Address></SMV>
              <SMV><Address><P type="APPID">4007</P></Address></SMV>
              <SMV><Address><P type="APPID">4009</P></Address></SMV>
              <SMV><Address><P type="APPID">400A</P></Address></SMV>
              <SMV><Address><P type="APPID">400B</P></Address></SMV>
              <SMV><Address><P type="APPID">400D</P></Address></SMV>
              <SMV><Address><P type="APPID">400E</P></Address></SMV>
              <SMV><Address><P type="APPID">4011</P></Address></SMV>
              <SMV><Address><P type="APPID">4009</P></Address></SMV>
            </ConnectedAP>`,
        "application/xml",
      );

      appidGenerator = appIdGenerator(doc, "SMV");
    });

    it("returns unique APPID", () => expect(appidGenerator()).to.equal("4003"));

    it("always returns unique APPID", () => {
      expect(appidGenerator()).to.equal("4003");
      expect(appidGenerator()).to.equal("4006");
      expect(appidGenerator()).to.equal("4008");
      expect(appidGenerator()).to.equal("400C");
    });

    it("returns null with no unique APPID left", () => {
      appidGenerator = appIdGenerator(maxedAppIds, "SMV");
      expect(appidGenerator()).to.equal(null);
    });
  });
});
