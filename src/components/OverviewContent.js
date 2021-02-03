import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Col, Layout, Row, Spin, Statistic, Typography, Icon, Divider } from "antd"; // TODO: implement  Slider, InputNumber
import "antd/es/col/style/css";
import "antd/es/layout/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import SitePageHeader from "./SitePageHeader";

import {SITE_NAME} from "../constants";
import {
    nodeInfoDataPropTypesShape, 
    projectPropTypesShape, 
    
    phenopacketPropTypesShape,
    experimentPropTypesShape,

    overviewSummaryPropTypesShape
} from "../propTypes";

import {VictoryAxis, VictoryChart, VictoryHistogram} from "victory";
// import {
//     VICTORY_BAR_TITLE_PROPS_WITHOUT_MONOSPACE,
// } from "../styles/victory";

import { withBasePath } from "../utils/url";

import { polarToCartesian } from "recharts/es6/util/PolarUtils";

import { fetchPhenopackets, fetchExperiments, fetchVariantTableSummaries, fetchOverviewSummary } from "../modules/metadata/actions";
import { setAutoQueryPageTransition } from "../modules/explorer/actions";


import Curve from "recharts/es6/shape/Curve";
import PieChart from "recharts/es6/chart/PieChart";
import Pie from "recharts/es6/polar/Pie";
import Cell from "recharts/es6/component/Cell";
import Sector from "recharts/es6/shape/Sector";

import { withRouter } from "react-router";

const AGE_HISTOGRAM_BINS = [...Array(10).keys()].map(i => i * 10);

const RADIAN = Math.PI / 180;


// Random 'fixed' colors
const COLORS = [
    "#4d47a5", "#dbecc4", "#c72540", "#0da650", "#9d176a", 
    "#968722", "#36f8bb", "#6671c2", "#2ada39", "#611a28", 
    "#cf39f2", "#58433c", "#91faee", "#89c791", "#f47ae3",
    "#180b3c", "#a7e046"
];

  
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
            chartLabelPaddingLeft: 3,
            phenotypicFeaturesThresholdSliderValue: 0.01
        };
    }

    onPFSliderChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            phenotypicFeaturesThresholdSliderValue: value,
        });
    };

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

    mapNameValueFields(data, otherThreshold=0.04) {

        var sumOfAllValues = 0; // Accumulate all values to compute on them later
        for (var _key in data) {
            sumOfAllValues += data[_key];
        }

        // Group the items in the array of objects denoted by 
        // a "name" and "value" parameter
        const jsonObjsXY = [];
        for (var key in data) {
            var val = data[key];
            // Group all elements with a small enough value together under an "Other"
            if (val > 0 && (val / sumOfAllValues) < otherThreshold){
                var otherIndex = jsonObjsXY.findIndex(ob => ob.name=="Other");
                if (otherIndex > -1) {
                    jsonObjsXY[otherIndex].value += val; // Accumulate
                } else {
                    jsonObjsXY.push({name: "Other", value:val}); // Create a new  element in the array
                }
            } else { // Treat items
                jsonObjsXY.push({name: key, value:val});
            }
        }

        // Sort by value
        return jsonObjsXY.sort((a, b) => {
            return a.value - b.value;
        });
    }

    mapAgeXField(obj) {

        // Group the items in the array of objects denoted by 
        // a "x" parameter
        const jsonObjsXY = [];
        for (var key in obj) {
            if (obj[key] > 0){              
                jsonObjsXY.push({x: key});
            }
        }

        // Sort by x
        return jsonObjsXY.sort((a, b) => {
            return a.x - b.x;
        });
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
        var overviewSummary = this.props.overviewSummary;
        
        const numParticipants = ((((
            overviewSummary || {})
            .data || {})
            .data_type_specific || {})
            .individuals|| {}).count;

        const numDiseases = ((((
            overviewSummary || {})
            .data || {})
            .data_type_specific || {})
            .diseases|| {}).count;

        const numPhenotypicFeatures = ((((
            overviewSummary || {})
            .data || {})
            .data_type_specific || {})
            .phenotypic_features|| {}).count;
                         

        const biosampleLabels = this.mapNameValueFields(
            ((((overviewSummary || {})
                .data || {})
                .data_type_specific || {})
                .biosamples|| {}).sampled_tissue);

        const numBiosamples = ((((
            overviewSummary || {})
            .data || {})
            .data_type_specific || {})
            .biosamples|| {}).count;


        const sexLabels = this.mapNameValueFields(
            ((((overviewSummary || {})
                .data || {})
                .data_type_specific || {})
                .individuals|| {}).sex, -1);


        const participantDOB = this.mapAgeXField(
            ((((overviewSummary || {})
                .data || {})
                .data_type_specific || {})
                .individuals|| {}).age);
        
        const diseaseLabels = this.mapNameValueFields(
            ((((overviewSummary || {})
                .data || {})
                .data_type_specific || {})
                .diseases|| {}).term);
        
        const phenotypicFeatureLabels = this.mapNameValueFields(
            ((((overviewSummary || {})
                .data || {})
                .data_type_specific || {})
                .phenotypic_features|| {}).type, this.state.phenotypicFeaturesThresholdSliderValue);
                
        

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
                                <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                    <Statistic title="Participants" value={numParticipants} />
                                </Spin>
                            </Col>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                    <Statistic title="Biosamples" value={numBiosamples} />
                                </Spin>
                            </Col>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                    <Statistic title="Diseases" value={numDiseases} />
                                </Spin>
                            </Col>
                            <Col xl={2} lg={3} md={5} sm={6} xs={10}>
                                <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                    <Statistic title="Phenotypic Features" value={numPhenotypicFeatures} />
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
                                <Col style={{textAlign: "center"}}>
                                    <h2>{this.props.overviewSummary.isFetching ? "" : "Sexes"}</h2>
                                    <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                        <CustomPieChartWithRouter
                                          data={sexLabels}
                                          chartWidthHeight={this.state.chartWidthHeight}
                                          fieldLabel={"[dataset item].subject.sex"}
                                          setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                        />
                                    </Spin>
                                </Col>
                            </Row>
                            <Row style={{paddingTop: this.state.chartLabelPaddingTop+"rem", 
                                paddingLeft: this.state.chartPadding, 
                                paddingRight: this.state.chartPadding, 
                                paddingBottom: 0}}>      
                                <Col style={{textAlign: "center"}}>
                                    <h2>{this.props.overviewSummary.isFetching ? "" : "Age"}</h2>
                                    <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
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
                                </Col>                          
                            </Row>
                        </Col>
                        <Col lg={12} md={24}>
                            <Row style={{display: "flex", justifyContent: "center"}}>
                                <Col style={{textAlign: "center"}}>
                                    <h2>{this.props.overviewSummary.isFetching ? "" : "Diseases"}</h2>
                                    <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                        <CustomPieChartWithRouter
                                          data={diseaseLabels}
                                          chartWidthHeight={this.state.chartWidthHeight}
                                          fieldLabel={"[dataset item].diseases.[item].term.label"}
                                          setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                        />
                                    </Spin>
                                </Col>
                            </Row>                           
                            <Row style={{paddingTop: this.state.chartLabelPaddingTop+"rem", 
                                display: "flex", justifyContent: "center"}}>
                                <Col style={{textAlign: "center"}}>
                                    <h2>{this.props.overviewSummary.isFetching ? "" : "Biosamples"}</h2>
                                    <Spin spinning={this.props.overviewSummary == undefined 
                                        ? true : this.props.overviewSummary.isFetching}>
                                    <CustomPieChartWithRouter
                                      data={biosampleLabels}
                                      chartWidthHeight={this.state.chartWidthHeight}
                                      fieldLabel={"[dataset item].biosamples.[item].sampled_tissue.label"}
                                      setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                      />                                    
                                  </Spin>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{display: "flex", justifyContent: "center"}}>
                        <Col style={{textAlign: "center"}}>
                            <h2>{this.props.overviewSummary.isFetching ? "" : "Phenotypic Features"}</h2>
                            <Spin spinning={this.props.overviewSummary == undefined ? true : this.props.overviewSummary.isFetching}>
                                <CustomPieChartWithRouter
                                    data={phenotypicFeatureLabels}
                                    chartWidthHeight={this.state.chartWidthHeight}
                                    fieldLabel={"[dataset item].phenotypic_features.[item].type.label"}
                                    setAutoQueryPageTransition={this.props.setAutoQueryPageTransition}
                                />
                            </Spin>
                        </Col>
                        {/* TODO: Adjust threshold dynamically
                        <Col>
                            <InputNumber
                                min={0}
                                max={1}
                                style={{ marginLeft: 16 }}
                                value={this.state.phenotypicFeaturesThresholdSliderValue}
                                onChange={this.onPFSliderChange}
                            />
                        </Col> */}
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
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 992) { // md
            this.setState({ 
                chartPadding: "2rem", 
                chartWidthHeight: window.innerWidth,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 5 });
        } else if(window.innerWidth < 1200) { // lg
            this.setState({ 
                chartPadding: "4rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 6 });
        } else if(window.innerWidth < 1600) { // xl
            this.setState({ 
                chartPadding: "6rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 3,
                chartLabelPaddingLeft: 7 });
        } else {
            this.setState({ 
                chartPadding: "10rem", 
                chartWidthHeight: window.innerWidth / 2,
                chartLabelPaddingTop: 5,
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

// TEMP
class CustomPieChart extends React.Component {

    state = {
        canUpdate: false,
        activeIndex: undefined,
        //redirect: false,
        itemSelected: undefined,
        graphTerm: undefined,
        fieldLabel: undefined
    }
  
    onEnter = (_data, index) => {
        this.setState({ activeIndex: index });
    }
  
    onLeave = (_data, _index) => {
        this.setState({ activeIndex: undefined });
    }

    onClick = (data) => {
        const { history, setAutoQueryPageTransition } = this.props;

        setAutoQueryPageTransition(
            window.location.href,
            "phenopacket",
            this.props.fieldLabel,
            data.name
        );

        // Navigate to Explorer
        history.push(withBasePath("/data/explorer/search"));
    }
  
    componentDidMount() {
      /*
       * This ugly hack prevents the Pie labels from not appearing
       * when Pie props change before the end of the animation.
       */
        setTimeout(() => this.setState({ canUpdate: true }), 3000);
    }
  
    shouldComponentUpdate(props, state) {
        if (this.state !== state && state.canUpdate)
            return true;
  
        if (this.props.data === props.data)
            return false;
  
        return true;
    }
  
    render() {
        const { data, chartWidthHeight } = this.props;
  
        return (
        <PieChart width={chartWidthHeight} height={chartWidthHeight/2}>
          <Pie data={data}
               dataKey='value'
               cx='50%'
               cy='50%'
               innerRadius={40}
               outerRadius={80}
               label={this.renderLabel.bind(this, this.state)}
               labelLine={true}
               isAnimationActive={false}
               onClick={this.onClick}
               onMouseEnter={this.onEnter}
               onMouseLeave={this.onLeave}
               activeIndex={this.state.activeIndex}
               activeShape={this.renderActiveLabel.bind(this, this.state)}
          >
            {
              data.map((entry, index) =>
              <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
            }
          </Pie>
        </PieChart>
        );
    }

    renderLabel(state, params) {
        const {
            cx,
            cy,
            midAngle,
            // innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            // value
            index,
        } = params;
    

        // skip rendering this static label if the sector is selected.
        // this will let the 'renderActiveState' draw without overlapping
        if (index == state.activeIndex){
            return;
        }
  
        const name = payload.name === "null" ? "(Empty)" : payload.name;
    
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 20) * cos;
        const my = cy + (outerRadius + 20) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";
    
        const currentTextStyle = {
            ...textStyle,
            fontWeight: payload.selected ? "bold" : "normal",
            fontStyle: payload.name === "null" ? "italic" : "normal",
        };
    
        const offsetRadius = 20;
        const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle);
        const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle);
        const lineProps = {
            ...params,
            fill: "none",
            stroke: fill,
            points: [startPoint, endPoint],
        };
    
        if (lastAngle > midAngle)
            lastAngle = 0;
    
        
        lastAngle = midAngle;
    
        return (
        <g>
    
          { payload.selected &&
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
          }
    
          <Curve
            { ...lineProps }
            type='linear'
            className='recharts-pie-label-line'
          />
    
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
                textAnchor={textAnchor}
                style={currentTextStyle}
          >
            { name }
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={14}
            textAnchor={textAnchor}
            style={countTextStyle}
          >
            {`(${ payload.value } donor${ payload.value > 1 ? "s" : "" })`}
          </text>
    
        </g>
        );
    }


    renderActiveLabel(state, params) {
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload
        } = params;
    
        const name = payload.name === "null" ? "(Empty)" : payload.name;
    
        const offsetRadius = 40;
  
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + offsetRadius) * cos;
        const my = cy + (outerRadius + offsetRadius) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";
    
        const currentTextStyle = {
            ...textStyle,
            fontWeight: "bold",
            fontStyle: payload.name === "null" ? "italic" : "normal",
        };
    
        const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle);
        const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle);
        const lineProps = {
            ...params,
            fill: "none",
            stroke: fill,
            points: [startPoint, endPoint],
        };
    
        lastAngle = midAngle;
    
        return (
        <g>
    
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill={fill}
          />
    
          { payload.selected &&
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
          }
    
          <Curve
            { ...lineProps }
            type='linear'
            className='recharts-pie-label-line'
          />
    
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
                textAnchor={textAnchor}
                style={currentTextStyle}
          >
            { name }
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={14}
            textAnchor={textAnchor}
            style={countTextStyle}
          >
            {`(${ payload.value } donor${ payload.value > 1 ? "s" : "" })`}
          </text>
    
        </g>
        );
    }
}

// Create a new component that is "connected" (to borrow redux
// terminology) to the router.
const CustomPieChartWithRouter = withRouter(CustomPieChart);//connect(setAutoQueryPageTransition)(withRouter(CustomPieChart));

  /*
   * lastAngle is mutated by renderLabel() and renderActiveShape() to
   * indicate at which angle is the last shown label.
   */
let lastAngle = 0;
  
const textStyle = {
    fontSize: "11px",
    fill: "#333",
};
const countTextStyle = {
    fontSize: "10px",
    fill: "#999",
};
  

CustomPieChart.propTypes = {
    data: PropTypes.array,
    fieldLabel: PropTypes.string,
    chartWidthHeight: PropTypes.number,
    setAutoQueryPageTransition: PropTypes.func
};
  
  
//


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

    overviewSummary:PropTypes.shape({
        isFetching: PropTypes.bool,
        data: PropTypes.arrayOf(overviewSummaryPropTypesShape)
    }),
    fetchOverviewSummary: PropTypes.func,

    tableSummaries : PropTypes.shape({
        isFetching: PropTypes.bool,
        summariesByServiceArtifactAndTableID: PropTypes.object,
    }),
    fetchVariantTableSummaries: PropTypes.func,

    setAutoQueryPageTransition: PropTypes.func // temp
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
    
    overviewSummary: state.overviewSummary
});


export default connect(mapStateToProps, {fetchPhenopackets, fetchExperiments, fetchVariantTableSummaries, fetchOverviewSummary, setAutoQueryPageTransition})(OverviewContent);
