import { expect } from "vitest";

import { updateLnType } from "./updateLnType.js";
import {
    docWithLNodesAndDataTypes,
    docWithMissingDOs,
    docWithMissingSDOs,
    docWithMissingDAs,
    docWithMissingBDAs,
    docWithNoLNodes,
    docWithDifferentLnType,
    docWithoutDataTypeTemplates,
    docWithSourceRefs,
    docWithMalformedSourceRefs,
    docWithComplexNestedStructures,
    docWithMixedLNodes,
} from "./updateLnType.testfiles.js";

describe("updateLnType", () => {
    describe("with valid LNodeType and matching LNode instances", () => {
        it("returns empty array when all DOS, SDS, and DAS elements are valid", () => {
            const doc = new DOMParser().parseFromString(
                docWithLNodesAndDataTypes,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("removes DOS elements when corresponding DO is missing from LNodeType", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingDOs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(1);
            expect((removes[0].node as Element).tagName).to.equal("eTr_6-100:DOS");
            expect((removes[0].node as Element).getAttribute("name")).to.equal("PhV");
        });

        it("removes SDS elements when corresponding SDO is missing from DOType", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingSDOs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(2);
            removes.forEach(remove => {
                expect((remove.node as Element).tagName).to.equal("eTr_6-100:SDS");
                expect(["phsB", "phsC"]).to.include((remove.node as Element).getAttribute("name"));
            });
        });

        it("removes DAS elements when corresponding DA is missing from DOType", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingDAs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(4);
            removes.forEach(remove => {
                expect((remove.node as Element).tagName).to.equal("eTr_6-100:DAS");
                expect(["q", "t"]).to.include((remove.node as Element).getAttribute("name"));
            });
        });

        it("removes SDS elements when corresponding BDA is missing from DAType", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingBDAs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(1);
            expect((removes[0].node as Element).tagName).to.equal("eTr_6-100:SDS");
            expect((removes[0].node as Element).getAttribute("name")).to.equal("ang");
        });

        it("handles multiple LNode instances with the same lnType", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingDOs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            // Add another LNode with the same lnType and missing DOS
            const substation = doc.querySelector("Substation")!;
            const newLNode = doc.createElement("LNode");
            newLNode.setAttribute("lnClass", "MMXU");
            newLNode.setAttribute("lnType", "MMXU_1");
            newLNode.setAttribute("lnInst", "3");

            const privateEl = doc.createElement("Private");
            privateEl.setAttribute("type", "eIEC61850-6-100");

            const dos = doc.createElementNS("http://www.iec.ch/61850/2019/SCL/6-100", "eTr_6-100:DOS");
            dos.setAttribute("name", "PhV");
            const sds = doc.createElementNS("http://www.iec.ch/61850/2019/SCL/6-100", "eTr_6-100:SDS");
            sds.setAttribute("name", "phsA");
            sds.setAttribute("name", "phsA");
            dos.appendChild(sds);
            privateEl.appendChild(dos);
            newLNode.appendChild(privateEl);
            substation.appendChild(newLNode);

            const removes = updateLnType(lNodeType, doc);

            // Should remove PhV DOS from both LNode instances
            expect(removes).to.have.lengthOf(2);
            removes.forEach(remove => {
                expect((remove.node as Element).tagName).to.equal("eTr_6-100:DOS");
                expect((remove.node as Element).getAttribute("name")).to.equal("PhV");
            });
        });
    });

    describe("with edge cases", () => {
        it("returns empty array when no LNode instances match the lnType", () => {
            const doc = new DOMParser().parseFromString(
                docWithDifferentLnType,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("returns empty array when no LNode instances exist", () => {
            const doc = new DOMParser().parseFromString(
                docWithNoLNodes,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("handles LNodeType without id attribute", () => {
            const doc = new DOMParser().parseFromString(
                docWithLNodesAndDataTypes,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;
            lNodeType.removeAttribute("id");

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("handles LNodeType from external document (without DataTypeTemplates in target)", () => {
            const doc = new DOMParser().parseFromString(
                docWithoutDataTypeTemplates,
                "application/xml"
            );

            // Create an external LNodeType (e.g., from template library)
            const externalLNodeType = doc.createElement("LNodeType");
            externalLNodeType.setAttribute("id", "MMXU_1");
            externalLNodeType.setAttribute("lnClass", "MMXU");

            // Add DO that matches the LNode instance
            const behDO = doc.createElement("DO");
            behDO.setAttribute("name", "Beh");
            behDO.setAttribute("type", "BehaviourDO");
            externalLNodeType.appendChild(behDO);

            const removes = updateLnType(externalLNodeType, doc);

            // Should work with external LNodeType and not remove valid DOS
            expect(removes).to.have.lengthOf(0);
        });

        it("removes elements when using external LNodeType with different structure", () => {
            const doc = new DOMParser().parseFromString(
                docWithoutDataTypeTemplates,
                "application/xml"
            );

            // Create an external LNodeType that doesn't include the "Beh" DO
            const externalLNodeType = doc.createElement("LNodeType");
            externalLNodeType.setAttribute("id", "MMXU_1");
            externalLNodeType.setAttribute("lnClass", "MMXU");

            // Add a different DO that doesn't match the LNode instance
            const otherDO = doc.createElement("DO");
            otherDO.setAttribute("name", "A");
            otherDO.setAttribute("type", "WYE");
            externalLNodeType.appendChild(otherDO);

            const removes = updateLnType(externalLNodeType, doc);

            // Should remove the "Beh" DOS since it's not in the external LNodeType
            expect(removes).to.have.lengthOf(1);
            expect((removes[0].node as Element).tagName).to.equal("eTr_6-100:DOS");
            expect((removes[0].node as Element).getAttribute("name")).to.equal("Beh");
        });

        it("handles LNode without Private element", () => {
            const doc = new DOMParser().parseFromString(
                docWithLNodesAndDataTypes,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            // Remove Private element from LNode
            const lNode = doc.querySelector('LNode[lnType="MMXU_1"]')!;
            const privateEl = lNode.querySelector("Private");
            if (privateEl) {
                lNode.removeChild(privateEl);
            }

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("handles LNode with Private element but no DOS children", () => {
            const doc = new DOMParser().parseFromString(
                docWithLNodesAndDataTypes,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            // Remove all DOS elements from Private
            const lNode = doc.querySelector('LNode[lnType="MMXU_1"]')!;
            const privateEl = lNode.querySelector("Private")!;
            const dosElements = Array.from(privateEl.querySelectorAll("DOS"));
            dosElements.forEach(dos => privateEl.removeChild(dos));

            const removes = updateLnType(lNodeType, doc);

            expect(removes).to.have.lengthOf(0);
        });

        it("handles nested data structures with missing elements at different levels", () => {
            const doc = new DOMParser().parseFromString(docWithComplexNestedStructures, "application/xml");
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            // Should remove: PhV DOS, phsB SDS, q DAS, ang SDS
            expect(removes).to.have.lengthOf(4);

            const removedNames = removes.map(r => (r.node as Element).getAttribute("name"));
            expect(removedNames).to.include("PhV");
            expect(removedNames).to.include("phsB");
            expect(removedNames).to.include("q");
            expect(removedNames).to.include("ang");
        });
    });

    describe("SourceRef removal", () => {
        it("removes SourceRef elements when referenced data structures are missing", () => {
            const doc = new DOMParser().parseFromString(
                docWithSourceRefs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            // Should remove: 1 DOS (PhV), 1 SDS (phsC), 1 SDS (ang), 1 DAS (t), and 5 SourceRefs
            expect(removes).to.have.lengthOf(9);

            const removedSourceRefs = removes.filter(r => (r.node as Element).localName === "SourceRef");
            expect(removedSourceRefs).to.have.lengthOf(5);

            const removedResourceNames = removedSourceRefs.map(r =>
                (r.node as Element).getAttribute("resourceName")
            );

            expect(removedResourceNames).to.include("InvalidPhVReference");
            expect(removedResourceNames).to.include("InvalidPhsCReference");
            expect(removedResourceNames).to.include("InvalidAngReference");
            expect(removedResourceNames).to.include("InvalidTReference");
            expect(removedResourceNames).to.include("CrossLNodeReference");

            // Valid SourceRefs should not be removed
            expect(removedResourceNames).to.not.include("ValidReference");
        });

        it("removes SourceRef elements from different LNodes when they reference invalid data", () => {
            const doc = new DOMParser().parseFromString(
                docWithSourceRefs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            const removedSourceRefs = removes.filter(r => (r.node as Element).localName === "SourceRef");
            const crossLNodeRef = removedSourceRefs.find(r =>
                (r.node as Element).getAttribute("resourceName") === "CrossLNodeReference"
            );

            expect(crossLNodeRef).to.exist;

            // Valid cross-LNode reference should not be removed
            const validCrossRef = removedSourceRefs.find(r =>
                (r.node as Element).getAttribute("resourceName") === "ValidCrossReference"
            );
            expect(validCrossRef).to.be.undefined;
        });

        it("handles documents without SourceRef elements", () => {
            const doc = new DOMParser().parseFromString(
                docWithMissingDOs,
                "application/xml"
            );
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            // Should only remove the PhV DOS, no SourceRefs to remove
            expect(removes).to.have.lengthOf(1);
            expect((removes[0].node as Element).tagName).to.equal("eTr_6-100:DOS");
            expect((removes[0].node as Element).getAttribute("name")).to.equal("PhV");
        });

        it("handles SourceRef elements with malformed source attributes", () => {
            const doc = new DOMParser().parseFromString(docWithMalformedSourceRefs, "application/xml");
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            // Should not crash and should not remove any elements (all data is valid)
            expect(removes).to.have.lengthOf(0);
        });
    });

    describe("selector specificity", () => {
        it("finds LNode instances both inside and outside Bay elements", () => {
            const doc = new DOMParser().parseFromString(docWithMixedLNodes, "application/xml");
            const lNodeType = doc.querySelector('LNodeType[id="MMXU_1"]')!;

            const removes = updateLnType(lNodeType, doc);

            // Should find and process both LNode instances
            expect(removes).to.have.lengthOf(2);
            removes.forEach(remove => {
                expect((remove.node as Element).tagName).to.equal("eTr_6-100:DOS");
                expect((remove.node as Element).getAttribute("name")).to.equal("MissingDO");
            });
        });
    });
});
