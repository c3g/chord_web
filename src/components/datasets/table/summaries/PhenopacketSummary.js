import React from "react";
import PropTypes from "prop-types";

import {Col, Divider, Row, Statistic, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/icon/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import {VictoryLabel, VictoryPie} from "victory";

import {summaryPropTypesShape} from "../../../../propTypes";


const WrapSVG = ({children}) => <svg viewBox="0 0 400 250">{children}</svg>;
WrapSVG.propTypes = {children: PropTypes.any};


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

    return <>
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
    </>;
};

PhenopacketSummary.propTypes = {
    summary: summaryPropTypesShape
};

export default PhenopacketSummary;
