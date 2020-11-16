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

import {SITE_NAME} from "../constants";
import {nodeInfoDataPropTypesShape, projectPropTypesShape, phenopacketPropTypesShape, experimentPropTypesShape} from "../propTypes";

import {VictoryAxis, VictoryChart, VictoryHistogram} from "victory";
// import {
//     VICTORY_BAR_TITLE_PROPS_WITHOUT_MONOSPACE,
// } from "../styles/victory";


import {
    PieChart, Pie, Sector, Cell,
} from "recharts";
  
import {fetchPhenopackets, fetchExperiments, fetchVariantTableSummaries} from "../modules/metadata/actions";

const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);

const renderNameLabel = (props) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 40) * cos;
    const my = cy + (outerRadius + 40) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
  
    return (
        <g>
            <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            />
            <text x={cx} y={cy} dominantBaseline="middle" textAnchor="middle">{name}</text>
            <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`Rate ${(percent * 100).toFixed(2)}%`}<br />
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#999">
                {`Freq. ${value}`}
            </text>
        </g>
    );
};

const renderActiveShape = (name, props) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 40) * cos;
    const my = cy + (outerRadius + 40) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
  
    return (
        <g>
            <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            />
            <text x={cx} y={cy} dominantBaseline="middle" textAnchor="middle">{name}</text>
            <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`Rate ${(percent * 100).toFixed(2)}%`}<br />
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#999">
                {`Freq. ${value}`}
            </text>
        </g>
    );
};


// Random 'fixed' colors
const COLORS = ["#0da650", "#9d176a", "#968722", "#36f8bb", "#6671c2", "#2ada39", "#611a28", "#cf39f2", "#91faee", "#89c791"];

  
class OverviewContent extends Component {
    constructor() {
        super();
        this.state = {
            chartPadding:  "1rem",
            activeIndex: 0,
            sexChartActiveIndex: 0,
            diseaseChartActiveIndex: 0,
            biosamplesChartActiveIndex: 0,
            chartWidthHeight: 500,
            chartLabelPaddingTop: 3,
            chartLabelPaddingLeft: 3
        };
    }
    getFrequencyAsXYJSON(array) {
        const map = {};
        array.forEach(item => {
            if(map[item]){
                map[item]++;
            } else{
                map[item] = 1;
            }
        });

        const jsonObjsXY = [];
        for (var key in map) {
            jsonObjsXY.push({x: key, y:map[key]});
        }

        return jsonObjsXY;
    }

    onPieEnter = (chartNum, data, index) => {
        // console.log(data)
        if (chartNum == 0){    
            this.setState({
                sexChartActiveIndex: index,
            });
        }
        else if (chartNum == 1){    
            this.setState({
                diseaseChartActiveIndex: index,
            });
        }
        else if (chartNum == 2){    
            this.setState({
                biosamplesChartActiveIndex: index,
            });
        }
    };

    getFrequencyNameValue(array) {
        const map = {};
        array.forEach(item => {
            if(map[item]){
                map[item]++;
            } else{
                map[item] = 1;
            }
        });

        const jsonObjsXY = [];
        for (var key in map) {
            jsonObjsXY.push({name: key, value:map[key]});
        }

        return jsonObjsXY;
    }

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

        return { x: age };
    }

    render() {
        const numParticipants = this.props.phenopackets != undefined ? this.props.phenopackets.items.length : 0;
        const biosamples = this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.biosamples) : [];
        const biosampleLabels = this.getFrequencyNameValue(biosamples.flatMap(bs => bs.sampled_tissue.label));
        //const biosampleAgeAtCollection = biosamples.flatMap(bs => bs.sampled_tissue.label)
        const participantDOB = this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => this.stringToDateYearAsXJSON(p.subject.date_of_birth)) : [];

        const numBiosamples = biosamples.length;
        
        const sexLabels = this.getFrequencyNameValue(this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.subject.sex) : []);
        const diseaseLabels = this.getFrequencyNameValue(this.props.phenopackets != undefined ? this.props.phenopackets.items.flatMap(p => p.diseases.flatMap(d => d.term.label)) : []);

        const experiments = this.props.experiments != undefined ? this.props.experiments.items : [];

        const variantTableSummaries = this.props.tableSummaries != undefined 
            ? this.props.tableSummaries.summariesByServiceArtifactAndTableID != undefined 
                ? this.props.tableSummaries.summariesByServiceArtifactAndTableID.variant != undefined 
                    ? this.props.tableSummaries.summariesByServiceArtifactAndTableID.variant
                    : undefined
                : undefined
            : undefined;
        
        var numVariants = 0;
        var numSamples = 0;
        var numVCFs = 0;
        if (variantTableSummaries != undefined){
            for (const key in variantTableSummaries) {
                numVariants += variantTableSummaries[key].count;
                numSamples += variantTableSummaries[key].data_type_specific.samples;
                numVCFs += variantTableSummaries[key].data_type_specific.vcf_files;
            }
        }

        

        return <>
            <SitePageHeader title="Overview" subTitle="" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    <Row>
                        <Typography.Title level={4}>Clinical/Phenotypical Data</Typography.Title>
                        <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.phenopackets == undefined ? true : this.props.phenopackets.isFetching}>
                                    <Statistic title="Participants" value={numParticipants} />
                                </Spin>
                            </Col>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.phenopackets == undefined ? true : this.props.phenopackets.isFetching}>
                                    <Statistic title="Biosamples" value={numBiosamples} />
                                </Spin>
                            </Col>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.experiments == undefined ? true : this.props.experiments.isFetching}>
                                    <Statistic title="Experiments" value={experiments.length} />
                                </Spin>
                            </Col>
                        </Row>
                        <Col lg={12} md={24}>
                            <Row style={{display: "flex", justifyContent: "center"}}>
                                <Spin spinning={this.props.phenopackets == undefined ? true : this.props.phenopackets.isFetching}>
                                    <span style={{ 
                                        position: "relative", 
                                        top: this.state.chartLabelPaddingTop + "rem", 
                                        left: this.state.chartLabelPaddingLeft + "rem",
                                        width: "min-content", }}><b>{this.props.phenopackets.isFetching ? "" : "Sex"}</b></span>
                                    {/* <PieChart width={this.state.chartWidthHeight} height={2 * this.state.chartWidthHeight / 3}>
                                        <Pie data={sexLabels} 
                                             dataKey="value" 
                                             cx={this.state.chartWidthHeight/2}
                                             cy={this.state.chartWidthHeight/3}
                                             innerRadius={this.state.chartWidthHeight/9 + 10}
                                             outerRadius={this.state.chartWidthHeight/9 + 30}
                                             fill="#82ca9d" 
                                            // isAnimationActive={false}
                                            // label={renderSimpleLabel} 
                                            >
                                        {
                                            sexLabels.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                        }
                                        </Pie>
                                        <Legend/>
                                        <Tooltip />
                                    </PieChart> */}
                                    <PieChart width={this.state.chartWidthHeight} height={2 * this.state.chartWidthHeight / 3}>
                                        <Pie
                                            data={sexLabels}
                                            cx={this.state.chartWidthHeight/2}
                                            cy={this.state.chartWidthHeight/3}
                                            innerRadius={this.state.chartWidthHeight/9 + 10}
                                            outerRadius={this.state.chartWidthHeight/9 + 30}
                                            fill="#8884d8"
                                            dataKey="value"
                                            isAnimationActive={false}
                                            label={renderNameLabel}  >
                                            {
                                                sexLabels.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                            }
                                        </Pie>
                                    </PieChart>
                                </Spin>
                            </Row>
                            <Row style={{paddingTop: this.state.chartPadding, 
                                paddingLeft: this.state.chartPadding, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom: 0}}>                                
                                <Spin spinning={this.props.phenopackets == undefined ? true : this.props.phenopackets.isFetching}>
                                    <span  style={{ 
                                        position: "relative", 
                                        top: (this.state.chartLabelPaddingTop/3) + "rem", 
                                        left: (this.state.chartLabelPaddingLeft/2) + "rem" }}><b>{this.props.phenopackets.isFetching ? "" : "Age"}</b></span>
                                    <VictoryChart>
                                        <VictoryAxis tickValues={AGE_HISTOGRAM_BINS}
                                                     label="Age (Years)"
                                                     height={this.state.chartWidthHeight}
                                                     style={{
                                                         axisLabel: { padding: 30 },
                                                     }} />
                                        <VictoryAxis dependentAxis={true}
                                                     label="Count"
                                                     style={{
                                                         axisLabel: { padding: 30},
                                                     }} />
                                        <VictoryHistogram 
                                            data={participantDOB} 
                                            bins={AGE_HISTOGRAM_BINS}
                                            style={{ data: { fill: COLORS[0] } }} />
                                    </VictoryChart>
                                </Spin>
                            </Row>
                        </Col>
                        <Col lg={12} md={24}>
                            <Row style={{display: "flex", justifyContent: "center"}}>
                                <Col>
                                    <Spin spinning={this.props.phenopackets == undefined ? true : this.props.phenopackets.isFetching}>
                                    <span style={{ 
                                        position: "relative", 
                                        top: (this.state.chartLabelPaddingTop/2) + "rem", 
                                        left: this.state.chartLabelPaddingLeft + "rem" }}><b>{this.props.phenopackets.isFetching ? "" : "Diseases"}</b></span>
                                        <PieChart width={this.state.chartWidthHeight} height={2 * this.state.chartWidthHeight / 3}>
                                            <Pie
                                                activeIndex={this.state.diseaseChartActiveIndex}
                                                activeShape={renderActiveShape.bind(this, "")}
                                                data={diseaseLabels}
                                                cx={this.state.chartWidthHeight/2}
                                                cy={this.state.chartWidthHeight/3}
                                                innerRadius={this.state.chartWidthHeight/9 + 10}
                                                outerRadius={this.state.chartWidthHeight/9 + 30}
                                                fill="#8884d8"
                                                dataKey="value"
                                                onMouseEnter={this.onPieEnter.bind(this, 1)}
                                                >
                                                {
                                                    diseaseLabels.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                                }
                                                </Pie>
                                        </PieChart>
                                    </Spin>
                                </Col>
                            </Row>                           
                            <Row style={{display: "flex", justifyContent: "center"}}>
                                <Spin spinning={this.props.phenopackets == undefined 
                                    ? true : this.props.phenopackets.isFetching}>
                                    <span style={{ 
                                        position: "relative", 
                                        top: this.state.chartLabelPaddingTop + "rem", 
                                        left: this.state.chartLabelPaddingLeft + "rem" }}><b>{this.props.phenopackets.isFetching ? "" : "Biosamples"}</b></span>
                                    {/* <PieChart width={this.state.chartWidthHeight} height={2 * this.state.chartWidthHeight / 3}>
                                        <Pie data={biosampleLabels} 
                                             dataKey="value" 
                                             cx={this.state.chartWidthHeight/2}
                                             cy={this.state.chartWidthHeight/3}
                                             innerRadius={this.state.chartWidthHeight/9 + 10}
                                             outerRadius={this.state.chartWidthHeight/9 + 30}
                                             fill="#82ca9d" 
                                            // isAnimationActive={false}
                                            // label={renderSimpleLabel}
                                            >
                                        {
                                            biosampleLabels.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                        }
                                        </Pie>
                                        <Legend/>
                                        <Tooltip />
                                    </PieChart> */}
                                    <PieChart width={this.state.chartWidthHeight} height={2 * this.state.chartWidthHeight / 3}>
                                        <Pie
                                            activeIndex={this.state.biosamplesChartActiveIndex}
                                            activeShape={renderActiveShape.bind(this, "")}
                                            data={biosampleLabels}
                                            cx={this.state.chartWidthHeight/2}
                                            cy={this.state.chartWidthHeight/3}
                                            innerRadius={this.state.chartWidthHeight/9 + 10}
                                            outerRadius={this.state.chartWidthHeight/9 + 30}
                                            fill="#8884d8"
                                            dataKey="value"
                                            onMouseEnter={this.onPieEnter.bind(this, 2)}>
                                            {
                                                biosampleLabels.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                            }
                                        </Pie>
                                    </PieChart>
                                </Spin>
                            </Row>
                        </Col>
                    </Row>
                    <Divider />
                    <Typography.Title level={4}>Variants</Typography.Title>
                    <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                        <Col xl={3} lg={4} md={5} sm={7}>
                            <Spin spinning={this.props.tableSummaries == undefined ? true : this.props.tableSummaries.isFetching}>
                                <Statistic title="Variants"
                                           value={numVariants} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={this.props.tableSummaries == undefined ? true : this.props.tableSummaries.isFetching}>
                                <Statistic title="Samples"
                                           value={numSamples} />
                            </Spin>
                        </Col>
                        <Col xl={2} lg={3} md={4} sm={5} xs={6}>
                            <Spin spinning={this.props.tableSummaries == undefined ? true : this.props.tableSummaries.isFetching}>
                                <Statistic title="VCF Files"
                                           prefix={<Icon type="file" />}
                                           value={numVCFs} />
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
            this.setState({ 
                chartPadding: "0rem", 
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 3
            });
        } else if(window.innerWidth < 768) { // sm
            this.setState({ 
                chartPadding: "1rem", 
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 6,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 992) { // md
            this.setState({ 
                chartPadding: "2rem", 
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 5,
                chartLabelPaddingLeft: 5 });
        } else if(window.innerWidth < 1200) { // lg
            this.setState({ 
                chartPadding: "4rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 6,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 1600) { // xl
            this.setState({ 
                chartPadding: "6rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 7,
                chartLabelPaddingLeft: 7 });
        } else {
            this.setState({ 
                chartPadding: "10rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 7,
                chartLabelPaddingLeft: 7 }); // > xl
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

    phenopackets: PropTypes.shape({
        isFetching: PropTypes.bool,
        items: PropTypes.arrayOf(phenopacketPropTypesShape)
    }), //TPropTypes.objectOf(phenopacketPropTypesShape),
    fetchPhenopackets: PropTypes.func,

    experiments:PropTypes.shape({
        isFetching: PropTypes.bool,
        items: PropTypes.arrayOf(experimentPropTypesShape)
    }),
    fetchExperiments: PropTypes.func,

    tableSummaries : PropTypes.shape({
        isFetching: PropTypes.bool,
        summariesByServiceArtifactAndTableID: PropTypes.object,
    }),
    fetchVariantTableSummaries: PropTypes.func
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
    tableSummaries: state.tableSummaries,
});


export default connect(mapStateToProps, {fetchPhenopackets, fetchExperiments, fetchVariantTableSummaries})(OverviewContent);
