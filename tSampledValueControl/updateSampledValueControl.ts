import { Insert, Remove, SetAttributes } from "@openscd/oscd-api";

import { controlBlockGseOrSmv } from "../tControl/controlBlockGseOrSmv.js";
import { controlBlockObjRef } from "../tControl/controlBlockObjRef.js";
import { findControlBlockSubscription } from "../tControl/findControlSubscription.js";
import { updatedConfRev } from "../tControl/updateConfRev.js";
import { updateDatSet } from "../tControl/updateDatSet.js";

/**
 * Utility function to update SampledValueControl element attributes.
 * ```md
 * These attributes trigger additional edits such as
 * - name: also updates SMV.cbName and supervision references
 * - datSet: update reference DataSet.name - when DataSet is single use
 *
 * >NOTE: confRev attribute is updated +10000 on each data set change
 * ```
 * @param setAttributes - diff holding the `SampledValueControl` as element
 * @returns action array to update all `SampledValueControl` attributes
 */
export function updateSampledValueControl(
  setAttributes: SetAttributes,
): (SetAttributes | Remove | Insert)[] {
  if (setAttributes.element.tagName !== "SampledValueControl") return [];

  const updates: (SetAttributes | Remove | Insert)[] = [];
  if (setAttributes.attributes?.name) {
    const extRefUpdates: SetAttributes[] = findControlBlockSubscription(
      setAttributes.element,
    ).map((extRef) => ({
      element: extRef,
      attributes: { srcCBName: setAttributes.attributes!.name },
    }));

    const supervisionUpdates: (Remove | Insert)[] = Array.from(
      setAttributes.element.ownerDocument.querySelectorAll(
        ':root > IED > AccessPoint > Server > LDevice > LN[lnClass="LSVS"] > DOI[name="SvCBRef"] > DAI[name="setSrcRef"] > Val',
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

    const smvUpdate: SetAttributes[] = [];
    const sMV = controlBlockGseOrSmv(setAttributes.element);
    if (sMV) {
      smvUpdate.push({
        element: sMV,
        attributes: { cbName: setAttributes.attributes.name },
      });
    }

    updates.push(...extRefUpdates, ...supervisionUpdates, ...smvUpdate);
  }

  if (setAttributes.attributes!.datSet) {
    const updateDataSet = updateDatSet(setAttributes);

    if (updateDataSet) updates.push(updateDataSet);
    // remove datSet from the update to avoid schema invalidity
    else delete setAttributes.attributes!.datSet;

    // +10000 for update
    setAttributes.attributes!.confRev = updatedConfRev(setAttributes.element);
  }

  return [setAttributes, ...updates];
}
