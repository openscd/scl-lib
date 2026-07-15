import { Remove, SetAttributes } from "@openscd/oscd-api";

import { isPublic } from "../tBaseElement/isPublic.js";
import { unsubscribe } from "../tExtRef/unsubscribe.js";
import { removeSubscriptionSupervision } from "../tLN/removeSubscriptionSupervision.js";

const elementsToRemove = ["Association", "ClientLN", "ConnectedAP", "KDC"];

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

const lNodeKey = (ln: Element): string =>
  ["lnClass", "lnInst", "ldInst", "prefix"]
    .map((a) => ln.getAttribute(a) ?? "")
    .join("|");

const getLNodeScopeElement = (ln: Element): Element => {
  return ln.closest("Bay, VoltageLevel, Substation")!;
};

const createRemoveEdit = (ln: Element): Remove => {
  return { node: ln };
};

const setLNodeToNone = (ln: Element): SetAttributes => {
  return { element: ln, attributes: { iedName: "None" } };
};

const getLNodesByIedName = (doc: XMLDocument, name: string): Element[] => {
  return Array.from(
    doc.querySelectorAll(`Substation LNode[iedName=${name}]`),
  ).filter(isPublic);
};

/**
 * Default handling for LNodes - find any (public) matching LNodes and create a Remove edit for them.
 */
function removeBoundLNodes(ied: Element, name: string): Remove[] {
  return getLNodesByIedName(ied.ownerDocument, name).map(createRemoveEdit);
}

/**
 * Build the edits required to detach all public LNode bindings to `iedName`
 * from the substation model, preserving each as a specification entry with
 * (iedName="None"). A cache of all LNodes (with iedName="None") is first built
 * up (grouped by their scope/container). This is used to check if changing the
 * iedName of a bound LNode to "None" would create a duplicate binding within its
 * scope. If this would result in a duplicate, the LNode is simply removed instead.
 */
function detachLNodeBindings(
  ied: Element,
  name: string,
): (SetAttributes | Remove)[] {
  const doc = ied.ownerDocument;
  const boundNodes = getLNodesByIedName(doc, name);

  if (boundNodes.length === 0) {
    return [];
  }

  const unboundLNodesByScope = new Map<Element, Set<string>>();
  getLNodesByIedName(doc, "None").forEach((ln) => {
    const scope = getLNodeScopeElement(ln);
    let keys = unboundLNodesByScope.get(scope);
    if (!keys) {
      keys = new Set<string>();
      unboundLNodesByScope.set(scope, keys);
    }
    keys.add(lNodeKey(ln));
  });

  return boundNodes
    .map((ln) => {
      const scope = getLNodeScopeElement(ln);
      const keys = unboundLNodesByScope.get(scope);

      const key = lNodeKey(ln);
      if (keys && keys.has(key)) {
        return createRemoveEdit(ln);
      } else {
        return setLNodeToNone(ln);
      }
    })
    .filter((edit): edit is SetAttributes | Remove => edit !== undefined);
}

/** Options for the {@link removeIED} function. */
export interface RemoveIedOptions {
  /** Flag to optionally set all bound LNodes to iedName="None". Defaults to `false`.
   * Note: If setting an LNode to "None" would result in two matching LNodes, the
   * LNode will be simply deleted instead.*/
  preserveLNodes?: boolean;
}

/**
 * Function to remove an IED.
 * ```md
 * The function makes sure to also:
 * 1. Remove all elements which should no longer exist including ClientLN,
 *    KDC, Association, ConnectedAP and IEDName
 * 2. Remove subscriptions and supervisions
 * 3. By default removes all LNodes bound to this IED.
 * 4. By setting the optional "preserveLNodes" option to true,
 *    bound LNodes are set to iedName="None" and only removed if
 *    it would result in two matching LNodes.
 * ```
 * @param remove - IED element as a Remove edit
 * @param options - Optional settings to control removal behavior
 * @returns - Set of additional edits to relevant SCL elements
 */
export function removeIED(
  remove: Remove,
  options: RemoveIedOptions = { preserveLNodes: false },
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
    ...(options.preserveLNodes
      ? detachLNodeBindings(ied, name)
      : removeBoundLNodes(ied, name)),
  ];
}
