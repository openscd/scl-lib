import { Remove } from "@openscd/oscd-api";

import { SetAttributes } from "@openscd/oscd-api";

import { controlBlocks } from "../tControl/controlBlocks.js";
import { fCDAsSubscription } from "../tFCDA/removeFCDA.js";
import { unsubscribe } from "../tExtRef/unsubscribe.js";
import { updatedConfRev } from "../tControl/updateConfRev.js";

/**
 * Utility function to remove the element `DataSet`.
 * Also checks if data must be unsubscribed, subscription supervision need
 * to be removed and changes on control blocks must be done.
 * @param remove - Remove edit of a DataSet
 * @returns Edit array with remove edit and additional edits
 */
export function removeDataSet(remove: Remove): (Remove | SetAttributes)[] {
  if ((remove.node as Element).tagName !== "DataSet") return [];
  const dataSet = remove.node as Element;

  const dataSetRemove: (Remove | SetAttributes)[] = [{ node: dataSet }];

  const fCDAs = Array.from(dataSet.querySelectorAll(":scope > FCDA"));
  const extRefs = fCDAs.flatMap((fcda) => fCDAsSubscription(fcda));

  const extRefEdits: (Remove | SetAttributes)[] = [];
  extRefEdits.push(...unsubscribe(extRefs));

  const ctrlBlockUpdates: (Remove | SetAttributes)[] = controlBlocks(
    dataSet,
  ).map((ctrlBlock) => ({
    element: ctrlBlock,
    attributes: { datSet: null, confRev: updatedConfRev(ctrlBlock) },
  }));

  return dataSetRemove.concat(extRefEdits, ctrlBlockUpdates);
}
