export const mmxuSelection = {
  Beh: {
    q: {},
    stVal: {
      off: {},
      blocked: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    t: {},
  },
  A: {
    phsA: {
      cVal: {
        mag: {
          f: {},
        },
        ang: {
          f: {},
        },
      },
      q: {},
      t: {},
    },
    phsB: {
      cVal: {
        ang: {
          f: {},
        },
        mag: {
          f: {},
        },
      },
      q: {},
      t: {},
      instCVal: {
        mag: {
          f: {},
        },
        ang: {
          f: {},
        },
      },
      units: {
        SIUnit: {
          "": {},
          "°C": {},
          "1/s": {},
          A: {},
          "A/V": {},
          "A/Vs": {},
          "A²": {},
          "A²t": {},
          As: {},
          Bq: {},
          C: {},
          cd: {},
          char: {},
          "char/s": {},
          "cos(phi)": {},
          dB: {},
          dBm: {},
          deg: {},
          F: {},
          Gy: {},
          h: {},
          H: {},
          Hz: {},
          "Hz/s": {},
          J: {},
          "J/K": {},
          "J/kg K": {},
          "J/m²": {},
          "J/Wh": {},
          K: {},
          "K/s": {},
          kg: {},
          "kg/m³": {},
          "kgm²": {},
          "l/s": {},
          Lm: {},
          lx: {},
          m: {},
          M: {},
          "m/m³": {},
          "m/s": {},
          "m/s²": {},
          "m²": {},
          "m²/s": {},
          "m³": {},
          "m³/s": {},
          min: {},
          mol: {},
          N: {},
          ohm: {},
          "Ohm/m": {},
          Pa: {},
          "Pa/s": {},
          "percent/s": {},
          phi: {},
          ppm: {},
          rad: {},
          "rad/s": {},
          s: {},
          S: {},
          "S/m": {},
          sr: {},
          Sv: {},
          T: {},
          V: {},
          "V/Hz": {},
          "V²": {},
          VA: {},
          VAh: {},
          VAr: {},
          VArh: {},
          Vs: {},
          W: {},
          "W/m K": {},
          "W/m²": {},
          "W/s": {},
          Watts: {},
          Wb: {},
          Wh: {},
        },
      },
    },
    phsC: {
      cVal: {
        mag: {
          f: {},
        },
        ang: {
          f: {},
        },
      },
      q: {},
      t: {},
      zeroDb: {},
      zeroDbRef: {},
    },
  },
  Mod: {
    q: {},
    stVal: {
      on: {},
    },
    t: {},
    ctlModel: {
      "sbo-with-enhanced-security": {},
    },
    sboTimeout: {},
    SBOw: {
      Check: {},
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          "automatic-station": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
    Oper: {
      Check: {},
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          "not-supported": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
    Cancel: {
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
          "automatic-remote": {},
          maintenance: {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
  },
};

export const ltrkSelection = {
  Beh: {
    q: {},
    stVal: { on: {} },
    t: {},
  },
  ApcFTrk: {
    Check: {},
    ctlNum: {},
    ctlVal: { f: {} },
    errorCode: {
      "access-not-allowed-in-current-state": {},
      "access-violation": {},
    },
    objRef: {},
    origin: {
      orCat: {
        "automatic-bay": {},
        "automatic-remote": {},
      },
      orIdent: {},
    },
    respAddCause: {
      "1-of-n-control": {},
      "Abortion-by-cancel": {},
    },
    serviceType: {
      Abort: {},
      Associate: {},
    },
    t: {},
    T: {},
    Test: {},
  },
  ApcIntTrk: {
    Check: {},
    ctlNum: {},
    ctlVal: { i: {} },
    errorCode: {
      "access-not-allowed-in-current-state": {},
      "access-violation": {},
    },
    objRef: {},
    origin: {
      orCat: {
        "automatic-bay": {},
        "automatic-remote": {},
      },
      orIdent: {},
    },
    respAddCause: {
      "1-of-n-control": {},
      "Abortion-by-cancel": {},
    },
    serviceType: {
      Abort: {},
      Associate: {},
    },
    t: {},
    T: {},
    Test: {},
  },
};

export const atccSelection = {
  Beh: {
    q: {},
    stVal: {
      blocked: {},
    },
    t: {},
  },
  VolSpt: {
    ctlModel: {
      "sbo-with-enhanced-security": {},
    },
    dbRef: {},
    Cancel: {
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
    mxVal: {
      f: {},
    },
    Oper: {
      Check: {},
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
    SBOw: {
      Check: {},
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-bay": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
  },
  BndCtrChg: {
    ctlModel: {
      "direct-with-enhanced-security": {},
    },
    dbRef: {},
    persistent: {},
    Cancel: {
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-remote": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
    mxVal: {
      i: {},
    },
    Oper: {
      Check: {},
      ctlNum: {},
      ctlVal: {},
      origin: {
        orCat: {
          "automatic-remote": {},
        },
        orIdent: {},
      },
      T: {},
      Test: {},
    },
  },
};

export const invalidSelection = {
  Mod: {
    Oper: {
      ctlVal: {
        on: {},
        blocked: {},
        test: {},
        "test/blocked": {},
      },
      origin: {
        orCat: {
          "not-supported": {},
          "bay-control": {},
          "station-control": {},
          "remote-control": {},
          "automatic-bay": {},
          "automatic-station": {},
          "automatic-remote": {},
          maintenance: {},
          process: {},
        },
        orIdent: {},
      },
      ctlNum: {},
      T: {},
      Test: {},
      Check: {},
    },
    stVal: {
      on: {},
      blocked: {},
      test: {},
      "test/blocked": {},
    },
    q: {},
    t: {},
    ctlModel: {
      "status-only": {},
      "direct-with-normal-security": {},
    },
  },
  Beh: {
    stVal: {
      on: {},
      blocked: {},
      test: {},
      "test/blocked": {},
      off: {},
    },
    q: {},
    t: {},
  },
  Health: {
    stVal: {
      Waiting: {},
      Test: {},
      Ok: {},
      Warning: {},
      Alarm: {},
    },
    q: {},
    t: {},
  },
  NamPlt: {
    vendor: {},
    swRev: {},
    d: {},
    configRev: {},
    paramRev: {},
    valRev: {},
    ldNs: {},
  },
};

export const ptocSelection = {
  Beh: {
    q: {},
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    t: {},
  },
  Op: {
    general: {},
    q: {},
    t: {},
  },
  Str: {
    dirGeneral: {
      backward: {},
      both: {},
      forward: {},
      unknown: {},
    },
    general: {},
    q: {},
    t: {},
  },
  TmAChr: {
    crvPts: {
      xVal: {},
      yVal: {},
    },
    maxPts: {},
    numPts: {},
    xD: {},
    yD: {},
    yUnits: {
      SIUnit: {
        "°C": {},
        "1/s": {},
      },
    },
    xUnits: {
      SIUnit: {
        "°C": {},
        "1/s": {},
      },
    },
  },
};

export const mhaiSelection = {
  Beh: {
    q: {},
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    t: {},
  },
  HA: {
    evalTm: {},
    frequency: {},
    maxPts: {},
    numCyc: {},
    numHar: {},
    phsAHar: {
      cVal: {
        mag: {
          f: {},
        },
        ang: {
          f: {},
        },
      },
      q: {},
      t: {},
    },
  },
};

export const lln0Selection = {
  Beh: {
    q: {},
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    t: {},
  },
  TestDo: {
    stVal: {},
    q: {},
    t: {},
    dataNs: {},
  },
};

export const ptrcSelection = {
  Beh: {
    q: {},
    stVal: {
      blocked: {},
      off: {},
      on: {},
      test: {},
      "test/blocked": {},
    },
    t: {},
  },
};
