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
import {nodeInfoDataPropTypesShape, projectPropTypesShape, phenopacketPropTypesShape, experimentPropTypesShape} from "../propTypes";

import {VictoryAxis, VictoryBar, VictoryChart, VictoryHistogram, VictoryLabel, VictoryPie, VictoryTheme} from "victory";
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

import {fetchPhenopackets, fetchExperiments} from "../modules/metadata/actions";

const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);

class OverviewContent extends Component {
    constructor() {
        super();
        this.state = {
          chartPadding:  "1rem",
        }
      }
     getFrequencyAsXYJSON(array) {
        const map = {};
        array.forEach(item => {
           if(map[item]){
              map[item]++;
           }else{
              map[item] = 1;
           }
        });
        const jsonObjsXY = [];
        for (var key in map) {
            jsonObjsXY.push({x: key, y:map[key]});
        }

        return jsonObjsXY;
     };

    stringToDateYearAsXJSON(birthdayStr) {
        // curtosity of : https://stackoverflow.com/questions/10008050/get-age-from-birthdate
        var today_date = new Date();
        var today_year = today_date.getFullYear();
        var today_month = today_date.getMonth();
        var today_day = today_date.getDate();

        var birthday = new Date(birthdayStr);
        var birth_year =  birthday.getFullYear();
        var birth_month =  birthday.getMonth();
        var birth_date =  birthday.getDate();
        
        var age = today_year - birth_year;

        if ( today_month < (birth_month - 1))
        {
            age--;
        }
        if (((birth_month - 1) == today_month) && (today_day < birth_date))
        {
            age--;
        }

        return {x:age}
    }


    render() {
        console.log(this.props)
        const numParticipants = this.props.phenopackets != undefined ? this.props.phenopackets.items.length : 0;
        const biosamples = this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.biosamples) : [];
        const biosampleLabels = this.getFrequencyAsXYJSON(biosamples.flatMap(bs => bs.sampled_tissue.label));
        //const biosampleAgeAtCollection = biosamples.flatMap(bs => bs.sampled_tissue.label)
        const participantDOB = this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => this.stringToDateYearAsXJSON(p.subject.date_of_birth)) : [];

        const numBiosamples = biosamples.length;
        
        const sexLabels = this.getFrequencyAsXYJSON(this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.subject.sex) : []);
        const diseaseLabels = this.getFrequencyAsXYJSON(this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.diseases.flatMap(d => d.term.label)) : []);

        const experiments = this.props.experiments != undefined ? this.props.experiments.items : [];

        return <>
            <SitePageHeader title="Overview" subTitle="" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    <Row>
                        <Typography.Title level={4}>Clinical/Phenotypical Data</Typography.Title>
                        <Col md={12} sm={24}>
                            <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Spin spinning={this.props.phenopackets == undefined 
                                                ? true : this.props.phenopackets.isFetching}>
                                        <Statistic title="Participants"
                                                value={numParticipants} />
                                    </Spin>
                                </Col>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Spin spinning={this.props.phenopackets == undefined 
                                                ? true : this.props.phenopackets.isFetching}>
                                        <Statistic title="Biosamples"
                                                value={numBiosamples} />
                                    </Spin>
                                </Col>
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                <Spin spinning={this.props.experiments == undefined 
                                                ? true : this.props.experiments.isFetching}>
                                        <Statistic title="Experiments"
                                                value={experiments.length} />
                                    </Spin>
                                </Col>
                            </Row>
                            <Row style={{paddingTop: 0, 
                                    paddingLeft: 0, 
                                    paddingRight: this.state.chartPadding, 
                                    paddingBottom:this.state.chartPadding}}>
                                    <Spin spinning={this.props.phenopackets == undefined 
                                                    ? true : this.props.phenopackets.isFetching}>
                                        <VictoryPieWrapSVG>
                                            <VictoryPie data={sexLabels} {...VICTORY_PIE_PROPS} colorScale={"qualitative"} />
                                            <VictoryLabel text={
                                                this.props.phenopackets.isFetching
                                                    ? "" : "SEX"} 
                                                {...VICTORY_PIE_LABEL_PROPS} />
                                        </VictoryPieWrapSVG>
                                    </Spin>
                            </Row>
                            <Row style={{paddingTop: 0, 
                                    paddingLeft: 0, 
                                    paddingRight: this.state.chartPadding, 
                                    paddingBottom:this.state.chartPadding}}>
                                <Spin spinning={this.props.phenopackets == undefined 
                                                ? true : this.props.phenopackets.isFetching}>
                                    <VictoryChart {...VICTORY_HIST_CONTAINER_PROPS}
                                            theme={VictoryTheme.material}>
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
                                            data={participantDOB} 
                                            bins={AGE_HISTOGRAM_BINS}
                                            {...VICTORY_HIST_PROPS} 
                                            />
                                        <VictoryLabel text={this.props.phenopackets.isFetching
                                                    ? "" : "AGE"} {...VICTORY_BAR_TITLE_PROPS} />
                                    </VictoryChart>
                                </Spin>
                            </Row>
                        </Col>
                        <Col md={12} sm={24}>
                            <Row style={{paddingTop: 0, 
                                    paddingLeft: 0, 
                                    paddingRight: this.state.chartPadding, 
                                    paddingBottom:this.state.chartPadding}}>

                                <Spin spinning={this.props.phenopackets == undefined 
                                                    ? true : this.props.phenopackets.isFetching}>
                                    <VictoryPieWrapSVG viewBoxStr="-200 -200 700 700">
                                        <VictoryPie data={diseaseLabels} {...VICTORY_PIE_PROPS} colorScale={"qualitative"}  
                                            labelPlacement={"parallel"}/>
                                        <VictoryLabel text={this.props.phenopackets.isFetching
                                                    ? "" : "DISEASES"} {...VICTORY_PIE_LABEL_PROPS} />
                                    </VictoryPieWrapSVG>
                                </Spin>
                            </Row>                           
                            <Row style={{paddingTop: 0, 
                                paddingLeft: 0, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom:this.state.chartPadding}} >

                                <Spin spinning={this.props.phenopackets == undefined 
                                                ? true : this.props.phenopackets.isFetching}>
                                    <VictoryPieWrapSVG>
                                        <VictoryPie data={biosampleLabels} {...VICTORY_PIE_PROPS} colorScale={"qualitative"} />
                                        <VictoryLabel text={this.props.phenopackets.isFetching
                                                    ? "" : "BIOSAMPLES"} {...VICTORY_PIE_LABEL_PROPS} />
                                    </VictoryPieWrapSVG>
                                </Spin>
                            </Row>
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

        document.title = `${SITE_NAME} - Overview`;
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

    phenopackets: PropTypes.objectOf(phenopacketPropTypesShape),
    fetchPhenopackets: PropTypes.func,

    experiments: PropTypes.objectOf(experimentPropTypesShape),
    fetchExperiments: PropTypes.func,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,

    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,

    phenopackets: state.phenopackets,
    experiments: state.experiments,
});


export default connect(mapStateToProps, {fetchPhenopackets, fetchExperiments})(OverviewContent);
