function describeEnumType(element: Element): { vals: Record<string, string> } {
  const vals: Record<string, string> = {};

  const sortedEnumVals = Array.from(element.children)
    .filter((child) => child.tagName === "EnumVal")
    .sort(
      (v1, v2) =>
        parseInt(v1.getAttribute("ord")!, 10) -
        parseInt(v2.getAttribute("ord")!, 10),
    );
  for (const val of sortedEnumVals)
    vals[val.getAttribute("ord")!] = val.textContent ?? "";

  return { vals };
}

function describeDAType(element: Element): {
  bdas: Record<string, Record<string, string | null>>;
} {
  const bdas: Record<string, Record<string, string | null>> = {};
  for (const bda of Array.from(element.children)
    .filter((child) => child.tagName === "BDA")
    .sort((c1, c2) => c1.outerHTML.localeCompare(c2.outerHTML))) {
    const [bType, type, dchg, dupd, qchg] = [
      "bType",
      "type",
      "dchg",
      "dupd",
      "qchg",
    ].map((attr) => bda.getAttribute(attr));
    bdas[bda.getAttribute("name")!] = { bType, type, dchg, dupd, qchg };
  }
  return { bdas };
}

function describeDOType(element: Element) {
  const sdos: Record<string, Record<string, string | null>> = {};
  for (const sdo of Array.from(element.children)
    .filter((child) => child.tagName === "SDO")
    .sort((c1, c2) => c1.outerHTML.localeCompare(c2.outerHTML))) {
    const [name, type, transient] = ["name", "type", "transient"].map((attr) =>
      sdo.getAttribute(attr),
    );
    sdos[name!] = { type, transient };
  }
  const das: Record<string, Record<string, string | null>> = {};
  for (const da of Array.from(element.children)
    .filter((child) => child.tagName === "DA")
    .sort((c1, c2) => c1.outerHTML.localeCompare(c2.outerHTML))) {
    const [name, fc, bType, type, dchg, dupd, qchg] = [
      "name",
      "fc",
      "bType",
      "type",
      "dchg",
      "dupd",
      "qchg",
    ].map((attr) => da.getAttribute(attr));
    das[name!] = {
      fc,
      bType,
      type,
      dchg,
      dupd,
      qchg,
    };
  }
  return {
    sdos,
    das,
    cdc: element.getAttribute("cdc"),
  };
}

function describeLNodeType(element: Element) {
  const dos: Record<string, Record<string, string | null>> = {};
  for (const doElement of Array.from(element.children)
    .filter((child) => child.tagName === "DO")
    .sort((c1, c2) => c1.outerHTML.localeCompare(c2.outerHTML))) {
    const [name, type, transient] = ["name", "type", "transient"].map((attr) =>
      doElement.getAttribute(attr),
    );
    dos[name!] = { type, transient };
  }
  return {
    dos,
    lnClass: element.getAttribute("lnClass"),
  };
}

const typeDescriptions = {
  EnumType: describeEnumType,
  DAType: describeDAType,
  DOType: describeDOType,
  LNodeType: describeLNodeType,
} as Partial<Record<string, (e: Element) => object>>;

function describeElement(element: Element): object {
  const describe = typeDescriptions[element.tagName]!;

  return describe(element);
}

export function hashElement(element: Element): string {
  /** A direct copy from www.github.com/openscd/open-scd-core/foundation/cyrb64.ts */

  /**
   * Hashes `str` using the cyrb64 variant of
   * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
   * @returns digest - a rather insecure hash, very quickly
   */
  function cyrb64(str: string): string {
    /* eslint-disable no-bitwise */
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      (h2 >>> 0).toString(16).padStart(8, "0") +
      (h1 >>> 0).toString(16).padStart(8, "0")
    );
    /* eslint-enable no-bitwise */
  }

  return cyrb64(JSON.stringify(describeElement(element)));
}

export function isEqualNode(ours: Element, theirs: Element): boolean {
  return (
    JSON.stringify(describeElement(ours)) ===
    JSON.stringify(describeElement(theirs))
  );
}
