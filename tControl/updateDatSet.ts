import { SetAttributes } from "@openscd/oscd-api";

const controlBlockTags = ["ReportControl", "GSEControl", "SampledValueControl"];

/**
 * On update the `datSet` attribute of a given control block this function will change
 * `DataSet.name` attribute as well if the `DataSet` is only used by this control block.
 */
export function updateDatSet(
  setAttributes: SetAttributes,
): SetAttributes | null {
  const newDatSet = setAttributes?.attributes?.datSet;
  const controlBlock = setAttributes.element;
  const oldDatSet = controlBlock.getAttribute("datSet");

  if (!newDatSet || !controlBlockTags.includes(controlBlock.tagName))
    return null;

  const isDataSetUsedByThisElementOnly =
    Array.from(
      controlBlock.parentElement?.querySelectorAll(
        `:scope > ReportControl[datSet="${oldDatSet}"], 
         :scope > GSEControl[datSet="${oldDatSet}"], 
         :scope > SampledValueControl[datSet="${oldDatSet}"]`,
      ) ?? [],
    ).length === 1;
  if (!isDataSetUsedByThisElementOnly) return null;

  const dataSet = setAttributes.element.parentElement?.querySelector(
    `DataSet[name="${oldDatSet}"]`,
  );
  if (!dataSet) return null;

  return { element: dataSet, attributes: { name: newDatSet } };
}
