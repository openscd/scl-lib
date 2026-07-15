import { Remove } from "@openscd/oscd-api";

function getDataType(data: Element): Element | null {
  const dataTypeTemplates = data.closest("DataTypeTemplates");
  if (!dataTypeTemplates) return null;

  const type = data.getAttribute("type");

  return dataTypeTemplates.querySelector(
    `DAType[id="${type}"], DOType[id="${type}"]`,
  );
}

function removeMissingSdsOrDas(dataType: Element, dosOrSds: Element): Remove[] {
  const removes: Remove[] = [];

  dosOrSds
    .querySelectorAll(":scope > SDS, :scope > DAS")
    .forEach((sdsOrDas) => {
      const name = sdsOrDas.getAttribute("name");
      const childData = dataType.querySelector(
        `:scope > DA[name="${name}"], :scope > BDA[name="${name}"], :scope > SDO[name="${name}"]`,
      );
      if (!childData) removes.push({ node: sdsOrDas });
      else {
        const childDataType = getDataType(childData);
        if (childDataType)
          removes.push(...removeMissingSdsOrDas(childDataType, sdsOrDas));
      }
    });

  return removes;
}

function removeMissingDos(lNodeType: Element, lNode: Element): Remove[] {
  const removes: Remove[] = [];

  lNode.querySelectorAll(":scope > Private > DOS").forEach((dos) => {
    const doElement = lNodeType.querySelector(
      `:scope > DO[name="${dos.getAttribute("name")}"]`,
    );
    if (!doElement) removes.push({ node: dos });
    else {
      const dataType = getDataType(doElement);
      if (dataType) removes.push(...removeMissingSdsOrDas(dataType, dos));
    }
  });

  return removes;
}

function lNodeReference(lNode: Element): string {
  let reference = "";
  const lNodeTag = `${lNode.getAttribute("prefix") || ""}${
    lNode.getAttribute("lnClass") || ""
  }${lNode.getAttribute("lnInst") || ""}`;

  reference = lNodeTag;

  let child = lNode;
  while (child.parentElement !== null) {
    if (child.parentElement.tagName === "SCL") break;
    const name = child.parentElement.getAttribute("name");

    // refix the name to the existing prefix seperated by /
    if (name) reference = `${name}/${reference}`;
    child = child.parentElement;
  }

  return reference;
}

function invalidPath(path: string[], dataType: Element, index = 0): boolean {
  const dataName = path[index];

  const doElement = dataType.querySelector(
    `:scope > DO[name="${dataName}"], :scope > SDO[name="${dataName}"], :scope > DA[name="${dataName}"], :scope > BDA[name="${dataName}"]`,
  );
  if (!doElement) return true;

  const childDataType = getDataType(doElement);
  if (!childDataType) return false;

  if (index + 1 < path.length)
    return invalidPath(path, childDataType, index + 1);

  return false;
}

function removeInvalidSourceRef(lNodeType: Element, lNode: Element): Remove[] {
  const removes: Remove[] = [];

  const lNodeRef = lNodeReference(lNode);

  const srcRefs = Array.from(
    lNode.ownerDocument.querySelectorAll(":root Private SourceRef"),
  ).filter((srcRef) => srcRef.getAttribute("source")?.startsWith(lNodeRef));

  srcRefs.forEach((srcRef) => {
    // source without the starting lNodeRef
    const srcRefPath = srcRef
      .getAttribute("source")!
      .substring(lNodeRef.length + 1);

    const path = srcRefPath.split(".");

    if (invalidPath(path, lNodeType)) removes.push({ node: srcRef });
  });

  return removes;
}

/**
 * Removes LNode children DOS, SDS or DAS when missing in the corresponding data type LNodeType
 * @param lNodeType the data structure for the LNode instance
 * @param targetDoc the target XML document where the LNode instance is located
 * @returns an array of Remove edits for the missing elements
 */
export function updateLnType(
  lNodeType: Element,
  targetDoc: XMLDocument,
): Remove[] {
  // find all LNode instances in targetDoc with the same lnType
  const lnType = lNodeType.getAttribute("id");
  const lNodes = Array.from(
    targetDoc.querySelectorAll(
      `:root > Substation LNode[lnType="${lnType}"], :root > Substation > LNode[lnType="${lnType}"]`,
    ),
  );
  if (lNodes.length === 0) return [];

  // for each LNode instance remove missing DOS, SDS or DAS
  const removeInstanceData: Remove[] = lNodes.flatMap((lNode) =>
    removeMissingDos(lNodeType, lNode),
  );

  // remove SourceRef when reference is invalid
  const removeSrcRef = lNodes.flatMap((lNode) =>
    removeInvalidSourceRef(lNodeType, lNode),
  );

  return [...removeInstanceData, ...removeSrcRef];
}
