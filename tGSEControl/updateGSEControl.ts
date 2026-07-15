import { Insert, Remove, SetAttributes } from "@openscd/oscd-api";

import { controlBlockGseOrSmv } from "../tControl/controlBlockGseOrSmv.js";
import { controlBlockObjRef } from "../tControl/controlBlockObjRef.js";
import { findControlBlockSubscription } from "../tControl/findControlSubscription.js";
import { updatedConfRev } from "../tControl/updateConfRev.js";
import { updateDatSet } from "../tControl/updateDatSet.js";

/**
 * Utility function to update GSEControl element attributes.
 * ```md
 * These attributes trigger additional edits such as
 * - name: also updates GSE.cbName and supervision references
 * - datSet: update reference DataSet.name - when DataSet is single use
 *
 * >NOTE: confRev attribute is updated +10000 on every data set change
 * ```
 * @param gseControl - GSEControl element
 * @param attributes -
 * @returns action array to update all `GSEControl` attributes
 */
export function updateGSEControl(
  setAttributes: SetAttributes,
): (SetAttributes | Remove | Insert)[] {
  if (setAttributes.element.tagName !== "GSEControl") return [];

  const updates: (SetAttributes | Remove | Insert)[] = [];
  if (setAttributes.attributes!.name) {
    const extRefUpdates: SetAttributes[] = findControlBlockSubscription(
      setAttributes.element,
    ).map((extRef) => ({
      element: extRef,
      attributes: { srcCBName: setAttributes.attributes!.name },
    }));

    const supervisionUpdates: (Remove | Insert)[] = Array.from(
      setAttributes.element.ownerDocument.querySelectorAll(
        '*[lnClass="LGOS"] Val',
      ),
    )
      .filter(
        (val) => val.textContent === controlBlockObjRef(setAttributes.element),
      )
      .flatMap((val) => {
        const [path] = controlBlockObjRef(setAttributes.element)!.split(".");
        const oldValContent = Array.from(val.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE,
        )!;
        const newValContent =
          setAttributes.element.ownerDocument.createTextNode(
            `${path}.${setAttributes.attributes!.name}`,
          ) as Text;

        return [
          { node: oldValContent },
          { parent: val, node: newValContent, reference: null },
        ];
      });

    const gseUpdate: SetAttributes[] = [];
    const gSE = controlBlockGseOrSmv(setAttributes.element);
    if (gSE) {
      gseUpdate.push({
        element: gSE,
        attributes: { cbName: setAttributes.attributes!.name },
      });
    }

    updates.push(...extRefUpdates, ...supervisionUpdates, ...gseUpdate);
  }

  if (setAttributes.attributes!.datSet) {
    const updateDataSet = updateDatSet(setAttributes);

    if (updateDataSet) updates.push(updateDataSet);
    // remove datSet from the update to avoid schema invalidity
    else delete setAttributes.attributes!.datSet;

    // +10000 for data set update
    setAttributes.attributes!.confRev = updatedConfRev(setAttributes.element);
  }

  return [setAttributes, ...updates];
}
