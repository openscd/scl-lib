import { EditV2, Insert } from "@openscd/oscd-api";

import { createElement } from "../foundation/utils.js";

import { getReference } from "../tBaseElement/getReference.js";
import { isEqualNode } from "./foundation.js";

type ImportLNodeTypeOptions = {
  overwrite?: boolean;
};

function removeDuplicates(inserts: Insert[]): Insert[] {
  const uniqueInserts: Insert[] = [];
  const uniqueIDs: string[] = [];

  inserts.forEach((insert) => {
    const id = (insert.node as Element).getAttribute("id");
    if (!id) uniqueInserts.push(insert);
    else if (!uniqueIDs.includes(id)) {
      uniqueIDs.push(id);
      uniqueInserts.push(insert);
    }
  });

  return uniqueInserts;
}

function insertDataType(
  dataType: Element,
  targetDataTypeTemplate: Element,
): Insert | undefined {
  const existingDataType = targetDataTypeTemplate.querySelector(
    `${dataType.tagName}[id="${dataType.getAttribute("id")}"] `,
  );
  if (existingDataType && isEqualNode(dataType, existingDataType)) return;

  const node = dataType.cloneNode(true);
  // const node = dataType;

  return {
    parent: targetDataTypeTemplate,
    node,
    reference: getReference(targetDataTypeTemplate, dataType.tagName),
  };
}

function insertDataTypes(dataTypes: Element[], targetScl: Element): Insert[] {
  const dataTypeEdit: Insert[] = [];

  const targetDataTypeTemplates = targetScl.querySelector(
    ":root > DataTypeTemplates",
  )
    ? targetScl.querySelector(":root > DataTypeTemplates")!
    : createElement(targetScl.ownerDocument, "DataTypeTemplates", {});

  if (!targetDataTypeTemplates.parentElement) {
    dataTypeEdit.push({
      parent: targetScl,
      node: targetDataTypeTemplates,
      reference: getReference(targetScl, "DataTypeTemplates"),
    });
  }

  dataTypeEdit.push(
    ...(dataTypes
      .map((dataType) => insertDataType(dataType, targetDataTypeTemplates))
      .filter((insert) => !!insert) as Insert[]),
  );

  return removeDuplicates(dataTypeEdit);
}

function getDaTypes(parent: Element): Element[] {
  const doc = parent.ownerDocument;

  const daTypes = Array.from(
    parent.querySelectorAll(":scope > DA, :scope > BDA"),
  )
    .map((dAorBda) =>
      doc.querySelector(
        `:root > DataTypeTemplates > DAType[id="${dAorBda.getAttribute(
          "type",
        )}"]`,
      ),
    )
    .filter((daType) => !!daType) as Element[];

  const sndLvDaTypes = daTypes.flatMap((daType) => getDaTypes(daType));

  return [...daTypes, ...sndLvDaTypes];
}

function getDoTypes(parent: Element): Element[] {
  const doc = parent.ownerDocument;

  const doTypes = Array.from(
    parent.querySelectorAll(":scope > DO, :scope > SDO"),
  )
    .map((dOorSdo) =>
      doc.querySelector(
        `:root > DataTypeTemplates > DOType[id="${dOorSdo.getAttribute(
          "type",
        )}"]`,
      ),
    )
    .filter((doType) => !!doType) as Element[];

  const sndLvDoTypes = doTypes.flatMap((doType) => getDoTypes(doType));

  return [...doTypes, ...sndLvDoTypes];
}

/**
 * Importing `LNodeType` including all its sub data structures `DOType`,
 * `DAType` and `EnumType` including a check for duplicate data.
 * @param lNodeType the `LNodeType` element to be imported
 * @param targetDoc the target XML document to import to
 * @returns an edit array inserting data type template
 */
export function importLNodeType(
  lNodeType: Element,
  targetDoc: XMLDocument,
  option: ImportLNodeTypeOptions = {},
): EditV2[] {
  const doc = lNodeType.ownerDocument;
  const targetScl = targetDoc.querySelector("SCL");

  if (!targetScl) return [];

  const doTypes = getDoTypes(lNodeType);

  const daTypes = doTypes.flatMap((doType) => getDaTypes(doType));

  const enumTypes = [...doTypes, ...daTypes].flatMap(
    (doOrDaType) =>
      Array.from(
        doOrDaType.querySelectorAll('BDA[bType="Enum"], DA[bType="Enum"]'),
      )
        .map((dAorBda) =>
          doc.querySelector(`EnumType[id="${dAorBda.getAttribute("type")}"]`),
        )
        .filter((enumType) => !!enumType) as Element[],
  );

  const inserts = insertDataTypes(
    [lNodeType, ...doTypes, ...daTypes, ...enumTypes],
    targetScl,
  );
  if (option.overwrite === undefined || option.overwrite === false)
    return inserts;

  const duplicatedLNodeType = targetScl.querySelector(
    `:root > DataTypeTemplates > LNodeType[id="${lNodeType.getAttribute(
      "id",
    )}"]`,
  );
  if (!duplicatedLNodeType) return inserts;

  return [...inserts, { node: duplicatedLNodeType }];
}
