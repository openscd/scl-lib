import { SetAttributes } from "@openscd/oscd-api";

import { findControlBlockSubscription } from "../tControl/findControlSubscription.js";
import { updatedConfRev } from "../tControl/updateConfRev.js";

/** Updates `ReportControl` attributes and cross-referenced elements
 * @param setAttributes - setAttributes edit on `ReportControl` attributes
 * @returns Completed update edit array */
export function updateReportControl(
  setAttributes: SetAttributes,
): SetAttributes[] {
  if (setAttributes.element.tagName !== "ReportControl") return [];

  const reportControl = setAttributes.element;
  const attributes = setAttributes.attributes;

  const confRev = updatedConfRev(reportControl); // +10000 for update
  const attrs = { ...attributes, confRev };

  const ctrlBlockUpdates: SetAttributes[] = [
    { element: reportControl, attributes: attrs },
  ];
  if (!attributes?.name) return ctrlBlockUpdates;

  const extRefUpdates: SetAttributes[] = findControlBlockSubscription(
    reportControl,
  ).map((extRef) => ({
    element: extRef,
    attributes: { srcCBName: attributes.name },
  }));

  return ctrlBlockUpdates.concat(extRefUpdates);
}
