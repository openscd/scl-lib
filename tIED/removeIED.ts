import { Remove, SetAttributes } from "@openscd/oscd-api";

import { isPublic } from "../tBaseElement/isPublic.js";
import { unsubscribe } from "../tExtRef/unsubscribe.js";
import { removeSubscriptionSupervision } from "../tLN/removeSubscriptionSupervision.js";

const elementsToRemove = ["Association", "ClientLN", "ConnectedAP", "KDC"];

const elementsToReplaceWithNone = ["LNode"];

function removeIEDNameTextContent(ied: Element, iedName: string): Remove[] {
  return Array.from(ied.ownerDocument.getElementsByTagName("IEDName"))
    .filter(isPublic)
    .filter((iedNameElement) => iedNameElement.textContent === iedName)
    .map((iedNameElement) => {
      return { node: iedNameElement };
    });
}

function removeWithIedName(ied: Element, iedName: string): Remove[] {
  const selector = elementsToRemove
    .map((iedNameElement) => `${iedNameElement}[iedName="${iedName}"]`)
    .join(",");

  return Array.from(ied.ownerDocument.querySelectorAll(selector))
    .filter(isPublic)
    .map((element) => {
      return { node: element };
    });
}

function removeIedSubscriptionsAndSupervisions(
  ied: Element,
  iedName: string,
): (SetAttributes | Remove)[] {
  const extRefs = Array.from(ied.ownerDocument.querySelectorAll(":root > IED"))
    .filter((ied) => ied.getAttribute("name") !== iedName)
    .flatMap((ied) =>
      Array.from(
        ied.querySelectorAll(
          `:scope > AccessPoint > Server > LDevice > LN0 > Inputs > ExtRef[iedName="${iedName}"], 
            :scope > AccessPoint > Server > LDevice > LN > Inputs > ExtRef[iedName="${iedName}"]`,
        ),
      ),
    );

  const supervisionRemovals = removeSubscriptionSupervision(extRefs);
  const extRefRemovals = unsubscribe(extRefs, { ignoreSupervision: true });

  return [...extRefRemovals, ...supervisionRemovals];
}

function lNodeKey(element: Element): string {
  const attr = (name: string) => element.getAttribute(name) ?? "";
  return `${attr("lnInst")}|$${attr("prefix")}|{attr("lnClass")}|${attr(
    "ldInst",
  )}`;
}

function updateIedNameToNone(
  ied: Element,
  iedName: string,
  removeDuplicates: boolean,
): (SetAttributes | Remove)[] {
  const selector = elementsToReplaceWithNone
    .map((iedNameElement) => `${iedNameElement}[iedName="${iedName}"]`)
    .join(",");

  return Array.from(ied.ownerDocument.querySelectorAll(selector))
    .filter(isPublic)
    .map((element) => {
      if (removeDuplicates) {
        const parent = element.parentElement;
        if (parent) {
          const key = lNodeKey(element);
          const hasDuplicate = Array.from(
            parent.querySelectorAll(':scope > LNode[iedName="None"]'),
          ).some((sibling) => lNodeKey(sibling) === key);

          if (hasDuplicate) return { node: element } as Remove;
        }
      }
      return { element, attributes: { iedName: "None" } } as SetAttributes;
    });
}

/** Options for the {@link removeIED} function. */
export interface RemoveIedOptions {
  /** Whether to update or remove LNode references. Defaults to `true`. */
  removeLNodes?: boolean;
}

/**
 * Function to remove an IED.
 * ```md
 * The function makes sure to also:
 * 1. Remove all elements which should no longer exist including ClientLN,
 *    KDC, Association, ConnectedAP and IEDName
 * 2. Remove subscriptions and supervisions
 * 3. Update LNodes to an iedName of None (or remove duplicates)
 * ```
 * @param remove - IED element as a Remove edit
 * @param options - Optional settings to control removal behavior
 * @returns - Set of additional edits to relevant SCL elements
 */
export function removeIED(
  remove: Remove,
  options: RemoveIedOptions = { removeLNodes: true },
): (SetAttributes | Remove)[] {
  if (
    remove.node.nodeType !== Node.ELEMENT_NODE ||
    remove.node.nodeName !== "IED" ||
    !(remove.node as Element).hasAttribute("name")
  )
    return [];

  const ied = remove.node as Element;
  const name = ied.getAttribute("name")!;

  return [
    remove,
    ...removeIEDNameTextContent(ied, name),
    ...removeWithIedName(ied, name),
    ...removeIedSubscriptionsAndSupervisions(ied, name),
    ...updateIedNameToNone(ied, name, options.removeLNodes !== false),
  ];
}
