import { expect } from "vitest";

import {
  baseDataTypes,
  invalidDataTypeTemplates,
} from "./lNodeTypeToSelection.testfiles.js";

import { lNodeTypeToSelection } from "./lNodeTypeToSelection.js";

const mmxu = new DOMParser()
  .parseFromString(baseDataTypes, "text/xml")
  .querySelector("LNodeType[lnClass='MMXU']")!;

const tctr = new DOMParser()
  .parseFromString(invalidDataTypeTemplates, "text/xml")
  .querySelector("LNodeType[lnClass='TCTR']")!;

const mmxuSelection = {
  A: {
    phsA: {
      cVal: {
        ang: { f: {} },
        mag: { f: {} },
      },
    },
  },
  Beh: {
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    q: {},
    t: {},
  },
  Health: {
    stVal: {
      Alarm: {},
      Ok: {},
      Warning: {},
    },
    q: {},
    t: {},
  },
  Mod: {
    Cancel: {
      ctlVal: {
        blocked: {},
        off: {},
        on: {},
        test: {},
        "test/blocked": {},
      },
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          "automatic-station": {},
          "bay-control": {},
          maintenance: {},
          "not-supported": {},
          process: {},
          "remote-control": {},
          "station-control": {},
        },
        orIdent: {},
      },
      ctlNum: {},
      T: {},
      Test: {},
    },
    Oper: {
      ctlVal: {
        blocked: {},
        off: {},
        on: {},
        test: {},
        "test/blocked": {},
      },
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          "automatic-station": {},
          "bay-control": {},
          maintenance: {},
          "not-supported": {},
          process: {},
          "remote-control": {},
          "station-control": {},
        },
        orIdent: {},
      },
      ctlNum: {},
      T: {},
      Test: {},
      Check: {},
    },
    SBOw: {
      ctlVal: {
        blocked: {},
        off: {},
        on: {},
        test: {},
        "test/blocked": {},
      },
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          "automatic-station": {},
          "bay-control": {},
          maintenance: {},
          "not-supported": {},
          process: {},
          "remote-control": {},
          "station-control": {},
        },
        orIdent: {},
      },
      ctlNum: {},
      T: {},
      Test: {},
      Check: {},
    },
    ctlModel: {
      "direct-with-enhanced-security": {},
      "direct-with-normal-security": {},
      "sbo-with-enhanced-security": {},
      "sbo-with-normal-security": {},
      "status-only": {},
    },
    origin: {
      orCat: {
        "automatic-bay": {},
        "automatic-remote": {},
        "automatic-station": {},
        "bay-control": {},
        maintenance: {},
        "not-supported": {},
        process: {},
        "remote-control": {},
        "station-control": {},
      },
      orIdent: {},
    },
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    q: {},
    t: {},
    sboTimeout: {},
    operTimeout: {},
  },
  NamPlt: { vendor: {}, swRev: {}, d: {}, configRev: {}, ldNs: {} },
};

const invalidTctrSelection = {
  AmpSv: {
    instMag: {},
    q: {},
  },
  Beh: {
    some: {},
    stVal: {},
    t: {},
  },
  Mode: {},
};

describe("lNodeTypeToSelection", () => {
  it("returns correct selection for MMXU lNodeType", () =>
    expect(lNodeTypeToSelection(mmxu)).to.deep.equal(mmxuSelection));

  it("does not return any invalid data type structure", () =>
    expect(lNodeTypeToSelection(tctr)).to.deep.equal(invalidTctrSelection));
});
