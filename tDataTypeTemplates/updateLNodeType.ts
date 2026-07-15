import { EditV2 } from "@openscd/oscd-api";

import { importLNodeType } from "./importLNodeType.js";
import { updateLnType } from "../tSubstation/updateLnType.js";

function findExistingLNodeType(
  lNodeType: Element,
  targetDoc: XMLDocument,
): Element | null {
  const targetScl = targetDoc.querySelector("SCL");
  if (!targetScl) return null;
  return targetScl.querySelector(
    `:root > DataTypeTemplates > LNodeType[id="${lNodeType.getAttribute(
      "id",
    )}"]`,
  );
}

export function updateLNodeType(
  lNodeType: Element,
  targetDoc: XMLDocument,
): EditV2[] {
  // Find existing LNodeType in targetDoc
  const existingLNodeType = findExistingLNodeType(lNodeType, targetDoc);
  if (!existingLNodeType) return [];

  // Import the new one including its children
  const inserts = importLNodeType(lNodeType, targetDoc);

  // Remove the existing LNodeType
  const removeEdit: EditV2 = { node: existingLNodeType };

  // Update the substation section
  const removes = updateLnType(lNodeType, targetDoc);

  return [...inserts, removeEdit, ...removes];
}
