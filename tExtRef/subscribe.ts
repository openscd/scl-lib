import { Insert, SetAttributes } from "@openscd/oscd-api";

import { createElement } from "../foundation/utils.js";
import { getReference } from "../tBaseElement/getReference.js";
import { insertSubscriptionSupervisions } from "../tLN/supervision/insertSubscriptionSupervisions.js";

import { doesFcdaMeetExtRefRestrictions } from "./doesFcdaMeetExtRefRestrictions.js";

const serviceTypes: Partial<Record<string, "Report" | "GOOSE" | "SMV">> = {
  ReportControl: "Report",
  GSEControl: "GOOSE",
  SampledValueControl: "SMV",
};

export type SubscribeOptions = {
  /** Disables checks before subscription. !!Use with care */
  force: boolean;
  /** Whether to ignore adding subscription supervision (LGOS / LSVS). Default false */
  ignoreSupervision: boolean;
  /** Whether to check only service type (pServT) and basic type (not pDO and pLN). Default false */
  checkOnlyBType: boolean;
};

export type ValidSubscribeOptions = {
  /** Whether to check only service type (pServT) and basic type (not pDO and pLN). Default false */
  checkOnlyBType: boolean;
};

export type Connection = {
  /** Can be `LN0`, `LN`, `Inputs` or `ExtRef` */
  sink: Element;
  source: {
    /** `FCDA` element with or without `daName` */
    fcda: Element;
    /** `ReportControl`, `GSEControl`, `SampledValueControl` */
    controlBlock?: Element;
  };
};

function srcAttributes(controlBlock?: Element): {
  srcLDInst: string | null;
  srcPrefix: string | null;
  srcLNClass: string | null;
  srcLNInst: string | null;
  srcCBName: string | null;
  serviceType: "Report" | "GOOSE" | "SMV" | null;
} | null {
  const srcLDInst =
    controlBlock?.closest("LDevice")?.getAttribute("inst") || null;
  const srcPrefix =
    controlBlock?.closest("LN0,LN")?.getAttribute("prefix") || "";
  const srcLNClass =
    controlBlock?.closest("LN0,LN")?.getAttribute("lnClass") || null;
  const srcLNInst =
    controlBlock?.closest("LN0,LN")?.getAttribute("inst") || null;
  const srcCBName = controlBlock?.getAttribute("name") || null;

  if (
    !controlBlock ||
    !serviceTypes[controlBlock.tagName] ||
    !srcLDInst ||
    !srcLNClass ||
    !srcCBName
  )
    return {
      srcLDInst: null,
      srcPrefix: null,
      srcLNClass: null,
      srcLNInst: null,
      srcCBName: null,
      serviceType: null,
    };

  return {
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst,
    srcCBName,
    serviceType: serviceTypes[controlBlock.tagName]!,
  };
}

function getDataAttributes(fcda: Element): {
  iedName: string;
  ldInst: string;
  prefix: string | null;
  lnClass: string;
  lnInst: string | null;
  doName: string;
  daName: string | null;
} | null {
  const sourceIed = fcda.closest("IED");
  const iedName = sourceIed?.getAttribute("name");
  const [ldInst, prefix, lnClass, lnInst, doName, daName, fc] = [
    "ldInst",
    "prefix",
    "lnClass",
    "lnInst",
    "doName",
    "daName",
    "fc",
  ].map((attr) => fcda.getAttribute(attr));

  if (!sourceIed || !iedName || !ldInst || !lnClass || !doName || !fc)
    return null;

  return {
    iedName,
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
  };
}

function createSubscribeEdit(
  connection: Connection,
  parent: Element,
): SetAttributes | Insert | null {
  const doc = connection.sink.ownerDocument;
  const fcda = connection.source.fcda;
  const controlBlock = connection.source.controlBlock;

  const isEd1 = !doc.querySelector("SCL")?.getAttribute("version");

  const ed1Attributes = getDataAttributes(fcda);
  if (!ed1Attributes) return null;

  const ed2Attributes = {
    ...ed1Attributes,
    ...srcAttributes(controlBlock),
  };

  if (connection.sink.tagName === "ExtRef" && isEd1)
    return {
      element: connection.sink,
      attributes: ed1Attributes,
    };

  if (connection.sink.tagName === "ExtRef" && !isEd1)
    return {
      element: connection.sink,
      attributes: ed2Attributes,
    };

  const reference = getReference(parent, "ExtRef");

  if (connection.sink.tagName !== "ExtRef" && isEd1) {
    const extRef = createElement(doc, "ExtRef", ed1Attributes);
    return { parent, node: extRef, reference };
  }

  const extRef = createElement(doc, "ExtRef", ed2Attributes);
  return { parent, node: extRef, reference };
}

function createSubscribeEdits(
  connections: Connection[],
): (Insert | SetAttributes)[] {
  const inputEdits: Insert[] = [];

  const extRefEdits = connections
    .map((option) => {
      const parent = option.sink;

      // no Inputs child yet in anyLN element
      if (
        (parent.tagName === "LN" || parent.tagName === "LN0") &&
        !inputEdits.some((insert) => insert.parent === parent)
      ) {
        const inputs = createElement(parent.ownerDocument, "Inputs", {});
        const edit = createSubscribeEdit(option!, inputs);
        if (edit)
          inputEdits.push({
            parent,
            node: inputs,
            reference: getReference(parent, "Inputs"),
          });

        return edit;
      }

      // there is an Input already in anyLn
      if (
        (parent.tagName === "LN" || parent.tagName === "LN0") &&
        inputEdits.some((insert) => insert.parent === parent)
      ) {
        const inputs = inputEdits.find((insert) => insert.parent === parent)!
          .node as Element;
        return createSubscribeEdit(option!, inputs);
      }

      return createSubscribeEdit(option!, parent);
    })
    .filter((edit) => edit) as (Insert | SetAttributes)[];

  return [...inputEdits, ...extRefEdits];
}

function invalidSink(sink: Element): boolean {
  if (sink.tagName === "ExtRef")
    return !sink.getAttribute("intAddr") || !!sink.getAttribute("iedName");

  return !(
    sink.tagName === "LN" ||
    sink.tagName === "LN0" ||
    sink.tagName === "Inputs"
  );
}

function validSubscribeConditions(
  connection: Connection,
  options: ValidSubscribeOptions = { checkOnlyBType: false },
): boolean {
  if (invalidSink(connection.sink)) return false;

  //TODO: check connection via Communication section

  const fcda = connection.source.fcda;
  const controlBlock = connection.source.controlBlock;
  const serviceType = controlBlock
    ? serviceTypes[controlBlock.tagName]
    : "Poll";
  if (
    connection.sink.tagName === "ExtRef" &&
    !doesFcdaMeetExtRefRestrictions(connection.sink, fcda, {
      controlBlockType: serviceType,
      checkOnlyBType: options.checkOnlyBType,
    })
  )
    return false;

  return true;
}

/**
 * A function to subscribe [[`source`]](s) to [[`sink`]](s).
 * > Be aware that this function is producing a diff to the actual SCL.
 * > It is therefore crucial to make sure that at the point of calling
 * > this function the SCL is up to date.
 * @example
 * ```ts
 * // do not do this
 * const diff1 = subscribe(conn1);
 * const diff2 = subscribe(conn2);
 * .dispatch(editEvent([diff1, diff2]));
 *
 * // better do this
 * const diff = subscribe([conn1, conn2]);
 * .dispatch(editEvent(diff))
 * ```
 * @param sink - Can be `LN0`, `LN` and `Inputs`
 * for non-later-binding type of subscription and `ExtRef` with `intAddr`
 * for later binding type subscription.
 * @param source.fcda - `FCDA` element
 * @param source.controlBlock - The control block carrying the [[`source.fcda`]]
 * @returns An array of edits to do a valid subscription
 */
export function subscribe(
  connectionOrConnections: Connection | Connection[],
  options: SubscribeOptions = {
    force: false,
    ignoreSupervision: false,
    checkOnlyBType: false,
  },
): (Insert | SetAttributes)[] {
  const connections = Array.isArray(connectionOrConnections)
    ? connectionOrConnections
    : [connectionOrConnections];

  const validConnections = options.force
    ? connections
    : (connections.filter((conn) =>
        validSubscribeConditions(conn, {
          checkOnlyBType: options.checkOnlyBType,
        }),
      ) as Connection[]);

  const extRefEdits = createSubscribeEdits(validConnections);

  if (options.ignoreSupervision) return [...extRefEdits];

  return [...extRefEdits, ...insertSubscriptionSupervisions(extRefEdits)];
}
