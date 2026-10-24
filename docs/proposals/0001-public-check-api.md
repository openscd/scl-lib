# Proposal: public check API and one error model

| Field | Value |
|---|---|
| Status | Draft for review |
| Parent issue | [#109 Error handling in functions](https://github.com/openscd/scl-lib/issues/109) |
| Discussion | [Zulip `#457465`, topic `scl-lib`](https://openscd.zulipchat.com/#narrow/channel/457465/topic/scl-lib/near/634236716) |
| Review | Comment on the pull request, or on a line of this file in the diff |
| Deliverable | Design only. No code changes in this pull request. |

## How to review

1. Read Section 1 (Summary) and Section 5.1 (Categories of concern). They decide the shape of the API.
2. Read Section 13.2. It has 15 decisions. Each decision gives the options and our preferred answer, with the reason.
3. Reply in the pull request with the decision number and the letter, for example "D5: B". A reply can also propose a new option.
4. Comment on any line of this file in the diff. The numbers in Section 2.1 come from a measurement of real files, and Appendix B gives the method.

The option letters are not ordered by merit. In most decisions we list our preferred answer first, so it carries the letter A. Review each option on its own.

## 1. Summary

The library can tell you which edit an operation makes. It can also return `null` or `[]` when the operation makes no edit. It cannot tell you why the operation makes no edit.

A caller that needs only a diff does not need the reason. A caller that must disable a button and explain the problem needs the reason.

The library uses three different ways to say "not possible". These ways share no vocabulary:

| Channel | Example | Used by |
|---|---|---|
| Boolean | `canInstantiateSubscriptionSupervision(...)` returns `false` | Public check functions |
| `null` or `[]` | `createDataSet(...)` returns `null` | Create, remove and update functions |
| Special value | `maxReportControl(...)` returns `{max: -1}` | Limit helper functions |

The library does not throw an error today. This issue keeps that behaviour for expected results. The issue also adds one set of reason codes and one details object. Every channel uses them.

The proposal builds on a study of 716 real SCL files (Sections 2.1 and 5.1).

This issue proposes seven changes:

1. One reason vocabulary. The `SclReason` type has one constant object and kebab-case string values. One payload type, `SclReasonDetails`, holds the values.
2. A family of check functions: `checkAddDataSet`, `checkAddGSEControl`, `checkAddReportControl`, `checkAddSampledValueControl`, `checkAddFCDA` and `checkInstantiateSubscriptionSupervision`.
3. One policy for limits that the file does not declare. The default policy permits the addition. An option refuses it.
4. A policy for functions that fail without a reason. The issue also lists each such function.
5. A deprecation path for the two public check functions that return a boolean.
6. One closed set of concern categories with stable prefixes (Section 5.1). The category prefix of a reason code shows which kind of constraint applies.
7. A new README section. The check functions become part of the public contract.

Section 13.2 lists 15 decisions for the reviewers. Each decision gives the options and our preferred answer.

## 2. Reason for the change

Harald Brabenetz, Stephen Renwick and Christian Dinkel discussed the topic in Zulip (`#457465`, topic `scl-lib`).

- Harald Brabenetz needs the reason when a publisher cannot add an element. Examples are a missing `LN0`, a missing `Services` element and a maximum that limits the count. The publisher disables the button and shows the reason in a tooltip.
- Stephen Renwick wants three conditions. The library must stay independent of the user interface. The library must return structured results and not sentences. The new check function must replace `canAddReportControl()`.
- Harald Brabenetz wants the values that the check already calculates. Example: "The maximum number of buffered report instances (4 of 4) has been reached."
- Christian Dinkel rejects translation in the library. He also wants a clear reason when a function fails.

This proposal satisfies the three reviewers. The library contains no user text and no user interface concepts. The `details` object gives the host application all values that it needs for a message in any language.

### 2.1 Evidence from real SCL files

The proposal uses a study of the SCL files that users open. The study covered 716 `.scd`, `.cid` and `.icd` files in three local collections. The script read 120 sampled files and the four largest files: 676 IED, 9,986 `ReportControl`, 1,579 `GSEControl`, 403 `SampledValueControl`, 3,116 `DataSet`, 63,323 `FCDA` and 40,321 `ExtRef`.

The study used the schema `IEC_61850-6.2018.SCL.2007B4.full` and the `xs:unique`, `xs:key` and `xs:keyref` constraints in that schema.

Table 2 gives the result. Each row is a condition that a check function must answer.

**Table 1: Conditions found in real SCL files**

| Condition | Count | Files |
|---|---|---|
| IED with no `Services` element | 83 of 676 | — |
| IED that uses a service that it does not declare | `SMVsc` 163, `GOOSE` 24, `ConfDataSet` 29, `ConfReportControl` 5 | 58 of 120 |
| Declared `max="0"` | `GOOSE` 44, `SMVsc` 12 | — |
| `SupSubscription` with `maxGo` or `maxSv` equal to 0 | 254 of 397 declarations | — |
| Scope above `ConfReportControl@max`, instances counted | 72 | 24 |
| Scope above `ConfReportControl@max`, control blocks counted | 6 | 2 |
| Scope above `GOOSE@max` | 16 | — |
| Control block with no `ConnectedAP` | `GSE` 31, `SMV` 55 | 18 |
| `lnType` without a `LNodeType` | 27 ids, 69 uses | 17 |
| `datSet` without a `DataSet` | 9 | 8 |
| `iedName` without an `IED` | 43 ids | 4 |
| `ExtRef` with `pDO` | 9,294 of 40,321 | 49 of 103 files have none |
| `Private` element | 76,612 | 102 of 120 |

Three results are important for the design:

1. A missing `Services` element and an undeclared service are common. A strict default prevents edits in 58 of 120 files.
2. An explicit `max="0"` is a different condition from an absent declaration. The file says that the service does not exist.
3. Real files contain reference faults. The library must report them. The library must not use them to refuse an unrelated edit.

## 3. Current state

| Function | File | Exported by `index.ts`? | Constraints |
|---|---|---|---|
| `canAddDataSet(ln0)` | `tDataSet/canAddDataSet.ts` | No | `Services > ConfDataSet@max` |
| `canAddGSEControl(ln0)` | `tGSEControl/canAddGSEControl.ts` | No | `Services > GOOSE@max` |
| `canAddSampledValueControl(ln0)` | `tSampledValueControl/…` | No | `Services > SMVsc@max` |
| `canAddReportControl(parent, o)` | `tReportControl/…` | No | `ConfReportControl@max`, `@maxBuf` |
| `canAddFCDA(dataSet)` | `tFCDA/canAddFCDA.ts` | Yes | `ConfDataSet@maxAttributes` |
| `maxAttributes(fcda)` | `tFCDA/canAddFCDA.ts` | Yes | Returns `{max, scope}` with a `-1` value |
| `canInstantiateSubscriptionSupervision(s, o)` | `tLN/supervision/…` | Yes | Five rules, each optional, no reason |
| `doesFcdaMeetExtRefRestrictions` | `tExtRef/…` | Yes | `pDO`, `pDA`, `pLN`, `pServT` |
| `matchDataAttributes`, `matchSrcAttributes`, `isSubscribed` | `tExtRef/…` | Yes | Match predicates |

The library checks maximum counts only. No check function gives a reason. Four of the five element families are not exported.

A plugin can reach `canAddReportControl` only by a deep import of `dist/tReportControl/canAddReportControl.js`.

Two check functions are public and return a boolean. A new function must replace them. Section 7 gives the procedure.

Not every predicate needs a result object. `doesFcdaMeetExtRefRestrictions`, `matchDataAttributes`, `matchSrcAttributes`, `isSubscribed` and `sourceControlBlock` answer the question "does this element match?". These functions have no refusal to explain. Use this rule:

> A predicate that permits or refuses an operation gets a `check*` result form. A predicate that only compares data stays a boolean.

## 4. Functions that fail without a reason

Two public functions return the same value for different causes:

```ts
// tDataSet/createDataSet.ts
const insert = createDataSet(ln0, { attributes: { name: "DS1" } });
// null  →  no LN0 in the parent? name in use? maximum reached?
//          The caller cannot identify the cause.

// tGSEControl/createGSEControl.ts
const edits = createGSEControl(ln0, { gseControl: { name: "GC1" } });
// []    →  the same three causes, and a DataSet that does not exist.
```

Table 2 lists each function that returns `null`, `[]` or a special value for more than one cause.

**Table 2: Functions with ambiguous results**

| Function | Return type | Causes that the caller cannot identify |
|---|---|---|
| `createDataSet` | `Insert \| null` | No `LN` or `LN0`; name in use; maximum reached |
| `createGSEControl` | `Insert[]` | No `LN0`; name in use; missing `DataSet`; maximum reached |
| `createReportControl` | `Insert \| null` | No `LN` or `LN0`; name in use; missing `DataSet`; maximum or `maxBuf` reached |
| `createSampledValueControl` | `Insert[]` | Same causes as `createGSEControl` |
| `createGSEControl`, `createSampledValueControl` (partial result) | `Insert[]` of length 1 or 2 | No `ConnectedAP` exists. The function returns the control block only and omits the `GSE` or `SMV` part. Section 6.4 gives the treatment. |
| `createSMV` | `Insert \| null` | The parent is not a `ConnectedAP` |
| `instantiateSubscriptionSupervision` | `Insert \| null` | Five different supervision rules |
| `removeSupervision` | `Remove \| null` | Not removable; no `Val` to edit; `inst` conflict |
| `removeDataType` | `Remove[]` | Not in `DataTypeTemplates`; type is linked and `force` is false |
| `updateDataSet` | `SetAttributes[]` | Wrong tag; `DataSet` has no parent |
| `updateGSEControl`, `updateReportControl` | `Edit[]` | Wrong tag |
| `maxReportControl` | `{max: -1}` | "No maximum declared" has the same value as other conditions |
| `maxAttributes` | `{max: -1}` | "Root is not an `IED` or an `AccessPoint`" has the same value |

### 4.1 A missing `Services` element

Five files read a maximum from the `Services` element. They use three different values when the element is absent. Table 3 shows the values and the effect.

**Table 3: Effect when the `Services` element is absent**

| Module | Value when `Services` is absent | Result of the check function |
|---|---|---|
| `maxReportControl` | `-1` | Refuses |
| `maxDataSet` | `0` | Refuses |
| `maxGSEControl` | `0` | Refuses |
| `maxSampledValueControl` | `0` | Refuses |
| `maxAttributes` | Current `FCDA` count | Refuses |

The helper functions return different values. All check functions refuse the addition.

The comment in `maxReportControl` says that `-1` means "no maximum". The check function ignores this meaning and refuses the addition. `canAddReportControl` compares the requested count with `-1`. The comparison is always true. The caller cannot see the difference between `-1` and `0`.

The files also disagree about the source of the maximum. Table 4 shows the sequence.

**Table 4: Source of the maximum when both `IED` and `AccessPoint` declare one**

| Module | Sequence |
|---|---|
| `maxReportControl` | The larger of the two values |
| `maxDataSet` | `AccessPoint`, then `IED` |
| `maxGSEControl` | `AccessPoint`, then `IED` |
| `maxSampledValueControl` | `AccessPoint`, then `IED` |

These sequences disagree. Example: the `IED` declares `max="7"` and the `AccessPoint` declares `max="3"`. Report controls use 7. DataSets use 3. One shared `servicesLimits()` function must apply one sequence to all families.

These behaviours are accidental. They are not a policy. A tooltip cannot explain them. Decide the behaviour one time and put the decision in `details.scope`.

### 4.2 Limits that the file does not declare

The `Services` element is optional in the schema. Many SCL files do not contain it. Practical causes:

- Edition 1 files and older vendor files have no complete `Services` section.
- Exported or reduced files lose the section.
- A new edition can declare a service that this library does not know.
- A file can declare the element and omit a single attribute, for example `<ConfDataSet max="12"/>` without `maxAttributes`.

The library must not refuse to work on these files. If it does, a plugin cannot edit a large part of the real SCL that users open.

But some users require the strict behaviour. Example: a user prepares a file for a specific device, and the device does not declare a service. The user wants the library to refuse the addition.

The two requirements conflict. Use a policy option. Section 5.3 gives the type.

**Table 5: Options for an undeclared limit**

| Option | Default | Effect when the file declares no maximum | Effect when the file declares a maximum |
|---|---|---|---|
| `permit` | Yes | The check permits the addition. The result has `limits.scope: "unbounded"`. | The check compares the requested count with the declared value. |
| `refuse` | No | The check refuses the addition with `reason: "capability-undeclared"`. | The check compares the requested count with the declared value. |

Rules for the policy:

1. The default is `permit`. A plugin that does nothing gets no new refusal.
2. The policy applies to one call. Pass it in the options object. Do not use a global setting. Global state gives different results for two documents in one process, and it gives different results in tests.
3. The policy has one axis only: the handling of an undeclared limit. It does not change the structural checks, the name checks or the reference checks. A refused structural check stays a refusal in both policies. For this reason the option name describes the limit, not `strict`.
4. A declared `max="0"` is not a limit. It is a capability statement. Both policies refuse the addition with `capability-zero`. Real files use this form: Table 1 counts 44 declarations for `GOOSE` and 12 for `SMVsc`.
5. A value that is not a number is an undeclared limit. `permit` permits the addition. `refuse` refuses it.

### 4.3 Unused file

The file `tGSE/canAddSampledValueControl.ts` is a copy of the file in `tSampledValueControl`. Nothing imports it. It contains the variable names `apGOOSE` and `iedGOOSE`. Delete the file before you add new code.

## 5. One error model

### 5.1 Categories of concern

The schema has four kinds of constraint: `xs:unique`, `xs:key`, `xs:keyref` and type restrictions. IEC 61850-6 adds capability rules and semantic rules. Table 6 groups these into seven categories. Supervision rules use the same categories and need no category of their own.

**Table 6: Categories of concern**

| Category | Constraint source | What the category answers | Blocks the operation? |
|---|---|---|---|
| `target` | schema content model | Is there a valid place for the element? | Always |
| `capability` | `Services`, `tServiceWithMax` | Does the device declare the service, and with which maximum? | `zero`, `mode`, `invalid` always. `undeclared` follows `limitPolicy` |
| `limit` | `@max`, `@maxBuf`, `@maxAttributes` | Does the requested element stay within the declared maximum? | Always |
| `identity` | `xs:unique`, `xs:key` | Does another element use the same name, id or instance? | Always |
| `reference` | `xs:keyref` | Does the pointer have a target, and does a target still have no user? | Always, for the operation that creates the reference |
| `mapping` | IEC 61850-6 `Communication` | Does the communication section cover the control block? | Only when the caller requests the part |
| `restriction` | IEC 61850-7-3, IEC 61850-7-4, `valKind`, `valImport` | Is the data compatible with the request? | `mismatch` and `not-editable` always. `undeclared` never |

Rules for the categories:

1. **The first part of a reason code is its category.** Example: `limit-buffered-reached` is a `limit` reason. A host can group its messages with `reason.split("-")[0]`.
2. **A new reason code needs a category.** If no category fits, the proposal needs a new category and a review of Table 6.
3. **Every code states its source.** The source is a schema constraint name, an IEC clause or the word `policy`. The source goes in the comment of the constant.
4. **The category selects the default behaviour.** A `target` code never becomes a warning. A `capability-undeclared` code never becomes a refusal unless the caller sets `limitPolicy: "refuse"`.
5. **One set of codes serves two tasks.** The `check*` functions return the first refusal. A future document check, for example `validateScl`, returns all findings. Both use Table 7.

**Table 7: Reason codes**

| Code | Category | Meaning | Source |
|---|---|---|---|
| `target-missing` | `target` | No `LN`, `LN0`, `LDevice`, `AccessPoint` or `ConnectedAP` for the request | content model |
| `target-kind` | `target` | The element has the wrong tag | content model |
| `target-detached` | `target` | The element is not in a document | `policy` |
| `target-invalid` | `target` | The element cannot be used as a parent | content model |
| `capability-undeclared` | `capability` | The file does not declare the service | `policy` |
| `capability-zero` | `capability` | The file declares the service with `max="0"` | `tServiceWithMax` |
| `capability-mode` | `capability` | The file excludes the requested kind, for example `bufMode="unbuffered"` | `tServiceConfReportControl` |
| `capability-invalid` | `capability` | `max` is absent or is not a number | `tServiceWithMax` |
| `limit-reached` | `limit` | The requested count exceeds the declared total | `@max` |
| `limit-buffered-reached` | `limit` | The buffered count exceeds `maxBuf` | `@maxBuf` |
| `limit-unbuffered-reached` | `limit` | The unbuffered count exceeds the remaining total | `@max`, `@maxBuf` |
| `limit-attributes-reached` | `limit` | The DataSet exceeds `maxAttributes` | `@maxAttributes` |
| `identity-name-taken` | `identity` | Another element uses the name | `uniqueReportControlInLN0` and related |
| `identity-id-taken` | `identity` | Another element uses the id | `uniqueDTT_ID` |
| `identity-already-present` | `identity` | The supervision or subscription exists | `policy` |
| `identity-instance-conflict` | `identity` | The requested `inst` is in use | `uniqueLNInLDevice` |
| `reference-missing` | `reference` | The pointer has no target | `ref2DataSetGSELN0` and related |
| `reference-in-use` | `reference` | The target is still referenced | `ref2DOType` and related |
| `reference-duplicate` | `reference` | Two elements claim the same key | `uniqueConnectedAP` |
| `mapping-missing` | `mapping` | No `ConnectedAP` for the control block | `ConnectedAP` content model |
| `mapping-missing-gse` | `mapping` | The `ConnectedAP` has no `GSE` for the control block | `Communication` |
| `mapping-missing-smv` | `mapping` | The `ConnectedAP` has no `SMV` for the control block | `Communication` |
| `restriction-mismatch` | `restriction` | The `FCDA` does not meet the `ExtRef` restrictions | IEC 61850-7-3, IEC 61850-7-4 |
| `restriction-undeclared` | `restriction` | The `ExtRef` has no `pDO`, so the check cannot run | `policy` |
| `restriction-not-editable` | `restriction` | `valKind`, `valImport` or a Private marker forbids the change | IEC 61850-6 |

### 5.2 Reason codes

```ts
// foundation/errors.ts

/**
 * Machine-readable reasons. The string values are public API.
 * A change to a string value is a breaking change.
 * The first part of each value is its category. Section 5.1 gives the categories.
 */
export const sclReason = {
  // target: no valid place for the operation
  targetMissing: "target-missing",
  targetKind: "target-kind",
  targetDetached: "target-detached",
  targetInvalid: "target-invalid",

  // capability: what the file declares about the device
  capabilityUndeclared: "capability-undeclared", // policy: limitPolicy
  capabilityZero: "capability-zero",
  capabilityMode: "capability-mode",
  capabilityInvalid: "capability-invalid",

  // limit: a declared maximum
  limitReached: "limit-reached",
  limitBufferedReached: "limit-buffered-reached",
  limitUnbufferedReached: "limit-unbuffered-reached",
  limitAttributesReached: "limit-attributes-reached",

  // identity: names, ids and instances
  identityNameTaken: "identity-name-taken",
  identityIdTaken: "identity-id-taken",
  identityAlreadyPresent: "identity-already-present",
  identityInstanceConflict: "identity-instance-conflict",

  // reference: pointers between elements
  referenceMissing: "reference-missing",
  referenceInUse: "reference-in-use",
  referenceDuplicate: "reference-duplicate",

  // mapping: control block and Communication
  mappingMissing: "mapping-missing",
  mappingMissingGse: "mapping-missing-gse",
  mappingMissingSmv: "mapping-missing-smv",

  // restriction: compatible data
  restrictionMismatch: "restriction-mismatch",
  restrictionUndeclared: "restriction-undeclared",
  restrictionNotEditable: "restriction-not-editable",
} as const;

export type SclReason = (typeof sclReason)[keyof typeof sclReason];

/** The category of a reason. Section 5.1 gives the rules. */
type Prefix<T> = T extends `${infer C}-${string}` ? C : never;
export type SclCategory = Prefix<SclReason>;

/** One payload for all reasons. Each reason states the fields that it sets. */
export type SclReasonDetails = {
  /** Tag name of the element, for example `ReportControl` or `LN0`. */
  tag?: string;
  /** Source of the declared maximum. `unbounded` means that no maximum exists. */
  scope?: "AccessPoint" | "IED" | "LDevice" | "LN" | "unbounded";
  max?: number;
  maxBuffered?: number;
  buffered?: number;
  unbuffered?: number;
  requested?: number;
  name?: string;
  /** The element that caused the refusal, if one element is responsible. */
  element?: Element;
};

/** @returns The category prefix of a reason, for a host that groups messages. */
export function sclCategory(reason: SclReason): SclCategory {
  return reason.split("-")[0] as SclCategory;
}
```

### 5.3 Result object

```ts
/** The policy for a maximum that the file does not declare. The default is `permit`. */
export type LimitPolicy = "permit" | "refuse";

export type CheckResult =
  | { allowed: true; limits?: SclReasonDetails; incomplete?: SclReason[] }
  | { allowed: false; reason: SclReason; details: SclReasonDetails };
```

The result object keeps the shape that Stephen Renwick proposed. Three items change:

- The `reason` type is one shared vocabulary. It is not one enum for each element family.
- The result object has a `details` field.
- A permitted result can have a `limits` field. The host can then show a counter, for example "0 of 12 used". The field also shows an undeclared limit: `limits.scope === "unbounded"`. The host can then show an advisory message and still permit the addition.
- A permitted result can have an `incomplete` field. It lists the parts of the request that the operation cannot produce. Section 6.4 gives the rules. Do not add a third value to `allowed`. A three-valued result forces a `switch` at every call site for a condition that most callers ignore.

The host application needs one `switch` statement for all element families. The `details.tag` field gives the element name, for example "report instances" or "DataSets".

### 5.4 Error class

```ts
/** Use this class only when the caller is not correct. Do not throw it for a refusal. */
export class SclError extends Error {
  readonly reason: SclReason;
  readonly details: SclReasonDetails;

  constructor(reason: SclReason, details: SclReasonDetails = {}) {
    super(reason);
    this.name = "SclError";
    this.reason = reason;
    this.details = details;
  }
}
```

The error class uses the same reason codes and the same details object as the result object. A host application that catches `SclError` for a log record and reads `CheckResult` for the user interface needs one `switch` statement only.

### 5.5 Delivery rules

1. **Refusal: return the result.** Do not throw an error. Return `{allowed: false, reason, details}`. A disabled button is an expected condition. It is not an exception.
2. **Incorrect call: throw `SclError`.** Examples are a value that is not an element, options that contradict each other, and elements that are not in a document. Use the same reason codes.
3. **No third channel.** Do not add a new `null` value, a new `[]` value, a new special value or a new boolean check. Existing values stay unchanged. Section 6 gives the rules.
4. **One error class.** `SclError` is the only error class that the library throws.

## 6. The check functions

```ts
// tReportControl/checkAddReportControl.ts
import { maxReportControl } from "../tServices/tConfReportControl/maxReportControl.js";
import { reportControlCounts } from "./reportControlCounts.js";
import { CheckResult, sclReason } from "../foundation/errors.js";

/**
 * States whether the library can add a `ReportControl` to `parent`.
 * The function does not make an edit.
 * @returns `{allowed: true}`, or the first constraint that prevents the addition,
 * with the values that the function compared.
 */
export type CheckAddReportControlOptions = {
  buffered?: boolean;
  newInstances?: number;
  limitPolicy?: LimitPolicy;
};

export function checkAddReportControl(
  parent: Element,
  options: CheckAddReportControlOptions = { limitPolicy: "permit" },
): CheckResult {
  const isBuffered = options.buffered ?? true;
  const requested = options.newInstances ?? 1;
  const policy = options.limitPolicy ?? "permit";

  const anyLn =
    parent.tagName === "LN0" || parent.tagName === "LN"
      ? parent
      : parent.querySelector("LN0, LN");
  if (!anyLn)
    return {
      allowed: false,
      reason: sclReason.targetMissing,
      details: { tag: "ReportControl" },
    };

  const { max, maxBuf, scope } = servicesLimits(parent, "ConfReportControl");
  const { buffered, unbuffered } = reportControlCounts(parent);

  const details = {
    tag: "ReportControl",
    scope,
    max,
    maxBuffered: maxBuf,
    buffered,
    unbuffered,
    requested,
  };

  if (max !== undefined && buffered + unbuffered + requested > max)
    return { allowed: false, reason: sclReason.limitReached, details };

  const limit = isBuffered
    ? (maxBuf ?? max)
    : maxBuf === undefined
      ? max
      : max === undefined
        ? undefined
        : max - maxBuf;

  /** An undeclared limit is not a refusal, unless the caller asks for one. */
  if (limit === undefined)
    return policy === "refuse"
      ? { allowed: false, reason: sclReason.capabilityUndeclared, details }
      : { allowed: true, limits: details };

  const used = isBuffered ? buffered : unbuffered;
  if (used + requested > limit)
    return {
      allowed: false,
      reason: isBuffered
        ? sclReason.limitBufferedReached
        : sclReason.limitUnbufferedReached,
      details,
    };

  return { allowed: true, limits: details };
}
```

`servicesLimits(parent, "ConfReportControl")` is one shared helper. It replaces the five `max*` functions. It finds the maximum in this sequence: `AccessPoint`, then `IED`, then `unbounded`. It returns `max?: number`, not `-1`.

The helper only reads. It does not apply the policy. Each check function applies the policy to the limit that it uses.

### 6.1 Example for the host application

```ts
import { checkAddReportControl, CheckResult } from "@openscd/scl-lib";
import { msg } from "@lit/localize";

const check = checkAddReportControl(ln0, { buffered: true });

addButton.disabled = !check.allowed;
addButton.title = check.allowed ? "" : message(check);

function message(check: Extract<CheckResult, { allowed: false }>): string {
  const d = check.details;
  switch (check.reason) {
    case "target-missing":
      return msg`There is no logical node to add this ${d.tag ?? "element"} to.`;
    case "limit-reached":
      return msg`The maximum number of ${d.tag} instances (${(d.buffered ?? 0) + (d.unbuffered ?? 0)} of ${d.max}) has been reached.`;
    case "limit-buffered-reached":
      return msg`The maximum number of buffered ${d.tag} instances (${d.buffered} of ${d.maxBuffered}) has been reached.`;
    case "limit-unbuffered-reached":
      return msg`The maximum number of unbuffered ${d.tag} instances (${d.unbuffered} of ${(d.max ?? 0) - (d.maxBuffered ?? 0)}) has been reached.`;
    default:
      return msg`This ${d.tag ?? "element"} cannot be added.`;
  }
}
```

The host application makes Harald Brabenetz's three sentences with the calculated values. The host translation tool makes the translations. One `switch` statement serves all element families that use the same reason.

The host can read the `limits` field when the result is permitted. If `limits.scope` is `"unbounded"`, the host can show an advisory message and still permit the addition.

The host can pass `limitPolicy: "refuse"` when it prepares a file for a device with a complete `Services` section. Then the check refuses an addition that the file does not declare.

### 6.2 Function list

| Check function | Replaces | Reason codes |
|---|---|---|
| `checkAddDataSet(parent)` | `canAddDataSet` | `target-missing`, `identity-name-taken`, `limit-reached` |
| `checkAddGSEControl(ln0, o)` | `canAddGSEControl` | `target-missing`, `identity-name-taken`, `reference-missing`, `limit-reached` |
| `checkAddSampledValueControl(ln0, o)` | `canAddSampledValueControl` | Same as `checkAddGSEControl` |
| `checkAddReportControl(parent, o)` | `canAddReportControl` | `target-missing`, `identity-name-taken`, `reference-missing`, `limit-reached`, `limit-buffered-reached`, `limit-unbuffered-reached` |
| `checkAddFCDA(dataSet)` | `canAddFCDA`, `maxAttributes` | `target-invalid`, `limit-attributes-reached` |
| `checkInstantiateSubscriptionSupervision(s, o)` | `canInstantiateSubscriptionSupervision` | `target-missing`, `identity-already-present`, `restriction-not-editable`, `limit-reached` |

Every check function in the table can return `capability-undeclared`. The check returns this code only when the caller sets `limitPolicy: "refuse"` and the file declares no maximum. Every function also returns `capability-zero` when the file declares `max="0"`, and `capability-mode` when the declaration excludes the requested kind.

The reason codes `identity-name-taken` and `reference-missing` are not new. They exist in the private `invalid()` functions of the create functions. Move them into the check functions. Then each check function gives a complete answer.

### 6.3 Alternative: one return value per operation

This draft adds a check function next to each create function. A second design exists: change the create function itself. The create function returns the first failure or the edit.

```ts
/** Result of an operation. The caller gets the edit or the first reason why there is no edit. */
export type OperationResult<Edit> =
  | { ok: true; edits: Edit[] }
  | { ok: false; reason: SclReason; details: SclReasonDetails };

export function createDataSet(
  parent: Element,
  options: CreateDataSetOptions = { attributes: {} },
): OperationResult<Insert>;
```

A consumer then uses one call for both tasks:

```ts
const result = createDataSet(ln0, { attributes: { name: "DS1" } });
addButton.disabled = !result.ok;
addButton.title = result.ok ? "" : message(result);
```

Table 8 compares the two designs.

**Table 8: Parallel check functions and one return value**

| Item | Parallel check functions (this draft) | One return value per operation |
|---|---|---|
| Public functions per operation | Two: `checkAddX` and `createX` | One: `createX` |
| Risk that check and edit disagree | Yes. Two code paths must stay equal. A test must prove it. | No. One code path. |
| A caller can forget the check | Yes | No |
| Existing return type of `createX` | `Insert \| null` or `Edit[]`, unchanged | New type. Breaking change in every create function. |
| Button state without an edit | The check does the work only | The operation builds the edit, then the caller discards it |
| Migration for a consumer | Add one call, keep the old call | Change every call site and every return check |
| Size of the public surface | Larger. Six new functions and six old functions. | Smaller. Six functions, and the old ones change. |

Both designs give one result: **the first failure**. Stephen Renwick proposed this behaviour. Neither design returns a list of all problems. A file-level validation report is a different task. Section 10 keeps it out of scope.

The order of the checks must be stable. Both designs need one documented sequence. This draft uses:

1. Structural check: the target exists and has the correct type.
2. Name check: the name is not in use.
3. Reference check: the referenced element exists.
4. Limit check: the declared maximum is not exceeded.
5. Policy check: an undeclared limit is permitted or refused.

A test must lock the sequence. Without a lock, the message for one element can change between two releases.

**Recommendation: keep the check functions. Do not change the signature of the create functions.**

Two properties of the current code decide this:

1. **The create function answers a larger question than the check function.** `createGSEControl` and `createSampledValueControl` return a partial edit set when no `ConnectedAP` element exists. The set contains the control block and no `GSE` or `SMV` element. Example: `createGSEControl` calls `connectedAp(ln0, options.gse?.apName)`. A `null` result gives `return edits;` with one item. A single `{ok: true, edits}` result cannot show this partial success. The caller needs two questions:
   - "May I add this control block to this `LN0`?"
   - "Is the communication part included?"
2. **Drift between the two functions is avoidable without one return value.** Write the create function on top of the check function, and add a test that locks the relation:

```ts
// The create function must use the check function. One implementation of each rule.
const check = checkAddReportControl(anyLn, options);
if (!check.allowed) return null;
```

```ts
// Test: the two results agree for all fixtures.
expect(createReportControl(ln, options) === null).to.equal(
  !checkAddReportControl(ln, options).allowed,
);
```

These properties make the check function the correct home for the narrow question. The create function stays the home for the edit.

A further argument is the cost of migration. Every plugin call site uses `Insert | null` or `Insert[]` and checks the result. One return value forces a change at every call site.

**When one return value is the better design:**

- A new library with no consumers.
- A requirement to return all failures, not the first failure.
- An API that owns the user interface as well.

Revisit the decision if the project later adds a file-level validation function. That function must return all problems. It is a third task. It does not replace the check functions.

**Decision for this draft:** keep the check functions. Section 13.2 keeps the alternative open for the review.

### 6.4 Partial results

A create function can return an edit set that lacks a part of the request. Example: `createGSEControl` with a `gse` option and no `ConnectedAP` element. The function returns the control block only.

The library must not report this condition as a general third result. Use this rule instead:

> The check function answers for the same scope as the request. If the caller requests the communication part, the check function refuses an addition that cannot include it. If the caller does not request it, the single control block is a complete result.

```ts
// Communication part requested and not possible.
checkAddGSEControl(ln0, { gse: { apName: "AP1" } });
// { allowed: false, reason: "target-missing", details: { tag: "ConnectedAP" } }

// Communication part not requested.
checkAddGSEControl(ln0, {});
// { allowed: true }
```

The caller selects the scope. To add the control block without the `GSE` part, the caller omits `gse`.

If a host must show an advisory message and still continue, use the `incomplete` field on the permitted result:

```ts
{ allowed: true, incomplete: ["target-missing"] }
```

`incomplete` holds reason codes from the same vocabulary. It does not change the shape of the result, so `if (result.allowed)` stays correct.

Table 9 gives the treatment of each condition.

**Table 9: Treatment of a missing part**

| Condition | Requested by the caller | Result |
|---|---|---|
| No `ConnectedAP` for a requested `gse` or `smv` part | Yes | `allowed: false`, reason `target-missing` |
| No `ConnectedAP` for a requested `gse` or `smv` part | No | `allowed: true` |
| No `ConnectedAP`, and the host needs a warning | Yes, with `incomplete` requested | `allowed: true`, `incomplete: ["target-missing"]` |

This rule changes the current behaviour of `createGSEControl` and `createSampledValueControl` only when the caller requests the communication part. That correction belongs to the release decision in section 12.4. Record it in Table 13.

### 6.5 One function name with overloads

TypeScript can keep one function name and stay backward compatible. Use overloads. The return type depends on the options literal.

Add an overload to `createDataSet`: with `report: true` the function returns `OperationResult<Insert>`, and without it the function returns `Insert | null`. The return type follows the options literal. Existing call sites compile without a change. The design has three costs:

1. One name has two documented behaviours. It needs two test matrices.
2. The return type depends on a literal value. `const o = { report: true }` loses the narrowing. The caller must write `{ report: true } as const`.
3. The body branches on `report`. The internal split remains. The overloads hide it; they do not remove it.

A conditional throw (`{ throwOnFailure: true }`) does not solve the problem. TypeScript cannot change the return type after a runtime branch.

**Recommendation:** do not use overloads. Use one check function and one create function. The overload adds cost without removing the split.

### 6.6 Performance

The library must stay fast on large SCL files. The design keeps this property. Table 10 shows the work of the two functions.

**Table 10: Work in a check function and a create function**

| Work | Check function | Create function |
|---|---|---|
| Reads `Services` attributes | Yes | Yes, through the check function |
| Counts existing elements | Yes | Yes, through the check function |
| Creates elements | No | Yes |
| Finds a connected `ConnectedAP` | Only when the caller requests the communication part | Yes |
| Runs `macAddressGenerator` or `appIdGenerator` | No | Yes |
| Clones an element | No | No |

A check function does read-only queries. It allocates no element and runs no generator. The expensive parts stay in the create function.

The library has this cost today. Each `create*` function calls its `canAdd*` function internally. A plugin that calls `canAdd*` and then `createX` already pays for two rounds of queries. This change does not add work. It changes the first round from `false` to `false` plus a reason.

The double query occurs only when a caller runs both functions for one action. Rule 6 removes the allocation cost from that path. It does not remove the query cost.

**Rules for the implementation:**

1. **Query the smallest scope that answers the question.** Use `:scope` selectors. Do not query from the document root when the parent is sufficient.
2. **No allocation in a check function.** No `createElement`, no `cloneNode`, no generator.
3. **One check per create call.** The create function calls the check function one time.
4. **No cache.** A cache needs a key from the document version. The DOM has no such version. A stale result causes a wrong edit, and an edit is worse than a slow query.
5. **The host runs the check one time for each render.** A tooltip for ten buttons is ten checks, not one check for each mouse move.
6. **The heaviest checks are known.** `checkInstantiateSubscriptionSupervision` reads `DataTypeTemplates`. `checkAddReportControl` counts all `ReportControl` instances. Measure these two first.
7. **Measure before optimising.** Add one test with a large generated SCL file. Record the time of each check function and each create function. Set a budget: a check function costs less than the matching create function on the same fixture.

**Rejected alternatives:**

- **Cache the result of a check.** See rule 4.
- **Pass the check result to the create function.** Example: `createX(parent, options, check)`. The library saves one round of queries. The risk is a stale result and an edit built on it. Revisit this option only if the measurement in rule 7 shows a problem.
- **`skipCheck`.** It exists today for a caller that knows the state. It does not return a reason. Do not extend it.

### 6.7 Risk of desynchronised functions

Two functions that answer one question can disagree. This risk is real, and the current code already contains examples. Table 11 lists each cause, the evidence in the current code, and the countermeasure.

**Table 11: Causes of disagreement and countermeasures**

| # | Cause | Evidence in the current code | Countermeasure | Test |
|---|---|---|---|---|
| R1 | The two functions take different option shapes | `canAddReportControl(parent, {buffered: boolean})`. `createReportControl(parent, {rpt: {buffered: "true" \| "false"}})` | One normalised options type. Both functions use it. | Every combination of `buffered` and `instances` |
| R2 | The create function drops options before the check | `createReportControl` calls `canAddReportControl(anyLn)` with no options. The call always uses `buffered: true` and `newInstances: 1`. | The create function passes the normalised options to the check function. | Create an unbuffered report and a report with `instances: "20"`. Compare with the check result. |
| R3 | The two functions resolve the target element differently | The create functions use `parent.tagName === "LN0" ? parent : parent.querySelector("LN0, LN")`. A check function that uses `closest()` finds an ancestor instead. | One `targetFor(parent)` helper. Both functions use it. | An `LDevice` with two `LN` elements. A nested `AccessPoint`. |
| R4 | One function changes the options object of the caller | `createGSEControl` and `createSampledValueControl` run `delete options.gse.apName` on the caller's object | Copy the options before a change | Call the check function and the create function with one options object, in both sequences |
| R5 | The create function does not forward the policy | Not present today. Risk when `limitPolicy` is added. | The policy is part of the one options object | Run both policies for each family |
| R6 | The document changes between the two calls | The host checks during a render and creates during a click | The create function checks again. Treat the check as advice and the create as the authority. | Document this rule. No test. |
| R7 | A later change adds a condition to one function only | Not present today | Review rule: a new condition needs a reason code, a check test and an equivalence test | The equivalence test fails on the next run |

R2 is a defect today. A buffered report with `instances: "20"` uses 20 report instances. The check adds 1 and compares that value with `max`. The function permits an edit that exceeds `max`. Table 13 must list this correction.

**Minimum test set for the relation:**

1. For each family and each fixture: `createX(...) === null` or `[]` is equal to `!checkX(...).allowed`.
2. The same test with both policy values.
3. The same test with the options that R1, R2 and R3 describe.
4. The same test when the caller uses one options object for both calls.

The review rule for R7 goes into the pull request template: "A new precondition in a create function needs a reason code and a check test in the same pull request."

### 6.8 Counting rules

A limit check needs one counting rule for each declared maximum. The schema gives the attribute. The schema does not give the unit. This draft states the unit for each attribute. Table 12 gives the rules.

**Table 12: Counting rules**

| Attribute | Quantity that the check counts | Evidence from Table 1 |
|---|---|---|
| `ConfReportControl@max` | `ReportControl` elements in the scope | 6 violations. Counting `RptEnabled@max` instances gives 72. |
| `ConfReportControl@maxBuf` | `ReportControl` elements with `buffered="true"` | 6 violations |
| `ConfDataSet@max` | `DataSet` elements for each `LDevice` in the scope | 0 violations |
| `ConfDataSet@maxAttributes` | `FCDA` elements in one `DataSet` | No violation measured. The largest `DataSet` has 356 `FCDA`. |
| `GOOSE@max` | `GSEControl` elements in the scope | 16 violations |
| `SMVsc@max` | `SampledValueControl` elements in the scope | 0 violations |

The report control rule is a defect correction. `numberReportControlInstances` sums `RptEnabled@max` and the check compares that sum with `max`. The study shows the result: 72 refusals against 6 under this rule. The library refuses valid edits in 24 of 120 files.

`RptEnabled@max` defines the number of client instances of one report control block. It does not add report control blocks to the logical node.

The library keeps the instance numbers in `details` (`buffered`, `unbuffered`, `requested`). A host can then show them. The check does not compare them with `max`.

`reportControlCounts(parent)` is the helper for this rule. It counts elements and not instances.

## 7. Policy for functions that fail without a reason

1. **`null` and `[]` keep one meaning: no edit.** Do not change this behaviour. Do not add a second meaning.
2. **Every function in Table 2 names the check function that gives the reason.** Either add the check function, or write the single cause in the function comment. Sequence: create functions first, then remove functions, then update functions.
3. **A structural return is a filter, not a failure.** `updateDataSet` returns `[]` when the tag is not `DataSet`. This return filters a sequence of edits. Keep it. Add a reason only when the caller expects an edit and the library cannot make it.
4. **No new `null`, `[]`, special value or boolean check.** New public functions return `CheckResult` or an edit. An incorrect call throws `SclError`.
5. **Remove the special values from the internals.** The internal `max*` functions become one `servicesLimits()` result with `scope: "unbounded"` and `max?: undefined`. The public `maxAttributes` keeps its current values until the next major version. Section 12.1 gives the reason.
6. **Table 2 becomes part of the README.** Add a test that each function in the table still exists and still has the documented return type. Then the table stays correct.
7. **`createX` calls `checkX` one time. A caller does not call `checkX` before `createX`.** A caller that needs a reason or a disabled state calls `checkX` and discards the result at the next change. The check is a query, not a precondition. No function accepts a check result as an argument. Section 6.6 lists that option as rejected.

## 8. Deprecation of the public boolean checks

`canInstantiateSubscriptionSupervision` and `canAddFCDA` are public today. Keep both functions as thin deprecated functions:

```ts
/**
 * @deprecated Use {@link checkInstantiateSubscriptionSupervision}. The new function
 * gives the reason. This function stays until version 3.0.
 */
export function canInstantiateSubscriptionSupervision(
  supervision: Supervision,
  options: SupervisionOptions = {
    /* … */
  },
): boolean {
  return checkInstantiateSubscriptionSupervision(supervision, options).allowed;
}
```

- The import path and the signature do not change.
- The deprecated function calls the check function. The library has one implementation of each rule.
- The deprecated function uses the library default policy. It has no separate behaviour. One default for the whole library is the only way to keep `can*` and `create*` in agreement. Section 13 states the consequence.
- The `check*` function must obey `SupervisionOptions`: `checkEditableSrcRef`, `checkDuplicateSupervisions` and `checkMaxSupervisionLimits`. These options select the rules to apply. They do not change the reason report.
- Do not deprecate `maxAttributes`. Make it a thin function that uses `servicesLimits()`. Remove the `-1` value in the next major version only.
- Use this sequence: export `check*` and keep the old export in the same release, then add `@deprecated`, then remove the old function in version 3.0.
- The functions `canAddDataSet`, `canAddGSEControl` and `canAddSampledValueControl` are not exported now. Export them before you deprecate them. A deprecated function that is not exported gives no migration path.

## 9. Public API and README

Add these items to `index.ts`:

- `sclReason`, `SclReason`, `SclReasonDetails`
- `CheckResult`, `SclError`
- All `check*` functions
- The old `can*` functions

Add a section "Checks and errors" to the README. The section contains:

- The result object shape.
- The rule that `reason` holds a code and `details` holds the values.
- The rule that the library contains no user text and no translations.
- The rule for returned results and thrown errors.
- The seven categories of concern and the rule for a new reason code (Section 5.1).
- Table 2.

This section is the first README content that is not about edit functions. State it clearly for this reason.

## 10. Out of scope

- User text, message catalogues, a `lang` option, `Intl` formatting. The host application owns the user text. In open-scd, `lit-localize` makes the translations. The `details` object gives the host application all values that it needs.
- User interface concepts: buttons, tooltips, severity levels.
- Changes to the signature of any edit function.

## 11. Tests

- For each `can*` function, add a test that `check*(...).allowed === can*(...)`. Use the existing test data.
- Add a test for each family with a fixture that has no `Services`, and with `limitPolicy: "refuse"`. This test reproduces the current refusal and proves the strict policy works.
- For each reason code, add a test that checks the exact values in `details`.
- For each element family, add a test with no `Services` element. The test must show `allowed: true` and `limits.scope: "unbounded"`.
- For each element family, add the same test with `limitPolicy: "refuse"`. The test must show `reason: "capability-undeclared"`.
- For each element family, add a test with a declared `max="0"`. The result must be a refusal in both policies.
- For each element family, add a test with the `Services` element and without the attribute. The test must show the same result as the test without the `Services` element.
- Add a test that `createX` returns `null` or `[]` only when `checkX(...).allowed` is `false`. Section 6.7 gives the minimum test set for this relation.
- Add a test that one options object gives the same result when the caller passes it to the check function first and to the create function first (Table 11, R4).
- Add a test for the requested-scope rule. `checkAddGSEControl` with a `gse` option and no `ConnectedAP` returns `target-missing`. The same call without the `gse` option returns `allowed: true`.
- Add a test that `SclError` occurs for incorrect caller input.
- Add a test for each category: a reason from the category returns `sclCategory(reason)` equal to the prefix.
- Add a test for a declared `max="0"`: `reason` is `capability-zero` in both policies.
- Add a test for the counting rule (Table 12): a file with one `ReportControl` and `RptEnabled max="20"` is within `max="4"`.
- Add a test for the counting rule with `instances: "20"`: the create function reports one new control block.
- Add one performance test with a large generated SCL file. Record the time of each check function and each create function. Section 6.6 rule 7 gives the budget.

## 12. Backward compatibility

### 12.1 What stays the same

These items do not break a consumer:

- All new exports and all new options. `limitPolicy` is optional in every options object.
- All existing signatures. No parameter changes and no return-type changes.
- `null` and `[]` keep their meaning: no edit. No existing function starts to throw. `skipCheck` keeps its meaning.
- `maxAttributes` keeps its exact current values and its `{max: number; scope: string}` type. The new `servicesLimits()` is a second reader. Do not rewrite `maxAttributes` on top of it in this release.
- Deprecated functions keep their import path and their signature.

### 12.2 What changes behaviour

The default policy `permit` changes the result of existing public functions. Table 13 lists them.

**Table 13: Behaviour changes caused by the default policy**

| Public function | Condition | Result before | Result after |
|---|---|---|---|
| `canAddFCDA` | No `ConfDataSet` or no `maxAttributes` | `false` | `true` |
| `canInstantiateSubscriptionSupervision` | No `Services > SupSubscription` maximum | `false` | `true` |
| `canAddDataSet`, `canAddGSEControl`, `canAddReportControl`, `canAddSampledValueControl` | No `Services` element or no attribute | `false` | `true`. Not exported today; exported by this change. |
| `createDataSet`, `createReportControl` | No `Services` element or no attribute | `null` | An edit |
| `createGSEControl`, `createSampledValueControl` | No `Services` element or no attribute | `[]` | An edit |
| `instantiateSubscriptionSupervision`, `insertSubscriptionSupervisions` | No `SupSubscription` maximum | `null` | An edit |
| `createGSEControl`, `createSampledValueControl` | A `gse` or `smv` part is requested and no `ConnectedAP` exists | Control block insert only | `[]`. The check function refuses with `target-missing`. Section 6.4 gives the rule. |
| `createReportControl` | `rpt.buffered` is `"false"`, or `instances` is greater than 1 | The check always uses `buffered: true` and one instance (Table 11, R2) | The check uses the requested values. The function can refuse an edit that it permits today. |
| `canAddReportControl`, `createReportControl` | Any file where `RptEnabled@max` is greater than 1 | Instances are compared with `max` and `maxBuf` | Control blocks are compared with `max` and `maxBuf` (Table 12). The function permits edits that it refuses today, and it can refuse an edit with a large `instances` value. |

A consumer sees the change only on a file that does not declare the limit. A file with a complete `Services` section gives the same result as before.

The change affects two further items:

- `tGSE/canAddSampledValueControl.ts` is deleted. A consumer that deep-imports this file breaks. No file imports it and no export references it.
- `tReportControl/canAddReportControl.ts` and the other `canAdd*` modules stay at their paths. This change moves no file.

### 12.3 Rules for this release

1. **One default policy for the whole library.** `can*`, `check*` and the create functions agree at all times. Do not pin the old behaviour in the deprecated functions. Two behaviours for one question is worse than one declared change.
2. **No new failure mode for existing callers.** An existing function does not start to throw. `SclError` occurs only in the new `check*` functions, and only for incorrect input.
3. **No type change to an existing export.** `maxAttributes` and `SupervisionOptions` keep their types. New optional fields are the only extension.
4. **A consumer restores the old behaviour with one option.** `limitPolicy: "refuse"` gives the strict result. This is the migration path for a consumer that must keep the old refusal.
5. **The changelog states the behaviour change in the first paragraph.** Do not hide it in a list of features.

### 12.4 Release vehicle

The behaviour change in Table 13 breaks semantic versioning. Select one option:

- **Option A (recommended): release 3.0.0.** The strict option is available in the same release. A consumer that wants the old behaviour sets `limitPolicy: "refuse"` one time.
- **Option B: release 2.1.0 and treat the current refusal as a defect.** Argument: the library invents a constraint that the file does not declare. Cost: `^2` consumers get the new behaviour without a version change. The changelog must state the change in the first paragraph.

Release-please reads the commit message. Use `feat!:` or a `BREAKING CHANGE:` footer for Option A.

## 13. Decisions and open questions

### 13.1 Decided in this draft

1. **The default policy permits an undeclared limit.** A file without `Services`, or without one attribute, does not prevent an edit. The caller can set `limitPolicy: "refuse"` for the strict behaviour. Table 5 gives the rules.
2. **The policy applies to one call and has one axis.** The library has no global setting, and it has no general `strict` mode.
3. **The library contains no user text and no translations.** The host application makes the messages. See section 10.
4. **The check function answers for the same scope as the request.** A part that the caller does not request is not a failure. Section 6.4 gives the rule.
5. **One function name has one behaviour.** Do not use overloads to add a second return type. Section 6.5 gives the reason.
6. **Seven categories of concern hold every reason code.** Section 5.1 gives the categories, the codes and their sources.
7. **The check counts elements and not instances for `ConfReportControl`.** Section 6.8 gives the counting rules and the evidence.

### 13.2 Decisions for the reviewers

Each decision gives the options and our preferred answer. Reply with the decision number and the letter. A reply can also propose a new option.

The option letters are not ordered by merit. In most decisions we list our preferred answer first, so it carries the letter A. Review each option on its own.

**Table 14: Summary of the decisions**

| # | Decision | Our preferred answer | Main cost of the alternative |
|---|---|---|---|
| D1 | API shape | Check functions | Breaks every call site |
| D2 | Reason vocabulary | One global `SclReason` | One `switch` for each family in every host |
| D3 | Text and translation | No text in the library | Translation and number formatting inside the library |
| D4 | Throwing | Return a refusal, throw only for an incorrect call | `try`/`catch` for a disabled button |
| D5 | Undeclared limit | `permit` | A file without `Services` becomes impossible to edit |
| D6 | Option name | `limitPolicy` | The name suggests more rules than the option applies |
| D7 | Declared maximum | Refuse | An edit that the device cannot accept |
| D8 | Partial result | Requested-scope rule | Two result shapes to document and test |
| D9 | Release vehicle | 3.0.0 | `^2` consumers get a behaviour change |
| D10 | First pull request | Error model, six checks, wrappers, README | A later pull request for each family |
| D11 | `maxAttributes` | Change in 3.0 | Breaking return type in a minor release |
| D12 | Check reads `name` and `datSet` | Yes | The create function stays the only place with the full answer |
| D13 | `checkRemove*` now | Later | A user interface for `force` waits |
| D14 | Correct the `ReportControl` check | In this release | The new API repeats a known defect |
| D15 | Counting rule for `ConfReportControl` | Elements, not instances | 72 false refusals in 24 of 120 files |

#### D1. API shape

- **A.** A check function next to each create function. Section 6.3.
- **B.** One return value for each operation. Section 6.3.
- **C.** One function name with overloads. Section 6.5.

**Preferred answer: A.** It keeps the create function as the only builder of edits, and a partial edit set stays visible.

#### D2. Reason vocabulary

- **A.** One global `SclReason` for all families.
- **B.** One enum for each element family, as in the example from Stephen Renwick.
- **C.** Global codes for structural problems, family codes for limits.

**Preferred answer: A.** The host writes one message for each reason, not one for each element family.

#### D3. Text and translation

- **A.** No text in the library. The `details` object holds the values.
- **B.** Text in the library with a `lang` option, as Harald Brabenetz proposed.
- **C.** A reason code plus an English template shipped as data.

**Preferred answer: A.** The host owns the text and the translation. The library keeps one machine-readable answer.

#### D4. Throwing

- **A.** Return a refusal. Throw `SclError` only for an incorrect call.
- **B.** Never throw. Every failure is a result.
- **C.** Throw for every failure.

**Preferred answer: A.** A disabled button is an expected condition, not an exception.

#### D5. Default for an undeclared limit

- **A.** `permit`. A file that declares no maximum does not prevent an edit.
- **B.** `refuse`. The library refuses the addition.

**Preferred answer: A.** The library must not refuse an edit because a file omits an optional element.

#### D6. Name of the policy option

- **A.** `limitPolicy: "permit" | "refuse"`.
- **B.** `strict: boolean`.
- **C.** `undeclaredLimit: "permit" | "refuse"`.

**Preferred answer: A.** The name states the one thing that the option changes.

#### D7. Declared maximum

- **A.** Refuse an addition above a declared maximum.
- **B.** Permit it and report a warning.

**Preferred answer: A.** A declared maximum is a device capability. An edit above it produces a file that the device cannot accept.

#### D8. Partial result

- **A.** The requested-scope rule only. Section 6.4.
- **B.** The rule plus the `incomplete` field on a permitted result.
- **C.** A third value in `allowed`, for example `allowed: "partial"`.

**Preferred answer: A.** The rule gives a correct answer without a second result shape.

#### D9. Release vehicle

- **A.** Version 3.0.0. Table 13 lists the behaviour changes.
- **B.** Version 2.1.0. The changelog states the behaviour change in the first paragraph.

**Preferred answer: A.** The behaviour change in Table 13 breaks semantic versioning.

#### D10. Content of the first pull request

- **A.** `foundation/errors.ts`, `servicesLimits()`, the six `check*` functions, the deprecated wrappers, the README section, and the removal of the dead file.
- **B.** The error model and `checkAddReportControl` only. One family proves the shape.
- **C.** A plus `checkRemove*` and `checkUpdate*`.

**Preferred answer: A.** The shape of the API is one decision. Review it one time.

#### D11. `maxAttributes`

- **A.** Keep the current values and type. Align it in version 3.0.
- **B.** Change it in this release to `{max?: number; scope: ...}`.

**Preferred answer: A.** The return type of an exported function must not change in the current major version.

#### D12. Does the check read `name` and `datSet`?

- **A.** Yes. The check gives a complete answer: structure, name, reference and limit.
- **B.** Limits only. The create function stays the only place that checks the name and the reference.

**Preferred answer: A.** It answers all four causes of the same refusal.

#### D13. `checkRemove*` in this release

- **A.** Later. The `removeDataType` case needs a reason for `force`.
- **B.** `removeDataType` only.
- **C.** All remove functions.

**Preferred answer: A.** No consumer asks for it yet. Add it when a user interface needs `force`.

#### D14. Correct the `ReportControl` check in this release

`createReportControl` calls `canAddReportControl(anyLn)` without options. The call ignores `rpt.buffered` and `instances` (Table 11, R2). The create function can exceed `max` or `maxBuf`.

- **A.** Correct it in this release. The check uses the requested `buffered` value and the requested instance count.
- **B.** Separate pull request before the check functions.
- **C.** Correct it in version 3.0 with the other behaviour changes.

**Preferred answer: A.** New callers must not receive an API that repeats a known defect. The correction belongs in Table 13.

#### D15. Counting rule for `ConfReportControl`

- **A.** Count `ReportControl` elements against `max` and `maxBuf` (Table 12).
- **B.** Count `RptEnabled@max` instances, as `numberReportControlInstances` does today.
- **C.** Count elements by default and give the host an option to count instances.

**Preferred answer: A.** The files in the study use the element rule. The instance numbers stay visible in `details`.


## Appendix A. Full measurement table

Table 15 adds the rows that Section 2.1 omits for length.

**Table 15: Additional measurements**

| Condition | Count | Files |
|---|---|---|
| Scope above `ConfDataSet@max` | 0 | — |
| `GSEControl` against `GSE` elements in `Communication` | 1,579 against 1,265 | — |
| `SampledValueControl` against `SMV` elements in `Communication` | 403 against 337 | — |
| DataTypeTemplates reference without a target | 12 | 3 |
| Duplicate `ConnectedAP` (`iedName` and `apName`) | 22 | 6 |
| Duplicate `LDevice inst` in one `IED` | 0 | — |
| `Services` element with a declared service that has no `max` | 1 | 1 |

## Appendix B. Method of the study

The study read the SCL files that users open, not the test fixtures of the library.

- Collections: three local directories with project files, vendor files and test material.
- Population: 716 files with the extension `.scd`, `.cid` or `.icd`, between 20 kB and 60 MB.
- Sample: 120 files at a fixed interval over the sorted list, plus the four largest files.
- Size of the sample: 676 **IED**, 9,986 `ReportControl`, 1,579 `GSEControl`, 403 `SampledValueControl`, 3,116 `DataSet`, 63,323 `FCDA`, 40,321 `ExtRef`, 76,612 `Private`.
- Schema: `IEC_61850-6.2018.SCL.2007B4.full`. The study used `xs:unique`, `xs:key` and `xs:keyref`.
- Editions: 117 files with `version="2007"`, 3 files with no `version` attribute.
- Parser: a one-pass streaming reader. It does not change the files.

Limits of the study:

1. The sample is not a random sample of all SCL in the world. It is a sample of the files available on one machine.
2. The study counts a condition. It does not decide which party is correct. A maximum that a real file exceeds can be a fault in the file or a different reading of the standard.
3. The report control rows (Table 1 and Table 12) show the difference between two readings of `ConfReportControl@max`. The study does not settle the reading. Decision D15 asks the reviewers to settle it.
