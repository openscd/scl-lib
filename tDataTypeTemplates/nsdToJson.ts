import {
  nsd72,
  nsd73,
  nsd74,
  nsd7420,
  nsd81,
} from "../foundation/codecomponents/nsds.js";

type EnumDescription = Record<string, EnumValDescription>;
type EnumValDescription = {
  tagName: string;
  name: string;
  literalVal: string;
  descID?: string;
  deprecated?: string;
};

type DaChildren = Record<string, SubDaDescription | EnumValDescription>;

type SubDaDescription = {
  tagName: string;
  name: string;
  type?: string;
  descID: string;
  presCond: string;
  presCondArgs?: string;
  mandatory?: boolean;
  defaultValue?: string;
  isArray?: string;
  sizeAttribute?: string;
  typeKind?: string;
  minValue?: string;
  maxValue?: string;
  children?: DaChildren;
};

type ServiceConstructedAttribute = {
  tagName: string;
  name: string;
  presCond: string;
  descID: string;
  type?: string;
  typeKind: string;
  mandatory?: boolean;
  children?: DaChildren;
};

type ServiceDaDescription = {
  fc: string;
  name: string;
  presCond: string;
  tagName: string;
  type?: string;
  descID?: string;
  typeKind: string;
  underlyingType?: string;
  underlyingTypeKind?: string;
  children?: DaChildren;
};

export type DaDescription = {
  tagName: string;
  name: string;
  type?: string;
  descID?: string;
  presCond: string;
  fc: string;
  typeKind?: string;
  dchg?: string;
  qchg?: string;
  dupd?: string;
  mandatory?: boolean;
  isArray?: string;
  sizeAttribute?: string;
  defaultValue?: string;
  presCondArgs?: string;
  children?: DaChildren;
  val?: string;
};

export type CdcChildren = Record<
  string,
  DaDescription | ServiceDaDescription | CdcDescription
>;
type CdcDescription = {
  tagName: string;
  name: string;
  type: string;
  descID: string;
  presCond: string;
  dsPresCond?: string;
  presCondArgsID?: string;
  dsPresCondArgsID?: string;
  dsPresCondArgs?: string;
  presCondArgs?: string;
  underlyingType?: string;
  underlyingTypeKind?: string;
  transient?: string;
  mandatory?: boolean;
  deprecated?: string;
  isArray?: string;
  sizeAttribute?: string;
  children: CdcChildren;
  typeKindParameterized?: string;
};

export type LNodeDescription = Record<string, CdcDescription>;

export const supportedCdc = [
  "ACD",
  "ACT",
  "APC",
  "ASG",
  "BAC",
  "BCR",
  "BSC",
  "CMV",
  "DEL",
  "DPC",
  "DPL",
  "HDEL",
  "HMV",
  "HST",
  "HWYE",
  "INC",
  "INS",
  "ISC",
  "LPL",
  "MV",
  "ORG",
  "ORS",
  "SAV",
  "SEC",
  "SEQ",
  "SPC",
  "SPG",
  "SPS",
  "TCS",
  "TSG",
  "VSG",
  "VSS",
  "WYE",
] as const;
const cdcTag = new Set<string>(supportedCdc);
export type SCLTag = (typeof supportedCdc)[number];

export function isSupportedCdc(cdc: string): cdc is SCLTag {
  return cdcTag.has(cdc);
}

export type NameSpaceDescription = {
  "72"?: XMLDocument;
  "73"?: XMLDocument;
  "74"?: XMLDocument;
  "7420"?: XMLDocument;
  "81"?: XMLDocument;
};

const defaultDoc72 = new DOMParser().parseFromString(nsd72, "application/xml");
const defaultDoc73 = new DOMParser().parseFromString(nsd73, "application/xml");
const defaultDoc74 = new DOMParser().parseFromString(nsd74, "application/xml");
const defaultDoc7420 = new DOMParser().parseFromString(
  nsd7420,
  "application/xml",
);
const defaultDoc81 = new DOMParser().parseFromString(nsd81, "application/xml");

/** A utility function that returns a JSON containing the structure of a logical node class
 * as described in the IEC 61850-7-4 and IEC 61850-7-420 as JSON
 * @param lnClassOrCdc the logical node class to be constructed
 * @param nsds user defined NSD files defaulting to
 *             8-1:   2003A2
 *             7-4:   2007B3
 *             7-420: 2019A4
 *             7-3:   2007B3
 *             7-2:   2007B3
 * @returns A JSON object represeting NSD information of a logical node
 */
export function nsdToJson(
  lnClassOrCdc: string,
  nsds?: NameSpaceDescription,
): LNodeDescription | CdcChildren | undefined {
  const doc74 = nsds && nsds["74"] ? nsds["74"] : defaultDoc74;
  const doc7420 = nsds && nsds["7420"] ? nsds["7420"] : defaultDoc7420;

  function getServiceConstructedAttributes(
    serviceDataAttribute: Element,
  ): Element[] {
    const doc81 = nsds && nsds["81"] ? nsds["81"] : defaultDoc81;

    const type = serviceDataAttribute.getAttribute("type");
    return Array.from(
      doc81
        .querySelector(
          `ServiceConstructedAttributes > ServiceConstructedAttribute[name="${type}"]`,
        )
        ?.querySelectorAll("SubDataAttribute") ?? [],
    );
  }

  function getServiceDataAttributesType(type: string | null): Element[] {
    const doc81 = nsds && nsds["81"] ? nsds["81"] : defaultDoc81;

    return Array.from(
      doc81
        .querySelector(`ServiceCDCs > ServiceCDC[cdc="${type}"]`)
        ?.querySelectorAll("ServiceDataAttribute") ?? [],
    );
  }

  function getServiceDataAttributes(dataObject: Element): Element[] {
    const type = dataObject.getAttribute("type");

    return getServiceDataAttributesType(type);
  }

  function getSubDataAttributesType(type: string | null): Element[] {
    const doc73 = nsds && nsds["73"] ? nsds["73"] : defaultDoc73;
    const doc72 = nsds && nsds["72"] ? nsds["72"] : defaultDoc72;

    return Array.from(
      doc73
        .querySelector(`ConstructedAttribute[name="${type}"]`)
        ?.querySelectorAll(":scope > SubDataAttribute") ?? [],
    ).concat(
      Array.from(
        doc72
          .querySelector(`ConstructedAttribute[name="${type}"]`)
          ?.querySelectorAll(":scope > SubDataAttribute") ?? [],
      ),
    );
  }

  function getSubDataAttributes(dataAttribute: Element): Element[] {
    const type = dataAttribute.getAttribute("type");

    return getSubDataAttributesType(type);
  }

  function getDataAttributesType(type: string | null): Element[] {
    const doc73 = nsds && nsds["73"] ? nsds["73"] : defaultDoc73;

    if (
      ["CSG", "CURVE", "ENG", "ING", "ASG", "SPG", "TSG", "VSG"].includes(
        `${type}`,
      )
    )
      return Array.from(
        doc73
          .querySelector(`CDC[name="${type}"][variant="SE"]`)
          ?.querySelectorAll("DataAttribute") ?? [],
      );
    return Array.from(
      doc73
        .querySelector(`CDC[name="${type}"]`)
        ?.querySelectorAll("DataAttribute") ?? [],
    );
  }

  function getDataAttributes(dataObject: Element): Element[] {
    const type = dataObject.getAttribute("type");

    return getDataAttributesType(type);
  }

  function getSubDataObjectsType(type: string | null): Element[] {
    const doc73 = nsds && nsds["73"] ? nsds["73"] : defaultDoc73;

    return Array.from(
      doc73
        .querySelector(`CDC[name="${type}"]`)
        ?.querySelectorAll("SubDataObject") ?? [],
    );
  }

  function getSubDataObjects(dataObject: Element): Element[] {
    const type = dataObject.getAttribute("type");

    return getSubDataObjectsType(type);
  }

  function getDataObjects(lnClass: Element): Element[] {
    const baseClass = lnClass.ownerDocument.querySelector(
      `AbstractLNClass[name="${lnClass.getAttribute("base")}"]`,
    );

    const dataObject: Element[] = [];
    if (baseClass) dataObject.push(...getDataObjects(baseClass));

    const childDataObject = Array.from(
      lnClass.querySelectorAll(":scope > DataObject"),
    );

    dataObject.push(...childDataObject);
    return dataObject;
  }

  function nsdEnumeration(underlyingType: string): EnumDescription {
    let enumElement: Element | null = null;
    for (const doc of [defaultDoc72, defaultDoc73, doc74]) {
      enumElement = doc.querySelector(
        `:root > Enumerations > Enumeration[name="${underlyingType}"]`,
      );
      if (enumElement) break;
    }

    if (!enumElement) return {};

    const enumeration: EnumDescription = {};
    enumElement.querySelectorAll(":scope > Literal").forEach((literal) => {
      const name = literal.getAttribute("name")!;
      const literalVal = literal.getAttribute("literalVal")!;
      const descID = literal.getAttribute("descID")!;
      const deprecated = literal.getAttribute("deprecated")!;

      const data: EnumValDescription = {
        tagName: literal.tagName,
        name,
        literalVal,
      };
      if (descID) data["descID"] = descID;
      if (deprecated) data["deprecated"] = deprecated;

      enumeration[name] = data;
    });

    return enumeration;
  }

  function nsdServiceConstructedAttribute(
    serviceConstructedAttribute: Element,
  ): ServiceConstructedAttribute {
    const tagName = serviceConstructedAttribute.tagName;
    const [name, presCond, descID, type, typeKind] = [
      "name",
      "presCond",
      "descID",
      "type",
      "typeKind",
    ].map((attr) => serviceConstructedAttribute.getAttribute(attr)!);

    const data: ServiceConstructedAttribute = {
      tagName,
      name,
      presCond,
      descID,
      typeKind,
    };

    if (type) data["type"] = type;

    const mandatory = presCond === "M" ? true : undefined;
    if (mandatory) data["mandatory"] = mandatory;

    let children: DaChildren | undefined = undefined;
    if (typeKind === "CONSTRUCTED") {
      children = {};
      getSubDataAttributes(serviceConstructedAttribute).forEach(
        (subDataAttribute) => {
          const name = subDataAttribute.getAttribute("name")!;
          children![name] = nsdSubDataAttribute(subDataAttribute);
        },
      );
    }
    if (children) data["children"] = children;

    return data;
  }

  function nsdServiceDataAttribute(
    serviceDataAttribute: Element,
  ): ServiceDaDescription {
    const tagName = serviceDataAttribute.tagName;
    const [
      name,
      fc,
      type,
      presCond,
      typeKind,
      underlyingType,
      underlyingTypeKind,
    ] = [
      "name",
      "fc",
      "type",
      "presCond",
      "typeKind",
      "underlyingType",
      "underlyingTypeKind",
    ].map((attr) => serviceDataAttribute.getAttribute(attr)!);

    const data: ServiceDaDescription = {
      tagName,
      name,
      fc,
      presCond,
      typeKind,
    };
    const descID = serviceDataAttribute.getAttribute("descID")!;
    if (descID) data["descID"] = descID;

    if (type) data["type"] = type;
    if (underlyingType) data["underlyingType"] = underlyingType;
    if (underlyingTypeKind) data["underlyingTypeKind"] = underlyingTypeKind;

    const children: Record<string, ServiceConstructedAttribute> = {};
    getServiceConstructedAttributes(serviceDataAttribute).forEach(
      (subDataAttribute) => {
        const name = subDataAttribute.getAttribute("name")!;

        children[name] = nsdServiceConstructedAttribute(subDataAttribute);
      },
    );
    if (Object.keys(children).length) data["children"] = children;

    return data;
  }

  function nsdSubDataAttribute(subDataAttribute: Element): SubDaDescription {
    const [
      name,
      descID,
      presCond,
      type,
      presCondArgs,
      typeKind,
      minValue,
      maxValue,
      defaultValue,
    ] = [
      "name",
      "descID",
      "presCond",
      "type",
      "presCondArgs",
      "typeKind",
      "minValue",
      "maxValue",
      "defaultValue",
    ].map((attr) => subDataAttribute.getAttribute(attr)!);

    const tagName = subDataAttribute.tagName;
    const data: SubDaDescription = { tagName, name, descID, presCond, type };

    if (typeKind) data["typeKind"] = typeKind;
    if (minValue) data["minValue"] = minValue;
    if (maxValue) data["maxValue"] = maxValue;
    if (presCondArgs) data["presCondArgs"] = presCondArgs;
    if (defaultValue) data["defaultValue"] = defaultValue;

    const mandatory = presCond === "M" ? true : undefined;
    if (mandatory) data["mandatory"] = mandatory;

    let children: DaChildren | undefined = undefined;
    if (typeKind === "ENUMERATED") {
      if (type) children = nsdEnumeration(type);
    } else if (typeKind === "CONSTRUCTED") {
      children = {};
      getSubDataAttributes(subDataAttribute).forEach((subDataAttribute) => {
        const name = subDataAttribute.getAttribute("name")!;
        children![name] = nsdSubDataAttribute(subDataAttribute);
      });
    }
    if (children) data["children"] = children;

    return data;
  }

  function nsdDataAttribute(
    dataAttribute: Element,
    underlyingType?: string,
    underlyingTypeKind?: string,
  ): DaDescription {
    const [name, descID, presCond, fc] = [
      "name",
      "descID",
      "presCond",
      "fc",
    ].map((attr) => dataAttribute.getAttribute(attr)!);

    const tagName = dataAttribute.tagName;
    const data: DaDescription = { tagName, name, presCond, fc };

    if (descID) data["descID"] = descID;

    const [dchg, qchg, dupd] = ["dchg", "qchg", "dupd"].map(
      (attr) => dataAttribute.getAttribute(attr) ?? undefined,
    );

    if (dchg) data["dchg"] = dchg;
    if (qchg) data["qchg"] = qchg;
    if (dupd) data["dupd"] = dupd;

    const [isArray, sizeAttribute] = ["isArray", "sizeAttribute"].map(
      (attr) => dataAttribute.getAttribute(attr) ?? undefined,
    );

    if (isArray) data["isArray"] = isArray;
    if (sizeAttribute) data["sizeAttribute"] = sizeAttribute;

    let type = dataAttribute.getAttribute("type") ?? undefined;
    let typeKind = dataAttribute.getAttribute("typeKind") ?? undefined;

    const defaultValue =
      dataAttribute.getAttribute("defaultValue") ?? undefined;
    if (defaultValue) data["defaultValue"] = defaultValue;

    const mandatory = presCond === "M" ? true : undefined;
    if (mandatory) data["mandatory"] = mandatory;

    const presCondArgs =
      dataAttribute.getAttribute("presCondArgs") ?? undefined;
    if (presCondArgs) data["presCondArgs"] = presCondArgs;

    if (typeKind === "undefined" && underlyingTypeKind)
      typeKind = underlyingTypeKind;
    if (!type && underlyingType) type = underlyingType;

    let children: DaChildren | undefined = undefined;
    if (typeKind === "ENUMERATED") {
      if (type) children = nsdEnumeration(type);
    } else if (typeKind === "CONSTRUCTED") {
      children = {};
      const childSubDa = getSubDataAttributesType(type!);
      childSubDa.forEach((subDataAttribute) => {
        const name = subDataAttribute.getAttribute("name")!;
        children![name] = nsdSubDataAttribute(subDataAttribute);
      });
    }

    if (type) data["type"] = type;
    if (typeKind) data["typeKind"] = typeKind;

    if (children && type !== "EnumDA") data["children"] = children;

    return data;
  }

  function dataObjectName(dataObject: Element): string {
    const multiInstances = ["Omulti", "Mmulti"];
    const instance = multiInstances.includes(
      dataObject.getAttribute("presCond")!,
    )
      ? "1"
      : "";
    const name = dataObject.getAttribute("name")!;
    return `${name}${instance}`;
  }

  function nsdDataObject(dataObject: Element): CdcDescription {
    const [type, descID, presCond, dsPresCond, transient] = [
      "type",
      "descID",
      "presCond",
      "dsPresCond",
      "transient",
    ].map((attr) => dataObject.getAttribute(attr)!);

    const name = dataObjectName(dataObject); // adopt when presCond is Omulti

    const tagName = dataObject.tagName;

    const presCondArgsID =
      dataObject.getAttribute("presCondArgsID") ?? undefined;
    const deprecated = dataObject.getAttribute("deprecated") ?? undefined;
    const dsPresCondArgsID =
      dataObject.getAttribute("dsPresCondArgsID") ?? undefined;
    const presCondArgs = dataObject.getAttribute("presCondArgs") ?? undefined;
    const dsPresCondArgs =
      dataObject.getAttribute("dsPresCondArgs") ?? undefined;

    const [underlyingType, underlyingTypeKind] = [
      "underlyingType",
      "underlyingTypeKind",
    ].map((attr) => dataObject.getAttribute(attr) ?? undefined);

    const [isArray, sizeAttribute] = ["isArray", "sizeAttribute"].map(
      (attr) => dataObject.getAttribute(attr) ?? undefined,
    );

    const mandatory = presCond === "M" ? true : undefined;

    const children: CdcChildren = {};
    getSubDataObjects(dataObject).forEach((dataObject) => {
      const name = dataObject.getAttribute("name")!;

      children[name] = nsdDataObject(dataObject);
    });

    const typeKindParameterized = dataObject.getAttribute(
      "typeKindParameterized",
    );

    getDataAttributes(dataObject).forEach((dataAttribute) => {
      const name = dataAttribute.getAttribute("name")!;

      children[name] = nsdDataAttribute(
        dataAttribute,
        underlyingType,
        underlyingTypeKind,
      );
    });

    getServiceDataAttributes(dataObject).forEach((serviceDataAttribute) => {
      const name = serviceDataAttribute.getAttribute("name")!;

      children[name] = nsdServiceDataAttribute(serviceDataAttribute);
    });

    const data: CdcDescription = {
      tagName,
      name,
      descID,
      presCond,
      type,
      children,
    };

    if (underlyingType) data["underlyingType"] = underlyingType;
    if (underlyingTypeKind) data["underlyingTypeKind"] = underlyingTypeKind;
    if (transient) data["transient"] = transient;
    if (presCondArgsID) data["presCondArgsID"] = presCondArgsID;
    if (dsPresCondArgsID) data["dsPresCondArgsID"] = dsPresCondArgsID;
    if (mandatory) data["mandatory"] = mandatory;
    if (presCondArgs) data["presCondArgs"] = presCondArgs;
    if (dsPresCondArgs) data["dsPresCondArgs"] = dsPresCondArgs;
    if (dsPresCond) data["dsPresCond"] = dsPresCond;
    if (deprecated) data["deprecated"] = deprecated;
    if (isArray) data["isArray"] = isArray;
    if (sizeAttribute) data["sizeAttribute"] = sizeAttribute;
    if (typeKindParameterized)
      data["typeKindParameterized"] = typeKindParameterized;

    return data;
  }

  function CdcChildren(type: string): CdcChildren {
    const children: CdcChildren = {};
    getSubDataObjectsType(type).forEach((dataObject) => {
      const name = dataObject.getAttribute("name")!;

      children[name] = nsdDataObject(dataObject);
    });

    getDataAttributesType(type).forEach((dataAttribute) => {
      const name = dataAttribute.getAttribute("name")!;

      children[name] = nsdDataAttribute(dataAttribute, undefined, undefined);
    });

    getServiceDataAttributesType(type).forEach((serviceDataAttribute) => {
      const name = serviceDataAttribute.getAttribute("name")!;

      children[name] = nsdServiceDataAttribute(serviceDataAttribute);
    });

    return children;
  }

  if (lnClassOrCdc === undefined) return;
  else if (isSupportedCdc(lnClassOrCdc)) return CdcChildren(lnClassOrCdc);
  else {
    const nsdLnClass74 = doc74.querySelector(`LNClass[name="${lnClassOrCdc}"]`);
    const nsdLnClass7420 = doc7420.querySelector(
      `LNClass[name="${lnClassOrCdc}"]`,
    );

    const nsdLnClass = nsdLnClass74 || nsdLnClass7420;
    if (!nsdLnClass) return undefined;

    const lnClassJson: LNodeDescription = {};
    getDataObjects(nsdLnClass).forEach((dataObject) => {
      const name = dataObjectName(dataObject);

      lnClassJson[name] = nsdDataObject(dataObject);
    });

    return lnClassJson;
  }
}
