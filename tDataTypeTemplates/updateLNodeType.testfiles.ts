export const docWithComplexMmxuTarget = `<SCL
  xmlns="http://www.iec.ch/61850/2003/SCL"
  xmlns:eTr_6-100="http://www.iec.ch/61850/2019/SCL/6-100"
  version="2007"
  revision="B"
  release="4"
>
  <Header id="TestSCL" />
    <Substation name="TestSubstation">
        <VoltageLevel name="VL1">
            <Bay name="Bay1">
                <LNode lnClass="MMXU" lnType="MMXU_1" lnInst="1" iedName="TestIED">
                    <Private type="eIEC61850-6-100">
                        <eTr_6-100:DOS name="A">
                            <eTr_6-100:SDS name="phsA">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                            <eTr_6-100:SDS name="phsB">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                        <!-- phsC is missing in target LNode but should not be removed -->
                        </eTr_6-100:DOS>
                        <!-- PhV DOS should be removed entirely -->
                        <eTr_6-100:DOS name="PhV">
                            <eTr_6-100:SDS name="phsA">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                            <eTr_6-100:SDS name="phsB">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                        </eTr_6-100:DOS>
                        <eTr_6-100:DOS name="PhPh">
                            <eTr_6-100:SDS name="phsAB">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <!-- ang.f should be removed -->
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                            <eTr_6-100:SDS name="phsBC">
                                <eTr_6-100:SDS name="cVal">
                                    <eTr_6-100:SDS name="mag">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                    <!-- ang.f should be removed -->
                                    <eTr_6-100:SDS name="ang">
                                        <eTr_6-100:DAS name="f" />
                                    </eTr_6-100:SDS>
                                </eTr_6-100:SDS>
                                <eTr_6-100:DAS name="q" />
                                <eTr_6-100:DAS name="t" />
                            </eTr_6-100:SDS>
                        </eTr_6-100:DOS>
                    </Private>
                    <Private type="eIEC61850-6-100">
                        <eTr_6-100:LNodeSpecNaming xmlns:eTr_6-100="http://www.iec.ch/61850/2019/SCL/6-100" sIedName="TestIED" sLnClass="MMXU" sLnInst="1"/>
                        <eTr_6-100:LNodeInputs xmlns:eTr_6-100="http://www.iec.ch/61850/2019/SCL/6-100">
                            <!-- Valid SourceRefs that should be kept -->
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/A.phsA.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="ValidAPhsAMag"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/A.phsA.cVal.ang.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="ValidAPhsAAng"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/A.res.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="ValidARes"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhPh.phsAB.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="ValidPhPhMag"/>
                            
                            <!-- Invalid SourceRefs that should be removed -->
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhV.phsA.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="InvalidPhVRef"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhV.phsB.cVal.ang.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="InvalidPhVRef2"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhPh.phsAB.cVal.ang.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="InvalidPhPhAngRef"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhPh.phsBC.cVal.ang.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="InvalidPhPhAngRef2"/>
                        </eTr_6-100:LNodeInputs>
                    </Private>
                </LNode>
                <LNode lnClass="CSWI" lnType="CSWI_1" lnInst="1" iedName="TestIED">
                    <Private type="eIEC61850-6-100">
                        <eTr_6-100:LNodeSpecNaming xmlns:eTr_6-100="http://www.iec.ch/61850/2019/SCL/6-100" sIedName="TestIED" sLnClass="CSWI" sLnInst="1"/>
                        <eTr_6-100:LNodeInputs xmlns:eTr_6-100="http://www.iec.ch/61850/2019/SCL/6-100">
                            <!-- Cross-LNode SourceRefs that should be removed when PhV is removed -->
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhV.phsA.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="CrossInvalidPhVRef"/>
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/PhPh.phsAB.cVal.ang.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="CrossInvalidPhPhAngRef"/>
                            <!-- Valid cross-LNode SourceRef that should be kept -->
                            <eTr_6-100:SourceRef source="TestSubstation/VL1/Bay1/MMXU1/A.phsA.cVal.mag.f" input="MMXU_1" inputInst="1" service="GOOSE" resourceName="CrossValidARef"/>
                        </eTr_6-100:LNodeInputs>
                    </Private>
                </LNode>
            </Bay>
        </VoltageLevel>
    </Substation>
    <DataTypeTemplates>
        <LNodeType id="MMXU_1" lnClass="MMXU">
            <DO name="A" type="WYE" />
            <DO name="PhV" type="WYE" />
            <DO name="PhPh" type="DEL" />
        </LNodeType>
        <DOType id="WYE">
            <SDO name="phsA" type="CMV" />
            <SDO name="phsB" type="CMV" />
            <SDO name="phsC" type="CMV" />
        </DOType>
        <DOType id="DEL">
            <SDO name="phsAB" type="CMV" />
            <SDO name="phsBC" type="CMV" />
            <SDO name="phsCA" type="CMV" />
        </DOType>
        <DOType id="CMV">
            <DA name="cVal" type="Vector" fc="MX" />
            <DA name="q" type="Quality" fc="MX" />
            <DA name="t" type="Timestamp" fc="MX" />
        </DOType>
        <DAType id="Vector">
            <BDA name="mag" type="AnalogueValue" />
            <BDA name="ang" type="AnalogueValue" />
        </DAType>
        <DAType id="AnalogueValue">
            <BDA name="f" type="FLOAT32" />
        </DAType>
    </DataTypeTemplates>
</SCL>`;

export const newMmxuLNodeTypeWithChanges = `
<SCL
    xmlns="http://www.iec.ch/61850/2003/SCL"
    version="2007"
    revision="B"
    release="4"
>
    <DataTypeTemplates>
        <LNodeType id="MMXU_1" lnClass="MMXU">
            <DO name="A" type="WYE_Extended" />
            <!-- PhV DO removed -->
            <DO name="PhPh" type="DEL_NoAng" />
        </LNodeType>
        <DOType id="WYE_Extended">
            <SDO name="phsA" type="CMV" />
            <SDO name="phsB" type="CMV" />
            <SDO name="phsC" type="CMV" />
            <SDO name="res" type="CMV" />
        </DOType>
        <DOType id="DEL_NoAng">
            <SDO name="phsAB" type="CMV_NoAng" />
            <SDO name="phsBC" type="CMV_NoAng" />
            <SDO name="phsCA" type="CMV_NoAng" />
        </DOType>
        <DOType id="CMV">
            <DA name="cVal" type="Vector" fc="MX" />
            <DA name="q" type="Quality" fc="MX" />
            <DA name="t" type="Timestamp" fc="MX" />
        </DOType>
        <DOType id="CMV_NoAng">
            <DA name="cVal" type="Vector_NoAng" fc="MX" />
            <DA name="q" type="Quality" fc="MX" />
            <DA name="t" type="Timestamp" fc="MX" />
        </DOType>
        <DAType id="Vector">
            <BDA name="mag" type="AnalogueValue" />
            <BDA name="ang" type="AnalogueValue" />
        </DAType>
        <DAType id="Vector_NoAng">
            <BDA name="mag" type="AnalogueValue" />
            <!-- ang BDA removed -->
        </DAType>
        <DAType id="AnalogueValue">
            <BDA name="f" type="FLOAT32" />
        </DAType>
    </DataTypeTemplates>
</SCL>`;
