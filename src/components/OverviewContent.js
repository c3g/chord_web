import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Col, Layout, Row, Spin, Statistic, Typography, Icon, Divider} from "antd";
import "antd/es/col/style/css";
import "antd/es/layout/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import SitePageHeader from "./SitePageHeader";
import ServiceList from "./ServiceList";

import {SITE_NAME} from "../constants";
import {nodeInfoDataPropTypesShape, projectPropTypesShape} from "../propTypes";

import {VictoryAxis, VictoryBar, VictoryChart, VictoryHistogram, VictoryLabel, VictoryPie} from "victory";
import VictoryPieWrapSVG from "./VictoryPieWrapSVG";
import {
    VICTORY_BAR_CONTAINER_PROPS,
    VICTORY_BAR_PROPS,
    VICTORY_BAR_TITLE_PROPS,
    VICTORY_BAR_X_AXIS_PROPS,
    VICTORY_HIST_CONTAINER_PROPS,
    VICTORY_HIST_PROPS,
    VICTORY_PIE_LABEL_PROPS,
    VICTORY_PIE_PROPS,
} from "../styles/victory";

import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "../dataTypes/phenopacket";


// TODO: Refactor to a component common  between users of this function project-wide
const numObjectToVictoryArray = numObj => Object.entries(numObj)
    .filter(e => e[1] > 0)
    .map(([x, y]) => ({x, y}));

const numIndividualsBySex = Object.fromEntries(SEX_VALUES.map(v => [v, 0]));
const numIndividualsByKaryotype = Object.fromEntries(KARYOTYPIC_SEX_VALUES.map(v => [v, 0]));


const individualsBySex = numObjectToVictoryArray(numIndividualsBySex);
const individualsByKaryotype = numObjectToVictoryArray(numIndividualsByKaryotype);



const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);


const DUMMY_SEX_DATA=[{x:"UNKNOWN", y: 2},{x:"MALE", y: 51},{x:"FEMALE", y:67}]
const DUMMY_BIOSAMPLE_DATA=[{x:"Saliva", y: 13},{x:"Cerebrospinal Fluid", y: 4},{x:"Tissue", y:17},{x:"Bone Marrow", y:35},{x:"Blood", y:30}]
const DUMMY_DISEASE_DATA=[{x:"One thing", y: 32},{x:"Another thing", y: 4},{x:"and another..", y:17},{x:"..one more", y:35}]

const DUMMY_AGE_DATA=[{x:10},{x:10},{x:10}]



// CHARTS
const SEX_AGE_CHARTS = <>
    {/* <Col xs={24}> */}
    <VictoryPieWrapSVG>
        <VictoryPie data={DUMMY_SEX_DATA} {...VICTORY_PIE_PROPS} />
        <VictoryLabel text="SEX" {...VICTORY_PIE_LABEL_PROPS} />
    </VictoryPieWrapSVG>
    {/* </Col>
    <Col xs={12}> */}
    <VictoryChart {...VICTORY_HIST_CONTAINER_PROPS}>
        <VictoryAxis tickValues={AGE_HISTOGRAM_BINS}
                    label="Age (Years)"
                    height={200}
                    style={{
                        axisLabel: {fontFamily: "monospace"},
                        tickLabels: {fontFamily: "monospace"}
                    }} />
        <VictoryAxis dependentAxis={true}
                    label="Count"
                    style={{
                        axisLabel: {fontFamily: "monospace"},
                        tickLabels: {fontFamily: "monospace"}
                    }} />
        <VictoryHistogram 
            data={DUMMY_AGE_DATA} 
            bins={AGE_HISTOGRAM_BINS}
            {...VICTORY_HIST_PROPS} />
        <VictoryLabel text="AGE AT COLLECTION" {...VICTORY_BAR_TITLE_PROPS} />
    </VictoryChart>
</>;

const DISEASE_CHART =  <VictoryPieWrapSVG>
<VictoryPie data={DUMMY_DISEASE_DATA} {...VICTORY_PIE_PROPS} colorScale={"qualitative"}/>
<VictoryLabel text="DISEASES" {...VICTORY_PIE_LABEL_PROPS} />
</VictoryPieWrapSVG>;

const BIOSAMPLE_CHART = <VictoryPieWrapSVG>
    <VictoryPie data={DUMMY_BIOSAMPLE_DATA} {...VICTORY_PIE_PROPS}/>
    <VictoryLabel text="BIOSAMPLES" {...VICTORY_PIE_LABEL_PROPS} />
</VictoryPieWrapSVG>;
// --


class OverviewContent extends Component {
    constructor() {
        super();
        this.state = {
          chartPadding:  "1rem",
        }
      }

    
    
    componentDidMount() {
        document.title = `${SITE_NAME} - Overview`;
    }

    render() {
        return <>
            <SitePageHeader title="Overview" subTitle="Some stuff will go here" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    <Row>
                        <Typography.Title level={4}>Object Counts</Typography.Title>
                        <Col md={12} sm={24}>
                            <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Spin spinning={false}>
                                        <Statistic title="Participants"
                                                value={110} />
                                    </Spin>
                                </Col>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Spin spinning={false}>
                                        <Statistic title="Biosamples"
                                                value={365} />
                                    </Spin>
                                </Col>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Spin spinning={false}>
                                        <Statistic title="Experiments"
                                                value={120} />
                                    </Spin>
                                </Col>
                            </Row>
                            <Row style={{paddingTop: 0, 
                                paddingLeft: this.state.chartPadding, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom:this.state.chartPadding}}>{SEX_AGE_CHARTS}</Row>
                        </Col>
                        <Col md={12} sm={24}>
                            <Row style={{paddingTop: 0, 
                                paddingLeft: this.state.chartPadding, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom:this.state.chartPadding}}>{DISEASE_CHART}</Row>                           
                            <Row style={{paddingTop: 0, 
                                paddingLeft: this.state.chartPadding, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom:this.state.chartPadding}} >{BIOSAMPLE_CHART}</Row>
                        </Col>
                    </Row>               
                    <Divider />
                    <Row>
                        <div>More charts and stuff can go here</div>
                    </Row>
                    <Divider />
                    <Typography.Title level={4}>Variants</Typography.Title>
                    <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                        <Col xl={3} lg={4} md={5} sm={7}>
                            <Spin spinning={false}>
                                <Statistic title="Variants"
                                        value={15637200} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={false}>
                                <Statistic title="Samples"
                                        value={72} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={false}>
                                <Statistic title="VCF Files"
                                    prefix={<Icon type="file" />}
                                    value={59} />
                            </Spin>
                        </Col>
                    </Row>
                </Layout.Content>
            </Layout>
        </>;
    }

    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
        if(window.innerWidth < 576) { //xs
            this.setState({ chartPadding: "0rem" });
        } else if(window.innerWidth < 768) { // sm
            this.setState({ chartPadding: "1rem" });
        } else if(window.innerWidth < 992) { // md
            this.setState({ chartPadding: "2rem" });
        } else if(window.innerWidth < 1200) { // lg
            this.setState({ chartPadding: "4rem" });
        } else if(window.innerWidth < 1600) { // xl
            this.setState({ chartPadding: "6rem" });
        } else {
            this.setState({ chartPadding: "8rem" }); // > xl
        }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }
}

OverviewContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    isFetchingNodeInfo: PropTypes.bool,

    projects: PropTypes.arrayOf(projectPropTypesShape),
    isFetchingProjects: PropTypes.bool,

    peers: PropTypes.arrayOf(PropTypes.string),
    isFetchingPeers: PropTypes.bool,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,

    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,
});


export default connect(mapStateToProps)(OverviewContent);
