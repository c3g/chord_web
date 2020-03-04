import React, {Component} from "react";
import {connect} from "react-redux";

import {Col, Divider, Icon, Modal, Row, Skeleton, Statistic, Tag, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/divider/style/css";
import "antd/es/icon/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import {VictoryLabel, VictoryPie} from "victory";

import {nop} from "../../../../../utils";


const VariantSummary = ({summary}) => (
    <Row gutter={16}>
        <Col span={8}><Statistic title="Variants" value={summary.count} /></Col>
        <Col span={8}><Statistic title="Samples" value={summary.data_type_specific.samples} /></Col>
        {summary.data_type_specific.vcf_files !== undefined ? (
            <Col span={8}><Statistic title="VCF Files"
                                     prefix={<Icon type="file" />}
                                     value={summary.data_type_specific.vcf_files} /></Col>
        ) : null}
    </Row>
);


const WrapSVG = ({children}) => (<svg viewBox="0 0 400 250">{children}</svg>);


const PhenopacketSummary = ({summary}) => {
    const individualsBySex = Object.entries(summary.data_type_specific.individuals.sex)
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({x, y}));
    const individualsByKaryotype = Object.entries(summary.data_type_specific.individuals.karyotypic_sex)
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({x, y}));

    // noinspection JSUnusedGlobalSymbols
    const victoryPieProps = {
        standalone: false,
        innerRadius: ({radius}) => radius * (7/10),
        // labelRadius: ({innerRadius, radius}) => innerRadius({radius}) + (radius - innerRadius({radius})) / 2,
        // style: {labels: {fill: "white", textAnchor: "middle"}},
        padding: {left: 120, right: 120, top: 40, bottom: 40},
        labelPadding: 20,
        height: 250,
        labels: ({datum}) => `${datum.x}: ${datum.y}`,
        style: {labels: {fontFamily: "monospace"}},
    };

    const victoryLabelProps = {
        textAnchor: "middle",
        x: 200,
        y: 125,
        style: {fontFamily: "monospace"}
    };

    return (
        <>
            <Typography.Title level={4}>Object Counts</Typography.Title>
            <Row gutter={16}>
                <Col span={8}><Statistic title="Phenopackets" value={summary.count} /></Col>
                <Col span={8}>
                    <Statistic title="Biosamples" value={summary.data_type_specific.biosamples.count} /></Col>
                <Col span={8}>
                    <Statistic title="Individuals" value={summary.data_type_specific.individuals.count} /></Col>
            </Row>
            {individualsBySex.length > 0 && individualsByKaryotype.length > 0 ? (
                <>
                    <Divider />
                    <Typography.Title level={4}>Overview: Individuals</Typography.Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <WrapSVG>
                                <VictoryPie data={individualsBySex} {...victoryPieProps} />
                                <VictoryLabel text="SEX" {...victoryLabelProps} />
                            </WrapSVG>
                        </Col>
                        <Col span={12}>
                            <WrapSVG>
                                <VictoryPie data={individualsByKaryotype} {...victoryPieProps} />
                                <VictoryLabel text="KARYOTYPE" {...victoryLabelProps} />
                            </WrapSVG>
                        </Col>
                    </Row>
                </>
            ) : null}
            {/*<Typography.Title level={4}>Overview: Biosamples</Typography.Title>*/}
            {/*<Row gutter={16}>*/}

            {/*</Row>*/}
        </>
    );
};


const GenericSummary = ({summary}) => summary ? (
    <Row gutter={16}><Col span={24}><Statistic title="Count" value={summary.count} /></Col></Row>
) : "No summary available";


class TableSummaryModal extends Component {
    render() {
        const table = this.props.table || {};

        let Summary = <GenericSummary />;
        switch (table.data_type) {
            case "variant":
                Summary = VariantSummary;
                break;
            case "phenopacket":
                Summary = PhenopacketSummary;
                break;
        }

        return (
            <Modal {...this.props}
                   title={<>
                       <Tag style={{marginRight: "24px"}}>{table.data_type}</Tag>
                       <span>Table "{table.name || table.table_id || ""}": Summary</span>
                   </>}
                   footer={null}
                   width={754}
                   onCancel={() => (this.props.onCancel || nop)()}>
                {(!this.props.summary || this.props.isFetchingSummaries) ? <Skeleton /> : (
                    <Summary summary={this.props.summary} />
                )}
            </Modal>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    isFetchingSummaries: state.tableSummaries.isFetching,
    summary: (state.tableSummaries.summariesByServiceArtifactAndTableID[(ownProps.table || {}).service_artifact]
        || {})[(ownProps.table || {}).table_id]
});

export default connect(mapStateToProps)(TableSummaryModal);
