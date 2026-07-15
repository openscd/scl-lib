/**
 * Basis is a copy from www.github.com/openenergytools/oscd-template-generator
 * originally written by ca-d, thx Chris. Code has been modified!
 */
import { Insert } from "@openscd/oscd-api";

import { LNodeDescription, nsdToJson } from "./nsdToJson.js";
import { createElement, TreeSelection } from "../foundation/utils.js";
import { getReference } from "../tBaseElement/getReference.js";
import { hashElement } from "./foundation.js";

type Templates = {
  EnumType: Element[];
  DAType: Element[];
  DOType: Element[];
  LNodeType: Element[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function data(lnData: any, path: string[]): any {
  let d = lnData;
  for (const slug of path.slice(0, -1)) d = d[slug].children;

  return d[path[path.length - 1]];
}

/**
 * Creates a new data type `LNodeType` based on a user selection.
 * @param doc - the XML document to add the `LNodeType` to
 * @param selection - The user selection as a tree object
 * @param logicalnode - the logical node class and its JSON data structure of the `LNodeType`
 * @returns an array of inserts for the `LNodeType` and the missing subs data
 */
export function insertSelectedLNodeType(
  doc: XMLDocument,
  selection: TreeSelection,
  logicalnode: {
    class: string;
    desc?: string;
    id?: string;
    data?: LNodeDescription;
  },
): Insert[] {
  const types = new Set<string>();
  const elements: Templates = {
    LNodeType: [],
    DOType: [],
    DAType: [],
    EnumType: [],
  };

  const lnData = logicalnode.data ?? nsdToJson(logicalnode.class);
  const lnClass = logicalnode.class;
  const desc = logicalnode.desc ?? null;

  function isUnknownId(id: string): boolean {
    const alreadyCreate = types.has(id);
    const alreadyExist = !!doc.querySelector(
      `:root > DataTypeTemplates > *[id="${id}"]`,
    );

    return !alreadyCreate && !alreadyExist;
  }

  function identify(element: Element, name: string, userId?: string): string {
    const hash = hashElement(element);
    const id = userId ?? `${name}$oscd$_${hash}`;

    element.setAttribute("id", id);
    if (isUnknownId(id)) {
      types.add(id);
      elements[
        element.tagName as "LNodeType" | "DOType" | "DAType" | "EnumType"
      ]?.push(element);
    }

    return id;
  }

  const lnType = createElement(doc, "LNodeType", { lnClass, desc });

  function createEnumType(path: string[], sel: TreeSelection): string {
    const enumData = data(lnData, path).children;

    const vals: Element[] = [];

    for (const content of Object.keys(sel)) {
      const enumVal = enumData[content];
      if (!enumVal) continue; // check for invalid selection

      const ord = enumVal.literalVal;
      const val = createElement(doc, "EnumVal", { ord });
      val.textContent = content;
      vals.push(val);
    }

    vals.sort(
      (v1, v2) =>
        parseInt(v1.getAttribute("ord")!, 10) -
        parseInt(v2.getAttribute("ord")!, 10),
    );

    const enumType = createElement(doc, "EnumType", {});
    vals.forEach((val) => enumType.append(val));

    const dataName = path[path.length - 1];
    return identify(enumType, dataName);
  }

  function createDAType(
    path: string[],
    selection: TreeSelection,
    underlyingValSel: TreeSelection = {}, // For Oper.ctlVal, SBOw.ctlVal and Cancel.ctlVal
  ): string {
    const { children, underlyingTypeKind, underlyingType } = data(lnData, path);

    const daType = createElement(doc, "DAType", {});

    for (const [name, dep] of Object.entries(children) as [
      string,
      {
        tagName: string;
        transient?: string;
        fc: string;
        dchg?: string;
        dupd?: string;
        qchg?: string;
        typeKind?: "BASIC" | "ENUMERATED" | "CONSTRUCTED" | "undefined";
        type?: string;
      },
    ][]) {
      if (!selection[name]) continue;

      const bda = createElement(doc, "BDA", { name });

      if (dep.typeKind === "BASIC" || !dep.typeKind) {
        bda.setAttribute("bType", dep.type!);
      }

      if (dep.typeKind === "ENUMERATED") {
        const enumId = createEnumType(path.concat([name]), selection[name]);
        bda.setAttribute("bType", "Enum");
        bda.setAttribute("type", enumId);
      }

      if (dep.typeKind === "CONSTRUCTED") {
        const daId = createDAType(
          path.concat([name]),
          selection[name],
          underlyingValSel,
        );
        bda.setAttribute("bType", "Struct");
        bda.setAttribute("type", daId);
      }

      // For Oper, SBOw and Cancel only
      if (dep.typeKind === "undefined") {
        if (underlyingTypeKind === "BASIC")
          // For all but APC and ENC
          bda.setAttribute("bType", underlyingType);
        else if (underlyingTypeKind === "ENUMERATED") {
          // For ENC type ->  enumeration is equal to parent stVal
          const enumId = createEnumType(
            path.slice(0, -1).concat(["stVal"]),
            underlyingValSel,
          );
          bda.setAttribute("bType", "Enum");
          bda.setAttribute("type", enumId);
        } else if (underlyingTypeKind === "CONSTRUCTED") {
          // For APC type -> AnalogueValue is equal to parent mxVal
          const daId = createDAType(
            path.slice(0, -1).concat(["mxVal"]),
            underlyingValSel,
          );
          bda.setAttribute("bType", "Struct");
          bda.setAttribute("type", daId);
        }
      }

      daType.append(bda);
    }

    return identify(daType, path[path.length - 1]);
  }

  function createDOType(path: string[], selection: TreeSelection): string {
    const dO = data(lnData, path);

    const doType = createElement(doc, "DOType", { cdc: dO.type });

    const deps: [
      string,
      {
        tagName: string;
        transient?: string;
        fc: string;
        dchg?: string;
        dupd?: string;
        qchg?: string;
        typeKind?: "BASIC" | "ENUMERATED" | "CONSTRUCTED" | "undefined";
        type?: string;
        isArray?: string;
        sizeAttribute?: string;
        val?: string;
      },
    ][] = Object.entries(dO.children);

    for (const [name, dep] of deps) {
      if (!selection[name]) continue;

      if (dep.tagName === "SubDataObject") {
        const { transient } = dep;
        const type = createDOType(path.concat([name]), selection[name]);
        const sdo = createElement(doc, "SDO", { name, transient, type });
        doType.prepend(sdo);

        // For arrays set count attribute
        if (dep.isArray === "true" && dep.sizeAttribute) {
          sdo.setAttribute("count", dep.sizeAttribute);
        }
      } else {
        const { fc, dchg, dupd, qchg } = dep;

        const da = createElement(doc, "DA", { name, fc, dchg, dupd, qchg });

        // For arrays set count attribute
        if (dep.isArray === "true" && dep.sizeAttribute) {
          da.setAttribute("count", dep.sizeAttribute);
        }

        if (dep.typeKind === "BASIC" || !dep.typeKind) {
          da.setAttribute("bType", dep.type!);

          // One can include a value for any data attribute
          if (dep.val) {
            const value = createElement(doc, "Val", {});
            value.textContent = dep.val;
            (da as Node).insertBefore(value, null);
          }
        }

        if (dep.typeKind === "ENUMERATED") {
          const enumId = createEnumType(path.concat([name]), selection[name]);
          da.setAttribute("bType", "Enum");
          da.setAttribute("type", enumId);
        }

        if (dep.typeKind === "CONSTRUCTED") {
          const underlyingVal = selection.stVal || selection.mxVal;
          const daId = createDAType(
            path.concat([name]),
            selection[name],
            underlyingVal,
          );
          da.setAttribute("bType", "Struct");
          da.setAttribute("type", daId);
        }

        doType.append(da);
      }
    }

    return identify(doType, path[path.length - 1]);
  }

  Object.keys(selection).forEach((name) => {
    const type = createDOType([name], selection[name]);

    const { transient } = (lnData as LNodeDescription)[name];

    const doElement = createElement(doc, "DO", { name, type, transient });

    lnType.append(doElement);
  });

  // write LNodeType.id user defined id or content hash
  identify(lnType, lnClass, logicalnode.id);

  const dataTypeTemplates: Element =
    (doc.querySelector(":root > DataTypeTemplates") as Element) ||
    createElement(doc, "DataTypeTemplates", {});

  const inserts: Insert[] = [];
  if (!dataTypeTemplates.parentElement) {
    inserts.push({
      parent: doc.documentElement,
      node: dataTypeTemplates,
      reference: getReference(doc.documentElement, "DataTypeTemplates"),
    });
  }

  [
    ...elements.LNodeType,
    ...elements.DOType,
    ...elements.DAType,
    ...elements.EnumType,
  ].forEach((dataType) => {
    if (!doc.querySelector(`${dataType.tagName}[id="${dataType.id}"]`)) {
      const reference = getReference(dataTypeTemplates, dataType.tagName);
      inserts.push({ parent: dataTypeTemplates, node: dataType, reference });
    }
  });

  return inserts;
}
