import { Insert, Remove } from "@openscd/oscd-api";

import { createElement } from "../foundation/utils.js";
import { getReference } from "../tBaseElement/getReference.js";

export type ChangeGseOrSmvAddressOptions = {
  /** MAC-Address within `P` element in the `GSE` or `SMV` element */
  mac?: string;
  /** APPID within `P` element in the `GSE` or `SMV` element */
  appId?: string;
  /** VLAN-ID within `P` element in the `GSE` or `SMV` element */
  vlanId?: string;
  /** VLAN-PRIORITY within `P` element in the `GSE` or `SMV` element */
  vlanPriority?: string;
  /** Whether xsi:type attributes shall be set */
  instType?: boolean;
};

export function changeGseOrSmvAddress(
  gseOrSmv: Element,
  options: ChangeGseOrSmvAddressOptions,
): (Insert | Remove)[] {
  const edits: (Insert | Remove)[] = [];

  const newAddress = createElement(gseOrSmv.ownerDocument, "Address", {});

  const attributes: Record<string, string | null> = {};
  if (options.mac) attributes["MAC-Address"] = options.mac;
  if (options.appId) attributes.APPID = options.appId;
  if (options.vlanId) attributes["VLAN-ID"] = options.vlanId;
  if (options.vlanPriority) attributes["VLAN-PRIORITY"] = options.vlanPriority;

  Object.entries(attributes)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== null)
    .forEach(([type, value]) => {
      const child = createElement(gseOrSmv.ownerDocument, "P", { type });
      if (options.instType === undefined) {
        // take over old xsi:type
        const existXsiType = gseOrSmv
          .querySelector(`:scope > Address > P[type="${type}"]`)
          ?.hasAttribute("xsi:type");

        if (existXsiType)
          child.setAttributeNS(
            "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:type",
            `tP_${type}`,
          );
      } else if (options.instType)
        child.setAttributeNS(
          "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:type",
          `tP_${type}`,
        );

      child.textContent = value;
      newAddress.appendChild(child);
    });

  edits.push({
    parent: gseOrSmv,
    node: newAddress,
    reference: getReference(gseOrSmv, "Address"),
  });

  const oldAddress = gseOrSmv.querySelector("Address");
  if (oldAddress) edits.push({ node: oldAddress });

  return edits;
}
