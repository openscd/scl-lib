import { expect } from "chai";

import { findElement } from "../foundation/helpers.test.js";

import {
  atccSelection,
  invalidSelection,
  ltrkSelection,
  mhaiSelection,
  mmxuSelection,
  ptocSelection,
  lln0Selection,
  ptrcSelection,
} from "./insertSelectedLNodeType.testdata.js";

import {
  incompleteAtccTypes,
  missingMmxuTypes,
  incompleteLtrkTypes,
  emptySSD,
} from "./insertSelectedDataType.testfiles.js";

import { insertSelectedLNodeType } from "./insertSelectedLNodeType.js";
import {
  CdcChildren,
  DaDescription,
  LNodeDescription,
  nsdToJson,
} from "./nsdToJson.js";

function cyrb64(str: string): string {
  /* eslint-disable no-bitwise */
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (h1 >>> 0).toString(16).padStart(8, "0")
  );
  /* eslint-enable no-bitwise */
}

const incompleteMmxu = findElement(missingMmxuTypes) as XMLDocument;
const imcompleteLtrk = findElement(incompleteLtrkTypes) as XMLDocument;
const incompleteAtcc = findElement(incompleteAtccTypes) as XMLDocument;
const missingDataTypes = findElement(emptySSD) as XMLDocument;

describe("insertLNodeTypeSelection", () => {
  it("is insensitive for invalid EnumTypes", () => {
    const data = nsdToJson("LLN0") as LNodeDescription;
    insertSelectedLNodeType(incompleteMmxu, invalidSelection, {
      class: "LLN0",
      data,
    });
  });

  it("insert MMXU LNodeType including missing sub data", () => {
    const edits = insertSelectedLNodeType(incompleteMmxu, mmxuSelection, {
      class: "MMXU",
    });

    expect(edits.length).to.equal(6);

    const lNodeType = edits[0].node as Element;
    expect(lNodeType.tagName).to.equal("LNodeType");
    expect(lNodeType.getAttribute("lnClass")).to.equal("MMXU");
    expect(lNodeType.getAttribute("id")).to.equal(
      "MMXU$oscd$_3f831c4c0fa5f6bd",
    );

    const doTypeCmv = edits[1].node as Element;
    expect(doTypeCmv.tagName).to.equal("DOType");
    expect(doTypeCmv.getAttribute("cdc")).to.equal("CMV");
    expect(doTypeCmv.getAttribute("id")).to.equal(
      "phsB$oscd$_3a6c99c1de0ca1c1",
    );

    const doTypeWye = edits[2].node as Element;
    expect(doTypeWye.tagName).to.equal("DOType");
    expect(doTypeWye.getAttribute("cdc")).to.equal("WYE");
    expect(doTypeWye.getAttribute("id")).to.equal("A$oscd$_bd01f85651a2b3ee");

    const daTypecVal = edits[3].node as Element;
    expect(daTypecVal.tagName).to.equal("DAType");
    expect(daTypecVal.getAttribute("id")).to.equal(
      "cVal$oscd$_21f679e08734a896",
    );

    const daTypeSBOw = edits[4].node as Element;
    expect(daTypeSBOw.tagName).to.equal("DAType");
    expect(daTypeSBOw.getAttribute("id")).to.equal(
      "SBOw$oscd$_264aab113bc4c3d7",
    );

    const enumType = edits[5].node as Element;
    expect(enumType.tagName).to.equal("EnumType");
    expect(enumType.getAttribute("id")).to.equal(
      "stVal$oscd$_48ba16345b8e7f5b",
    );
  });

  it("insert LTRK LNodeType including missing sub data", () => {
    const data = nsdToJson("LTRK") as LNodeDescription;
    const edits = insertSelectedLNodeType(imcompleteLtrk, ltrkSelection, {
      class: "LTRK",
      data,
    });

    expect(edits.length).to.equal(7);

    const lNodeType = edits[0].node as Element;
    expect(lNodeType.tagName).to.equal("LNodeType");
    expect(lNodeType.getAttribute("lnClass")).to.equal("LTRK");
    expect(lNodeType.getAttribute("id")).to.equal(
      "LTRK$oscd$_f8074960800758df",
    );

    const doTypeCmv = edits[1].node as Element;
    expect(doTypeCmv.tagName).to.equal("DOType");
    expect(doTypeCmv.getAttribute("cdc")).to.equal("CTS");
    expect(doTypeCmv.getAttribute("id")).to.equal(
      "ApcFTrk$oscd$_9039fc5f67d3778a",
    );

    const doTypeWye = edits[2].node as Element;
    expect(doTypeWye.tagName).to.equal("DOType");
    expect(doTypeWye.getAttribute("cdc")).to.equal("CTS");
    expect(doTypeWye.getAttribute("id")).to.equal(
      "ApcIntTrk$oscd$_0b6b0a301af5aa77",
    );

    const daTypecVal = edits[3].node as Element;
    expect(daTypecVal.tagName).to.equal("DAType");
    expect(daTypecVal.getAttribute("id")).to.equal(
      "ctlVal$oscd$_ed49c2f7a55ad05a",
    );

    const daTypeSBOw = edits[4].node as Element;
    expect(daTypeSBOw.tagName).to.equal("DAType");
    expect(daTypeSBOw.getAttribute("id")).to.equal(
      "ctlVal$oscd$_5a5af9e249dc7f84",
    );

    const enumTypeStVal = edits[5].node as Element;
    expect(enumTypeStVal.tagName).to.equal("EnumType");
    expect(enumTypeStVal.getAttribute("id")).to.equal(
      "stVal$oscd$_74dd2cc4b188b4ad",
    );

    const enumTypeOrCat = edits[6].node as Element;
    expect(enumTypeOrCat.tagName).to.equal("EnumType");
    expect(enumTypeOrCat.getAttribute("id")).to.equal(
      "orCat$oscd$_929ee017c8f9feb5",
    );
  });

  it("insert ATCC LNodeType including missing sub data", () => {
    const data = nsdToJson("ATCC") as LNodeDescription;
    const edits = insertSelectedLNodeType(incompleteAtcc, atccSelection, {
      class: "ATCC",
      data,
    });

    expect(edits.length).to.equal(5);

    const lNodeType = edits[0].node as Element;
    expect(lNodeType.tagName).to.equal("LNodeType");
    expect(lNodeType.getAttribute("lnClass")).to.equal("ATCC");
    expect(lNodeType.getAttribute("id")).to.equal(
      "ATCC$oscd$_f9d7914eb0ce0e92",
    );

    const doTypeCmv = edits[1].node as Element;
    expect(doTypeCmv.tagName).to.equal("DOType");
    expect(doTypeCmv.getAttribute("cdc")).to.equal("APC");
    expect(doTypeCmv.getAttribute("id")).to.equal(
      "VolSpt$oscd$_ef3a36fd78b41086",
    );

    const daTypecVal = edits[2].node as Element;
    expect(daTypecVal.tagName).to.equal("DAType");
    expect(daTypecVal.getAttribute("id")).to.equal(
      "SBOw$oscd$_61d7e600207c9456",
    );

    const daTypeSBOw = edits[3].node as Element;
    expect(daTypeSBOw.tagName).to.equal("DAType");
    expect(daTypeSBOw.getAttribute("id")).to.equal(
      "Oper$oscd$_5b11d63fa0ade588",
    );

    const enumTypeOrCat = edits[4].node as Element;
    expect(enumTypeOrCat.tagName).to.equal("EnumType");
    expect(enumTypeOrCat.getAttribute("id")).to.equal(
      "ctlModel$oscd$_e975941313cb546c",
    );
  });

  it("insert DataTypeTemplates when missing", () => {
    const data = nsdToJson("ATCC") as LNodeDescription;
    const edits = insertSelectedLNodeType(missingDataTypes, atccSelection, {
      class: "ATCC",
      desc: "SomeDesc",
      data,
    });

    expect(edits.length).to.equal(19);

    const lNodeType = edits[0].node as Element;
    expect(lNodeType.tagName).to.equal("DataTypeTemplates");
  });

  it("add count attribute to data attribute in case is an array", () => {
    const data = nsdToJson("PTOC") as LNodeDescription;
    const edits = insertSelectedLNodeType(missingDataTypes, ptocSelection, {
      class: "PTOC",
      data,
    });

    const doTypeEdit = edits[5].node as Element;
    expect(
      doTypeEdit.querySelector('DA[name="crvPts"]')?.getAttribute("count"),
    ).to.equal("maxPts");
  });

  it("add count attribute to sub data object in case is an array", () => {
    const data = nsdToJson("MHAI") as LNodeDescription;
    const edits = insertSelectedLNodeType(missingDataTypes, mhaiSelection, {
      class: "MHAI",
      data,
    });

    const doTypeEdit = edits[4].node as Element;
    expect(
      doTypeEdit.querySelector('SDO[name="phsAHar"]')?.getAttribute("count"),
    ).to.equal("maxPts");
  });

  it("add user defined data object", () => {
    const lnData = nsdToJson("LLN0") as LNodeDescription;
    const userData = nsdToJson("SPS") as CdcChildren;
    (userData["dataNs"] as DaDescription).mandatory = true;
    (userData["dataNs"] as DaDescription).val = "TestNameSpace-1-d-1234567890";

    const cdcDescription = {
      tagName: "DataObject",
      type: "SPS",
      descID: "",
      presCond: "O",
      children: userData,
    };

    Object.assign(lnData, {
      ["TestDo"]: cdcDescription,
    });

    const edits = insertSelectedLNodeType(missingDataTypes, lln0Selection, {
      class: "LLN0",
      data: lnData,
    });

    expect(edits.length).to.equal(5);
    expect(
      (edits[3].node as Element).querySelector('DA[name="dataNs"] > Val')
        ?.textContent,
    ).to.equal("TestNameSpace-1-d-1234567890");
  });

  it("set user defined LNodeType.id", () => {
    const id = cyrb64("TestFile");
    const edits = insertSelectedLNodeType(missingDataTypes, ptrcSelection, {
      class: "PTRC",
      id,
    });

    expect(edits.length).to.equal(4);
    expect((edits[1].node as Element).getAttribute("id")).to.equal(
      "96ba6481aba181d8",
    );
    expect((edits[2].node as Element).getAttribute("id")).to.equal(
      "Beh$oscd$_c6ed035c8137b35a",
    );
    expect((edits[3].node as Element).getAttribute("id")).to.equal(
      "stVal$oscd$_48ba16345b8e7f5b",
    );
  });
});
