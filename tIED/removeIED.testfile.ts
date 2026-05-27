export const scl = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL" xmlns:esld="https://transpower.co.nz/SCL/SSD/SLD/v0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2007" revision="B" release="4">
<Header id="GOOSELaterBinding"/>
<Substation name="S1" esld:w="50" esld:h="25">
  <LNode iedName="GOOSE_Subscriber" ldInst="Earth_Switch" prefix="" lnClass="CILO" lnInst="1"/>
  <LNode iedName="GOOSE_Subscriber1" ldInst="Earth_Switch" prefix="" lnClass="XSWI" lnInst="1"/>
  <PowerTransformer name="T1" type="PTR">
    <TransformerWinding name="W1" type="PTW"/>
  </PowerTransformer>
  <VoltageLevel name="V1" desc="" nomFreq="50" numPhases="3">
    <Voltage unit="V" multiplier="k">110</Voltage>
    <Bay name="B1" desc=""/>
  </VoltageLevel>
</Substation>
<Communication>
  <SubNetwork name="StationBus" desc="" type="8-MMS">
    <BitRate unit="b/s" multiplier="M">100</BitRate>
    <ConnectedAP iedName="GOOSE_Subscriber1" apName="AP1"/>
    <ConnectedAP iedName="GOOSE_Subscriber2" apName="AP1"/>
    <ConnectedAP iedName="GOOSE_Subscriber3" apName="AP1"/>
    <ConnectedAP iedName="GOOSE_Subscriber4" apName="AP1"/>
    <ConnectedAP iedName="Publisher" apName="AP1">
      <GSE ldInst="QB2_Disconnector" cbName="GOOSE2">
        <Address>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="MAC-Address" xsi:type="tP_MAC-Address">01-0C-CD-01-00-01</P>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="APPID" xsi:type="tP_APPID">0002</P>
        </Address>
        <MinTime unit="s" multiplier="m">10</MinTime>
        <MaxTime unit="s" multiplier="m">1000</MaxTime>
      </GSE>
      <GSE ldInst="QB2_Disconnector" cbName="GOOSE1">
        <Address>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="MAC-Address" xsi:type="tP_MAC-Address">01-0C-CD-01-00-00</P>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="APPID" xsi:type="tP_APPID">0001</P>
        </Address>
        <MinTime unit="s" multiplier="m">10</MinTime>
        <MaxTime unit="s" multiplier="m">1000</MaxTime>
      </GSE>
    </ConnectedAP>
    <ConnectedAP iedName="Publisher2" apName="AP1">
      <GSE ldInst="QB2_Disconnector" cbName="GOOSE2">
        <Address>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="MAC-Address" xsi:type="tP_MAC-Address">01-0C-CD-01-00-03</P>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="APPID" xsi:type="tP_APPID">0003</P>
        </Address>
        <MinTime unit="s" multiplier="m">10</MinTime>
        <MaxTime unit="s" multiplier="m">1000</MaxTime>
      </GSE>
      <GSE ldInst="QB2_Disconnector" cbName="GOOSE1">
        <Address>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="MAC-Address" xsi:type="tP_MAC-Address">01-0C-CD-01-00-04</P>
          <P xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" type="APPID" xsi:type="tP_APPID">0004</P>
        </Address>
        <MinTime unit="s" multiplier="m">10</MinTime>
        <MaxTime unit="s" multiplier="m">1000</MaxTime>
      </GSE>
    </ConnectedAP>
  </SubNetwork>
</Communication>
<IED name="GOOSE_Subscriber" desc="GOOSE subscriber" manufacturer="Dummy">
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="Earth_Switch">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <Inputs>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="stVal" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="q" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
          </Inputs>
        </LN0>
        <LN prefix="" lnClass="CILO" inst="1" lnType="Dummy.CILO">
          <Inputs>
            <ExtRef desc="missingIntAddr"/>
            <ExtRef desc="subscribedExtRef" intAddr="someIntAddr" iedName="Publisher"/>
            <ExtRef intAddr="Pos;CSWI1/Pos/stVal" desc="Interlocking.Input"/>
            <ExtRef intAddr="Pos;CSWI1/Pos/q" desc="Interlocking.Input"/>
          </Inputs>
        </LN>
        <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI">
          <Inputs>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="stVal" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2" intAddr="Pos;CSWI1/Pos/stVal" desc="Interlocking.Input2"/>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="q" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2" intAddr="Pos;CSWI1/Pos/q" desc="Interlocking.Input2"/>
            <ExtRef intAddr="restrictExtRef" desc="Restricted To Pos" pLN="CSWI" pDO="Pos" pDA="stVal"/>
          </Inputs>
        </LN>
        <LN prefix="L1" lnClass="TCTR" inst="1" lnType="Dummy.TCTR">
          <Inputs>
            <ExtRef intAddr="someTCTRinstMag" pLN="TCTR" pDO="AmpSv" pDA="instMag.i" pServT="SMV"/>
            <ExtRef intAddr="someTCTRq" pLN="TCTR" pDO="AmpSv" pDA="q" pServT="SMV"/>
          </Inputs>
        </LN>
        <LN prefix="" lnClass="XSWI" inst="1" lnType="Dummy.XSWI"/>
      </LDevice>
      <Association iedName="Publisher" ldInst="QB2_Disconnector" lnClass="LLN0" lnInst="" kind="predefined"/>
    </Server>
  </AccessPoint>
  <KDC iedName="Publisher" apName="AP1"/>
</IED>
<IED name="GOOSE_Subscriber1" desc="GOOSE subscriber" manufacturer="Dummy">
  <Services>
    <SupSubscription maxGo="4" maxSv="0"/>
  </Services>
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="Earth_Switch">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <Inputs>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="stVal" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
            <ExtRef iedName="Publisher" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="q" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
            <ExtRef iedName="Publisher2" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="stVal" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
            <ExtRef iedName="Publisher2" serviceType="GOOSE" ldInst="QB2_Disconnector" lnClass="CSWI" lnInst="1" prefix="" doName="Pos" daName="q" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE2"/>
          </Inputs>
        </LN0>
        <LN prefix="" lnClass="CILO" inst="1" lnType="Dummy.CILO">
          <Inputs>
            <ExtRef intAddr="Pos;CSWI1/Pos/stVal" desc="Interlocking.Input"/>
            <ExtRef intAddr="Pos;CSWI1/Pos/q" desc="Interlocking.Input"/>
          </Inputs>
        </LN>
        <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI">
          <Inputs>
            <ExtRef serviceType="GOOSE" intAddr="Pos;CSWI1/Pos/stVal" desc="Interlocking.Input2" iedName="Publisher" ldInst="QB1_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="stVal" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE1"/>
            <ExtRef serviceType="GOOSE" intAddr="Pos;CSWI1/Pos/q" desc="Interlocking.Input2" iedName="Publisher" ldInst="QB1_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="q" srcLDInst="QB2_Disconnector" srcPrefix="" srcLNClass="LLN0" srcCBName="GOOSE1"/>
            <ExtRef intAddr="someRestrictedExtRef" desc="Restricted To Pos" pLN="CSWI" pDO="Pos" pDA="stVal"/>
            <ExtRef intAddr="validAnalogue" pLN="MMXU" pDO="A.phsA" pDA="cVal.mag.f" pServT="Report"/>
            <ExtRef intAddr="wrongAnalogue" pLN="MMXU" pDO="A.phsA" pDA="cVal.mag.f" pServT="SMV"/>
            <ExtRef intAddr="invalAnalogue1" pLN="PTOC" pDO="A.phsA" pDA="cVal.mag.f" pServT="Report"/>
            <ExtRef intAddr="invalAnalogue2" pLN="MMXU" pDO="A.phsB" pDA="cVal.mag.f" pServT="Report"/>
            <ExtRef intAddr="invalAnalogue3" pLN="MMXU" pDO="A.phsA" pDA="cVal.mag.i" pServT="Report"/>
          </Inputs>
        </LN>
        <LN prefix="" lnClass="XSWI" inst="1" lnType="Dummy.XSWI"/>
        <LN lnClass="MMXU" inst="1" lnType="Dummy.MMXU"/>
      </LDevice>
      <LDevice inst="GOOSE_supervision">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN lnClass="LGOS" inst="1" lnType="Dummy.LGOS">
          <DOI name="GoCBRef">
            <DAI name="setSrcRef">
              <Val>PublisherQB2_Disconnector/LLN0.GOOSE2</Val>
            </DAI>
          </DOI>
        </LN>
        <LN lnClass="LGOS" inst="2" lnType="Dummy.LGOS">
          <Private type="OpenSCD.create"/>
          <DOI name="GoCBRef">
            <DAI name="setSrcRef">
              <Val/>
            </DAI>
          </DOI>
        </LN>
        <LN lnClass="LGOS" inst="3" lnType="Dummy.LGOS">
          <Private type="OpenSCD.create"/>
          <DOI name="GoCBRef">
            <DAI name="setSrcRef">
              <Val>PublisherQB2_Disconnector/LLN0.GOOSE1</Val>
            </DAI>
          </DOI>
        </LN>
        <LN lnClass="LGOS" inst="4" lnType="Dummy.LGOS"/>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="SMV_Subscriber1" desc="SMV subscriber" manufacturer="Dummy">
  <Services>
    <SupSubscription maxGo="0" maxSv="4"/>
  </Services>
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="Earth_Switch">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN prefix="" lnClass="CILO" inst="1" lnType="Dummy.CILO"/>
        <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI"/>
        <LN prefix="" lnClass="XSWI" inst="1" lnType="Dummy.XSWI"/>
      </LDevice>
      <LDevice inst="SMV_supervision">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <Inputs>
            <ExtRef intAddr="someTCTRinstMag" pLN="TCTR" pDO="AmpSv" pDA="instMag.i" pServT="SMV" iedName="Publisher" ldInst="SampledValue" prefix="L1" lnClass="TCTR" lnInst="1" doName="AmpSv" daName="instMag.i" srcLDInst="SampledValue" srcPrefix="" srcLNClass="LLN0" srcCBName="someSmv" serviceType="SMV"/>
            <ExtRef intAddr="someTCTRq" pLN="TCTR" pDO="AmpSv" pDA="q" pServT="SMV" iedName="Publisher" ldInst="SampledValue" prefix="L1" lnClass="TCTR" lnInst="1" doName="AmpSv" daName="q" srcLDInst="SampledValue" srcPrefix="" srcLNClass="LLN0" srcCBName="someSmv" serviceType="SMV"/>
          </Inputs>
        </LN0>
        <LN lnClass="LSVS" inst="1" lnType="Dummy.LSVS">
          <DOI name="SvCBRef">
            <DAI name="setSrcRef">
              <Val>PublisherSampledValue/LLN0.someSmv</Val>
            </DAI>
          </DOI>
          <DOI name="GoCBRef">
            <DAI name="setSrcRef" valImport="true" valKind="Conf">
              <Val/>
            </DAI>
          </DOI>
        </LN>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="Publisher" desc="GOOSE/SMV publisher" manufacturer="Dummy">
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="QB2_Disconnector">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <DataSet name="GOOSE2sDataSet">
            <FCDA ldInst="QB2_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="stVal" fc="ST"/>
            <FCDA ldInst="QB2_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="q" fc="ST"/>
          </DataSet>
          <DataSet name="GOOSE1sDataSet">
            <FCDA ldInst="QB1_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="stVal" fc="ST"/>
            <FCDA ldInst="QB1_Disconnector" prefix="" lnClass="CSWI" lnInst="1" doName="Pos" daName="q" fc="ST"/>
          </DataSet>
          <ReportControl name="reportCB" confRev="10">
            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="false" entryID="false" configRef="true" bufOvfl="false"/>
            <RptEnabled max="1">
              <ClientLN iedName="Client" apRef="AP1" ldInst="Swgr" lnClass="CILO" lnInst="1"/>
              <ClientLN iedName="Client" apRef="AP1" ldInst="Swgr" lnClass="LTCI" lnInst="1"/>
            </RptEnabled>
          </ReportControl>
          <GSEControl name="GOOSE2" type="GOOSE" appID="GOOSE2" confRev="1" datSet="GOOSE2sDataSet"/>
          <GSEControl name="GOOSE1" type="GOOSE" appID="GOOSE1" confRev="1" datSet="GOOSE1sDataSet">
            <IEDName>GOOSE_Subscriber1</IEDName>
          </GSEControl>
          <GSEControl name="GOOSE3" type="GOOSE" appID="GOOSE3" confRev="1" datSet="GOOSE1sDataSet"/>
        </LN0>
        <LN prefix="" lnClass="CILO" inst="1" lnType="Dummy.CILO"/>
        <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI"/>
        <LN prefix="" lnClass="XSWI" inst="1" lnType="Dummy.XSWI"/>
      </LDevice>
      <LDevice inst="QB1_Disconnector">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN prefix="" lnClass="CILO" inst="1" lnType="Dummy.CILO"/>
        <LN prefix="" lnClass="CSWI" inst="1" lnType="Dummy.CSWI"/>
        <LN prefix="" lnClass="XSWI" inst="1" lnType="Dummy.XSWI"/>
      </LDevice>
      <LDevice inst="Measurement">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <DataSet name="Meas">
            <FCDA ldInst="Measurement" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.mag.f" fc="MX"/>
          </DataSet>
          <DataSet name="InvalidFCDAs">
            <FCDA ldInst="NonExistingLDinst" lnClass="MMXU" lnInst="1" doName="A.phsA" daName="cVal.mag.f" fc="MX"/>
          </DataSet>
          <ReportControl name="someReport" datSet="Meas" confRev="1">
            <TrgOps dchg="true" qchg="true" dupd="true" period="true" gi="true"/>
            <OptFields seqNum="true" timeStamp="true" dataSet="true" reasonCode="true" dataRef="false" entryID="false" configRef="true" bufOvfl="false"/>
          </ReportControl>
        </LN0>
        <LN lnClass="MMXU" inst="1" lnType="Dummy.MMXU"/>
      </LDevice>
      <LDevice inst="SampledValue">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0">
          <DataSet name="SamplVal">
            <FCDA ldInst="SampledValue" prefix="L1" lnClass="TCTR" lnInst="1" doName="AmpSv" daName="instMag.i" fc="MX"/>
            <FCDA ldInst="SampledValue" prefix="L1" lnClass="TCTR" lnInst="1" doName="AmpSv" daName="q" fc="MX"/>
          </DataSet>
          <SampledValueControl name="someSmv" datSet="SamplVal" confRev="1" smvID="XAT_232_MU2" multicast="true" smpRate="4000" nofASDU="1" smpMod="SmpPerSec">
            <SmvOpts refreshTime="false" sampleSynchronized="true" sampleRate="false" dataSet="false" security="false" synchSourceId="true"/>
          </SampledValueControl>
        </LN0>
        <LN prefix="L1" lnClass="TCTR" inst="1" lnType="Dummy.TCTR"/>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="Client">
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="Swgr">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN lnClass="CILO" lnType="Dummy.CILO" inst="1"/>
        <LN lnClass="CSWI" lnType="Dummy.CSWI" inst="1"/>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
<DataTypeTemplates>
  <LNodeType lnClass="LGOS" id="Dummy.LGOS">
    <DO name="GoCBRef" type="Dummy.ORG"/>
    <DO name="St" type="OpenSCD_SPS_simple"/>
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
  </LNodeType>
  <LNodeType lnClass="LGOS" id="Dummy.LGOS1">
    <DO name="GoCBRef" type="Dummy.ORG1"/>
    <DO name="LikeGoCBRef" type="Dummy.ORG1"/>
    <DO name="St" type="OpenSCD_SPS_simple"/>
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
  </LNodeType>
  <LNodeType lnClass="LGOS" id="Dummy.LGOS2">
    <DO name="GoCBRef" type="Dummy.ORG2"/>
    <DO name="St" type="OpenSCD_SPS_simple"/>
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
  </LNodeType>
  <LNodeType lnClass="LSVS" id="Dummy.LSVS">
    <DO name="SvCBRef" type="Dummy.ORG"/>
    <DO name="St" type="OpenSCD_SPS_simple"/>
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
  </LNodeType>
  <LNodeType lnClass="XSWI" id="Dummy.XSWI" desc="Switch: one phase represenation">
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
    <DO name="LocKey" type="OpenSCD_SPS_simple"/>
    <DO name="Loc" type="OpenSCD_SPS_simple"/>
    <DO name="OpCnt" type="OpenSCD_INS_simple"/>
    <DO name="Pos" type="OpenSCD_DPC_statusonly"/>
    <DO name="BlkOpn" type="OpenSCD_SPC_statusonly"/>
    <DO name="BlkCls" type="OpenSCD_SPC_statusonly"/>
    <DO name="SwTyp" type="OpenSCD_ENS_SwTyp"/>
  </LNodeType>
  <LNodeType lnClass="CSWI" id="Dummy.CSWI" desc="Switch control: no process bus(PB)">
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
    <DO name="LocKey" type="OpenSCD_SPS_simple"/>
    <DO name="Loc" type="OpenSCD_SPS_simple"/>
    <DO name="Pos" type="OpenSCD_DPC"/>
  </LNodeType>
  <LNodeType lnClass="CILO" id="Dummy.CILO" desc="Interlocking">
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="NamPlt" type="OpenSCD_LPL_noLD"/>
    <DO name="EnaOpn" type="OpenSCD_SPS_simple"/>
    <DO name="EnaCls" type="OpenSCD_SPS_simple"/>
  </LNodeType>
  <LNodeType lnClass="LLN0" id="Dummy.LLN0" desc="Logical device LN: parent">
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="NamPlt" type="OpenSCD_LPL_LD"/>
    <DO name="LocKey" type="OpenSCD_SPS_simple"/>
    <DO name="Loc" type="OpenSCD_SPS_simple"/>
  </LNodeType>
  <LNodeType lnClass="MMXU" id="Dummy.MMXU" desc="Logical device LN: parent">
    <DO name="Mod" type="OpenSCD_ENC_Mod"/>
    <DO name="Beh" type="OpenSCD_ENS_Beh"/>
    <DO name="Health" type="OpenSCD_ENS_Health"/>
    <DO name="NamPlt" type="OpenSCD_LPL_LD"/>
    <DO name="A" type="someWYE"/>
  </LNodeType>
  <LNodeType lnClass="TCTR" id="Dummy.TCTR" desc="Current Transformer">
    <DO name="Beh" type="OpenSCD_ENS_Beh" desc="OpenSCD_ENS_Beh"/>
    <DO name="AmpSv" type="Dummy.SAV"/>
  </LNodeType>
  <DOType cdc="SAV" id="Dummy.SAV" desc="Sampled value">
    <DA fc="MX" name="instMag" bType="Struct" type="someAnalogueValueINT32"/>
    <DA fc="MX" qchg="true" name="q" bType="Quality"/>
  </DOType>
  <DOType cdc="WYE" id="someWYE">
    <SDO name="phsA" type="someMV"/>
  </DOType>
  <DOType cdc="CMV" id="someMV">
    <DA fc="MX" dchg="true" name="cVal" bType="Struct" type="someVector"/>
  </DOType>
  <DOType cdc="ORG" id="Dummy.ORG">
    <DA name="setSrcRef" bType="ObjRef" dchg="true" valKind="RO" valImport="true" fc="SP"/>
  </DOType>
  <DOType cdc="ORG" id="Dummy.ORG1">
    <DA name="setSrcRef" bType="ObjRef" dchg="true" valKind="Conf" valImport="true" fc="SP"/>
  </DOType>
  <DOType cdc="ORG" id="Dummy.ORG2">
    <DA name="setSrcRef" bType="ObjRef" dchg="true" fc="SP"/>
  </DOType>
  <DOType cdc="ENS" id="OpenSCD_ENS_SwTyp">
    <DA fc="ST" dchg="true" name="stVal" bType="Enum" type="SwitchFunctionKind"/>
    <DA fc="ST" qchg="true" name="q" bType="Quality"/>
    <DA fc="ST" name="t" bType="Timestamp"/>
  </DOType>
  <DOType cdc="SPC" id="OpenSCD_SPC_statusonly">
    <DA name="stVal" bType="BOOLEAN" dchg="true" fc="ST"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="ctlModel" bType="Enum" dchg="true" type="OpenSCD_StatusOnly" fc="CF">
      <Val>status-only</Val>
    </DA>
  </DOType>
  <DOType cdc="DPC" id="OpenSCD_DPC_statusonly">
    <DA name="stVal" bType="Dbpos" dchg="true" fc="ST"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="ctlModel" bType="Enum" fc="CF" type="OpenSCD_StatusOnly">
      <Val>status-only</Val>
    </DA>
  </DOType>
  <DOType cdc="INS" id="OpenSCD_INS_simple">
    <DA name="stVal" bType="INT32" dchg="true" fc="ST"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="d" bType="VisString255" fc="DC"/>
  </DOType>
  <DOType cdc="DPC" id="OpenSCD_DPC">
    <DA name="origin" bType="Struct" dchg="true" fc="ST" type="OpenSCD_Originator"/>
    <DA name="stVal" bType="Dbpos" dchg="true" fc="ST"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="ctlModel" bType="Enum" fc="CF" type="CtlModelKind">
      <Val>sbo-with-enhanced-security</Val>
    </DA>
    <DA name="sboTimeout" bType="INT32U" fc="CF">
      <Val>30000</Val>
    </DA>
    <DA name="operTimeout" bType="INT32U" fc="CF">
      <Val>600</Val>
    </DA>
    <DA name="pulseConfig" bType="Struct" fc="CO" type="OpenSCD_PulseConfig"/>
    <DA name="SBOw" bType="Struct" fc="CO" type="OpenSCD_OperSBOw_Dbpos"/>
    <DA name="Oper" bType="Struct" fc="CO" type="OpenSCD_OperSBOw_Dbpos"/>
    <DA name="Cancel" bType="Struct" fc="CO" type="OpenSCD_Cancel_Dbpos"/>
  </DOType>
  <DOType cdc="LPL" id="OpenSCD_LPL_noLD">
    <DA name="vendor" bType="VisString255" fc="DC"/>
    <DA name="swRev" bType="VisString255" fc="DC"/>
    <DA name="d" bType="VisString255" fc="DC"/>
    <DA name="configRev" bType="VisString255" fc="DC"/>
  </DOType>
  <DOType cdc="SPS" id="OpenSCD_SPS_simple">
    <DA name="stVal" bType="BOOLEAN" dchg="true" fc="ST"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="d" bType="VisString255" fc="DC"/>
  </DOType>
  <DOType cdc="LPL" id="OpenSCD_LPL_LD">
    <DA name="vendor" bType="VisString255" fc="DC"/>
    <DA name="swRev" bType="VisString255" fc="DC"/>
    <DA name="d" bType="VisString255" fc="DC"/>
    <DA name="configRev" bType="VisString255" fc="DC"/>
    <DA name="ldNs" bType="VisString255" fc="EX">
      <Val>IEC 61850-7-4:2007B4</Val>
    </DA>
  </DOType>
  <DOType cdc="ENS" id="OpenSCD_ENS_Health">
    <DA name="stVal" bType="Enum" dchg="true" fc="ST" type="HealthKind"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
  </DOType>
  <DOType cdc="ENS" id="OpenSCD_ENS_Beh">
    <DA name="stVal" bType="Enum" dchg="true" fc="ST" type="BehaviourModeKind"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
  </DOType>
  <DOType cdc="ENC" id="OpenSCD_ENC_Mod">
    <DA name="origin" bType="Struct" dchg="true" fc="ST" type="OpenSCD_Originator"/>
    <DA name="stVal" bType="Enum" dchg="true" fc="ST" type="BehaviourModeKind"/>
    <DA name="q" bType="Quality" qchg="true" fc="ST"/>
    <DA name="t" bType="Timestamp" fc="ST"/>
    <DA name="ctlModel" bType="Enum" fc="CF" type="CtlModelKind">
      <Val>sbo-with-enhanced-security</Val>
    </DA>
    <DA name="sboTimeout" bType="INT32U" fc="CF">
      <Val>30000</Val>
    </DA>
    <DA name="operTimeout" bType="INT32U" fc="CF">
      <Val>600</Val>
    </DA>
    <DA name="SBOw" bType="Struct" fc="CO" type="OpenSCD_OperSBOw_BehaviourModeKind"/>
    <DA name="Oper" bType="Struct" fc="CO" type="OpenSCD_OperSBOw_BehaviourModeKind"/>
    <DA name="Cancel" bType="Struct" fc="CO" type="OpenSCD_Cancel_BehaviourModeKind"/>
  </DOType>
  <DAType id="someVector">
    <BDA name="mag" bType="Struct" type="someAnalogueValue"/>
    <BDA name="ang" bType="Struct" type="someAnalogueValue"/>
  </DAType>
  <DAType id="someAnalogueValue">
    <BDA name="f" bType="FLOAT32"/>
  </DAType>
  <DAType id="someAnalogueValueINT32">
    <BDA name="i" bType="INT32"/>
  </DAType>
  <DAType id="OpenSCD_Cancel_Dbpos">
    <BDA name="ctlVal" bType="Dbpos"/>
    <BDA name="origin" bType="Struct" type="OpenSCD_Originator"/>
    <BDA name="ctlNum" bType="INT8U"/>
    <BDA name="T" bType="Timestamp"/>
    <BDA name="Test" bType="BOOLEAN"/>
    <ProtNs type="8-MMS">IEC 61850-8-1:2003</ProtNs>
  </DAType>
  <DAType id="OpenSCD_OperSBOw_Dbpos">
    <BDA name="ctlVal" bType="Dbpos"/>
    <BDA name="origin" bType="Struct" type="OpenSCD_Originator"/>
    <BDA name="ctlNum" bType="INT8U"/>
    <BDA name="T" bType="Timestamp"/>
    <BDA name="Test" bType="BOOLEAN"/>
    <BDA name="Check" bType="Check"/>
    <ProtNs type="8-MMS">IEC 61850-8-1:2003</ProtNs>
  </DAType>
  <DAType id="OpenSCD_PulseConfig">
    <BDA name="cmdQual" bType="Enum" type="OutputSignalKind"/>
    <BDA name="onDur" bType="INT32U"/>
    <BDA name="offDur" bType="INT32U"/>
    <BDA name="numPls" bType="INT32U"/>
  </DAType>
  <DAType id="OpenSCD_Cancel_BehaviourModeKind">
    <BDA name="ctlVal" bType="Enum" type="BehaviourModeKind"/>
    <BDA name="origin" bType="Struct" type="OpenSCD_Originator"/>
    <BDA name="ctlNum" bType="INT8U"/>
    <BDA name="T" bType="Timestamp"/>
    <BDA name="Test" bType="BOOLEAN"/>
    <ProtNs type="8-MMS">IEC 61850-8-1:2003</ProtNs>
  </DAType>
  <DAType id="OpenSCD_OperSBOw_BehaviourModeKind">
    <BDA name="ctlVal" bType="Enum" type="BehaviourModeKind"/>
    <BDA name="origin" bType="Struct" type="OpenSCD_Originator"/>
    <BDA name="ctlNum" bType="INT8U"/>
    <BDA name="T" bType="Timestamp"/>
    <BDA name="Test" bType="BOOLEAN"/>
    <BDA name="Check" bType="Check"/>
    <ProtNs type="8-MMS">IEC 61850-8-1:2003</ProtNs>
  </DAType>
  <DAType id="OpenSCD_Originator">
    <BDA name="orCat" bType="Enum" type="OriginatorCategoryKind"/>
    <BDA name="orIdent" bType="Octet64"/>
  </DAType>
  <EnumType id="SwitchFunctionKind">
    <EnumVal ord="1">Load Break</EnumVal>
    <EnumVal ord="2">Disconnector</EnumVal>
    <EnumVal ord="3">Earthing Switch</EnumVal>
    <EnumVal ord="4">High Speed Earthing Switch</EnumVal>
  </EnumType>
  <EnumType id="OpenSCD_StatusOnly">
    <EnumVal ord="0">status-only</EnumVal>
  </EnumType>
  <EnumType id="OutputSignalKind">
    <EnumVal ord="0">pulse</EnumVal>
    <EnumVal ord="1">persistent</EnumVal>
    <EnumVal ord="2">persistent-feedback</EnumVal>
  </EnumType>
  <EnumType id="HealthKind">
    <EnumVal ord="1">Ok</EnumVal>
    <EnumVal ord="2">Warning</EnumVal>
    <EnumVal ord="3">Alarm</EnumVal>
  </EnumType>
  <EnumType id="CtlModelKind">
    <EnumVal ord="0">status-only</EnumVal>
    <EnumVal ord="1">direct-with-normal-security</EnumVal>
    <EnumVal ord="2">sbo-with-normal-security</EnumVal>
    <EnumVal ord="3">direct-with-enhanced-security</EnumVal>
    <EnumVal ord="4">sbo-with-enhanced-security</EnumVal>
  </EnumType>
  <EnumType id="BehaviourModeKind">
    <EnumVal ord="1">on</EnumVal>
    <EnumVal ord="2">blocked</EnumVal>
    <EnumVal ord="3">test</EnumVal>
    <EnumVal ord="4">test/blocked</EnumVal>
    <EnumVal ord="5">off</EnumVal>
  </EnumType>
  <EnumType id="OriginatorCategoryKind">
    <EnumVal ord="0">not-supported</EnumVal>
    <EnumVal ord="1">bay-control</EnumVal>
    <EnumVal ord="2">station-control</EnumVal>
    <EnumVal ord="3">remote-control</EnumVal>
    <EnumVal ord="4">automatic-bay</EnumVal>
    <EnumVal ord="5">automatic-station</EnumVal>
    <EnumVal ord="6">automatic-remote</EnumVal>
    <EnumVal ord="7">maintenance</EnumVal>
    <EnumVal ord="8">process</EnumVal>
  </EnumType>
</DataTypeTemplates>
</SCL>`;

/** SCL with two IEDs that have LNodes in the same ConductingEquipment
 *  with matching (ldInst, lnClass, lnInst, prefix). Removing both IEDs
 *  sequentially should not create duplicate LNode key sequences. */
export const sclDuplicateLNodes = `<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="2007" revision="B" release="4">
<Header id="DuplicateLNodes"/>
<Substation name="S1">
  <LNode iedName="IED_A" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
  <LNode iedName="IED_B" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
  <VoltageLevel name="V1">
    <LNode iedName="IED_A" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
    <LNode iedName="IED_B" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
    <Bay name="B1">
      <LNode iedName="IED_A" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
      <LNode iedName="IED_B" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
      <ConductingEquipment name="QA1" type="CBR">
        <LNode iedName="IED_A" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
        <LNode iedName="IED_B" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
        <LNode iedName="IED_A" ldInst="CBSW" lnClass="CSWI" lnInst="1" prefix=""/>
        <LNode iedName="IED_B" ldInst="CBSW" lnClass="CSWI" lnInst="1" prefix=""/>
      </ConductingEquipment>
    </Bay>
  </VoltageLevel>
</Substation>

<Substation name="S2">
  <VoltageLevel name="V2">
    <Bay name="B2">
      <ConductingEquipment name="QA1" type="CBR">
        <LNode iedName="IED_A" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
        <LNode iedName="IED_B" ldInst="CBSW" lnClass="XCBR" lnInst="1" prefix=""/>
        <LNode iedName="IED_A" ldInst="CBSW" lnClass="CSWI" lnInst="1" prefix=""/>
        <LNode iedName="IED_B" ldInst="CBSW" lnClass="CSWI" lnInst="1" prefix=""/>
      </ConductingEquipment>
    </Bay>
  </VoltageLevel>
</Substation>
<IED name="IED_A" manufacturer="Dummy">
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="CBSW">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN lnClass="XCBR" inst="1" lnType="Dummy.XCBR"/>
        <LN lnClass="CSWI" inst="1" lnType="Dummy.CSWI"/>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
<IED name="IED_B" manufacturer="Dummy">
  <AccessPoint name="AP1">
    <Server>
      <Authentication/>
      <LDevice inst="CBSW">
        <LN0 lnClass="LLN0" inst="" lnType="Dummy.LLN0"/>
        <LN lnClass="XCBR" inst="1" lnType="Dummy.XCBR"/>
        <LN lnClass="CSWI" inst="1" lnType="Dummy.CSWI"/>
      </LDevice>
    </Server>
  </AccessPoint>
</IED>
</SCL>`;
