import { Remove } from "@openscd/oscd-api";

export type RemoveDataTypeOptions = {
  /** Whether a linked data type will be removed */
  force: boolean;
};

function orphanRemoves(dtt: Element, orphans: Element[]): Remove[] {
  return orphans
    .map((orphan) => {
      const id = orphan.getAttribute("id");
      const btRemovedDataType = dtt.querySelector(`:scope > *[id="${id}"]`)!;

      return { node: btRemovedDataType };
    })
    .filter((remove) => remove) as Remove[];
}

function removeOrphans(orphans: Element[]): void {
  orphans.forEach((orphan) => orphan.remove());
}

function isLNodeTypeReferenced(lNodeType: Element): boolean {
  const dtt = lNodeType.closest("DataTypeTemplates");

  const id = lNodeType.getAttribute("id");

  const linkedAnyLn = dtt?.ownerDocument.querySelector(
    `:root > IED *[lnType="${id}"]`,
  );
  return !!linkedAnyLn;
}

function isDataTypeReferenced(dataType: Element): boolean {
  const dtt = dataType.closest("DataTypeTemplates");

  const id = dataType.getAttribute("id");

  const linkedData = dtt?.querySelector(`:scope *[type="${id}"]`);
  return !!linkedData;
}

function getOrphans(ddt: Element, saveOrphans: Element[] = []): Element[] {
  return Array.from(ddt.querySelectorAll(":scope > *"))
    .filter((dataType) => !isDataTypeReferenced(dataType))
    .filter((orphan) => !saveOrphans.includes(orphan));
}

function clonedDataType(dtt: Element, dataType: Element): Element {
  return dtt.querySelector(`:scope > *[id="${dataType.getAttribute("id")}"]`)!;
}

function isDataTypeLinked(dataType: Element): boolean {
  if (dataType.tagName === "LNodeType") return isLNodeTypeReferenced(dataType);

  return isDataTypeReferenced(dataType);
}

/**
 * Utility function to remove data types LNodeType, DOType, DAType or EnumType.
 * The function makes sure to not leave new unlinked data types .
 * @param remove - Remove edit the data type
 * @returns Remove array containing all to be removed data types
 */
export function removeDataType(
  dtRemove: Remove,
  options: RemoveDataTypeOptions = { force: false },
): Remove[] {
  const dataType = dtRemove.node as Element;

  const dtt = dataType.closest("DataTypeTemplates");
  const dttClone = dataType
    .closest("DataTypeTemplates")
    ?.cloneNode(true) as Element;
  if (!dttClone) return [];

  if (isDataTypeLinked(dataType) && !options.force) return [];

  const saveOrphans = getOrphans(dttClone);

  const removes: Remove[] = [];
  let orphans = [clonedDataType(dttClone, dataType)];
  while (orphans.length > 0) {
    removes.push(...orphanRemoves(dtt!, orphans));
    removeOrphans(orphans);
    orphans = getOrphans(dttClone!, saveOrphans);
  }

  return removes;
}
