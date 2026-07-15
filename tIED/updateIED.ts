import { EditV2, SetAttributes } from "@openscd/oscd-api";

import { createElement } from "../foundation/utils.js";

import { controlBlockObjRef } from "../tControl/controlBlockObjRef.js";

function isPublic(element: Element): boolean {
  return !element.closest("Private");
}

const elementsWithIedNameAttribute = [
  "LNode",
  "ConnectedAP",
  "KDC",
  "ExtRef",
  "ClientLN",
  "Association",
];

function updateIEDNameTextContent(
  ied: Element,
  oldIedName: string,
  newIedName: string,
): EditV2[] {
  return Array.from(ied.ownerDocument.getElementsByTagName("IEDName"))
    .filter(isPublic)
    .filter((iedName) => iedName.textContent === oldIedName)
    .flatMap((iedName) => {
      const node = Array.from(iedName.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE,
      )!;

      return [
        { node },
        {
          parent: iedName,
          node: document.createTextNode(newIedName),
          reference: null,
        },
      ];
    });
}

/** Valid is:
 * 1. there is an control block in the IED with the name change (ied)
 * 2. this control block is subscribed in otherIED (iedName, srcLDInst and srcCBName match)
 * 3. there is a LGOS/LSVS > ... > setSrcRef holding this control block object reference
 */
function validSubscriptionSupervision(
  ied: Element,
  otherIED: Element,
  oldIedName: string,
): Element[] {
  // for GSEControl elements
  const lgosVals = Array.from(ied.querySelectorAll("GSEControl"))
    .filter((srcCB) => {
      //filter out all control blocks that are not subscribed in otherIED
      const srcLDInst = srcCB.closest("LDevice")?.getAttribute("inst");
      return !!otherIED.querySelector(
        `:scope > AccessPoint > Server > LDevice 
        ExtRef[iedName="${oldIedName}"][srcLDInst="${srcLDInst}"][srcCBName="${srcCB.getAttribute(
          "name",
        )}"]`,
      );
    })
    .map((srcCB) => {
      const objRef = controlBlockObjRef(srcCB);
      return Array.from(
        otherIED.querySelectorAll(
          `:scope > AccessPoint > Server > LDevice > LN[lnClass="LGOS"] > 
            DOI[name="GoCBRef"] > DAI[name="setSrcRef"] > Val`,
        ),
      ).find((val) => val.textContent === objRef);
    })
    .filter((val) => val) as Element[];

  // for SampledValueControl elements
  const lsvsVals = Array.from(ied.querySelectorAll("SampledValueControl"))
    .filter((srcCB) => {
      //filter out all control blocks that are not subscribed in otherIED
      const srcLDInst = srcCB.closest("LDevice")?.getAttribute("inst");
      return !!otherIED.querySelector(
        `:scope > AccessPoint > Server > LDevice 
          ExtRef[iedName="${oldIedName}"][srcLDInst="${srcLDInst}"][srcCBName="${srcCB.getAttribute(
            "name",
          )}"]`,
      );
    })
    .map((srcCB) => {
      const objRef = controlBlockObjRef(srcCB);
      return Array.from(
        otherIED.querySelectorAll(
          `:scope > AccessPoint > Server > LDevice > LN[lnClass="LSVS"] > 
          DOI[name="SvCBRef"] > DAI[name="setSrcRef"] > Val`,
        ),
      ).find((val) => val.textContent === objRef);
    })
    .filter((val) => val) as Element[];

  return [...lgosVals, ...lsvsVals];
}

function updateSubscriptionSupervision(
  ied: Element,
  oldIedName: string,
  newIedName: string,
): EditV2[] {
  const vals = Array.from(
    ied.ownerDocument.querySelectorAll(":root > IED"),
  ).flatMap((otherIED) =>
    validSubscriptionSupervision(ied, otherIED, oldIedName),
  );

  return vals.flatMap((val) => {
    const oldContent = val.textContent!;
    const newContent = oldContent.replace(oldIedName, newIedName);
    const newTextNode = document.createTextNode(newContent);

    const node = Array.from(val.childNodes).find(
      (childNode) => childNode.nodeType === Node.TEXT_NODE,
    )!;

    return [{ node }, { parent: val, node: newTextNode, reference: null }];
  });
}

function updateIedNameAttributes(
  ied: Element,
  oldIedName: string,
  newIedName: string,
): SetAttributes[] {
  const selector = elementsWithIedNameAttribute
    .map((iedNameElement) => `${iedNameElement}[iedName="${oldIedName}"]`)
    .join(",");

  return Array.from(ied.ownerDocument.querySelectorAll(selector))
    .filter(isPublic)
    .map((element) => {
      return { element, attributes: { iedName: newIedName } };
    });
}

function objectReferenceToIed(dai: Element, oldIedName: string): boolean {
  const val = dai.querySelector(":scope > Val")!;
  const valContent = val.textContent;

  if (!valContent || !valContent?.startsWith(oldIedName)) return false;

  const lDeviceName = valContent.slice(oldIedName.length).split("/")[0];
  const ied = dai.closest("IED");

  const hasLDevice = ied?.querySelector(
    `:scope > AccessPoint > Server > LDevice[inst="${lDeviceName}"]`,
  );
  if (!hasLDevice) return false;

  return true;
}

function canModifyDA(daiOrdaType: Element): boolean {
  const valImport = daiOrdaType.getAttribute("valImport");
  const valKind = daiOrdaType.getAttribute("valKind");
  return (
    valImport === "true" && valKind !== null && ["Conf", "RO"].includes(valKind)
  );
}

function objRefDetails(
  anyLn: Element,
  doName: string,
  daName: string,
): { bType?: string | null; canModify?: boolean } | undefined {
  const doc = anyLn.ownerDocument;
  const lNodeType = doc.querySelector(
    `:root > DataTypeTemplates > LNodeType[id="${anyLn.getAttribute(
      "lnType",
    )}"]`,
  );

  let leaf: Element | null | undefined = lNodeType;

  const dO: Element | null | undefined = leaf?.querySelector(
    `DO[name="${doName}"], SDO[name="${doName}"]`,
  );
  leaf = doc.querySelector(
    `:root > DataTypeTemplates > DOType[id="${dO?.getAttribute("type")}"]`,
  );

  const dA: Element | null | undefined = leaf?.querySelector(
    `DA[name="${daName}"]`,
  );
  if (!dA) return undefined;

  const bType = dA.getAttribute("bType");
  const canModify = canModifyDA(dA);

  return { bType, canModify };
}

/** Find references used by the IED with the basic type of object reference.
 *  Then check if they require replacement.
 *  This function does not process LGOS and LSVS GoCBRef as these are
 *  handled separately.
 */
function updateObjectReferences(
  ied: Element,
  oldIedName: string,
  newIedName: string,
  checkPermission = false,
): EditV2[] {
  const objRefCandidates = Array.from(
    ied.querySelectorAll("LN DAI > Val, LN0 DAI > Val"),
  ).filter((val) => {
    const dai = val.parentElement!;
    const ln = dai.closest("LN, LN0");
    const lnClass = ln?.getAttribute("lnClass");
    const doiName = dai.closest("DOI, SDI")?.getAttribute("name");
    const daiName = dai.getAttribute("name");
    const isSupervision =
      lnClass &&
      doiName &&
      ["LGOS", "LSVS"].includes(lnClass) &&
      ["GoCBRef", "SvCBRef"].includes(doiName);
    if (!ln || !doiName || !daiName || isSupervision) return false;

    const objRefInfo = objRefDetails(ln, doiName, daiName);

    return (
      objRefInfo?.bType === "ObjRef" &&
      (checkPermission === false ||
        objRefInfo?.canModify ||
        canModifyDA(dai)) &&
      objectReferenceToIed(dai, oldIedName)
    );
  });

  return objRefCandidates.flatMap((val) => {
    const objRef = val.textContent!;
    const textContent = `${newIedName}${objRef.slice(oldIedName.length)}`;

    const newVal = createElement(val.ownerDocument, "Val", {});
    newVal.textContent = textContent;

    return [
      { node: val },
      { parent: val.parentElement!, node: newVal, reference: null },
    ];
  });
}

/**
 * Function to schema valid update name and other attribute(s) in IED element
 * (rename IED)
 * ```md
 * The function makes sure to also
 * 1. Update all elements with iedName attribute referenced to the IED.name
 *    attribute such as LNode, ClientLN, ExtRef, KDC, Association, ConnectedAP
 * 2. Update all control block object references pointing to the IED
 * 3. Updates IEDName elements text content
 * ```
 * @param setAttributes - IED element and attributes to be changed in the IED element
 * @param checkPermission - Check permission before changing object references
 * (other than supervision node GoCBRef values).
 * @returns - Set of addition edits updating all references SCL elements
 */
export function updateIED(
  setAttributes: SetAttributes,
  checkPermission = false,
): EditV2[] {
  if (setAttributes.element.tagName !== "IED") return [];
  if (!setAttributes.attributes?.name) return [setAttributes];

  const ied = setAttributes.element;
  const oldIedName = ied.getAttribute("name");
  const newIedName = setAttributes.attributes.name!;
  if (!oldIedName) return [];

  return [
    setAttributes,
    ...updateIedNameAttributes(ied, oldIedName, newIedName),
    ...updateSubscriptionSupervision(ied, oldIedName, newIedName),
    ...updateIEDNameTextContent(ied, oldIedName, newIedName),
    ...updateObjectReferences(ied, oldIedName, newIedName, checkPermission),
  ];
}
