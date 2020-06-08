import React from "react";

import {Col, Divider, Modal, Row, Statistic, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/divider/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";

import {VictoryLabel, VictoryPie} from "victory";
import VictoryPieWrapSVG from "../VictoryPieWrapSVG";

import {KARYOTYPIC_SEX_VALUES, SEX_VALUES} from "../../dataTypes/phenopacket";
import {VICTORY_PIE_LABEL_PROPS, VICTORY_PIE_PROPS} from "../../styles/victory";

const SearchSummaryModal = ({searchResults, ...props}) => {
    const searchFormattedResults = searchResults.searchFormattedResults || [];

    console.log(searchFormattedResults);

    // Individuals summary

    const numIndividualsBySex = Object.fromEntries(SEX_VALUES.map(v => [v, 0]));
    const numIndividualsByKaryotype = Object.fromEntries(KARYOTYPIC_SEX_VALUES.map(v => [v, 0]));
    searchFormattedResults.forEach(r => {
        numIndividualsBySex[r.individual.sex]++;
        numIndividualsByKaryotype[r.individual.karyotypic_sex]++;
    });

    const individualsBySex = Object.entries(numIndividualsBySex)
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({x, y}));

    const individualsByKaryotype = Object.entries(numIndividualsByKaryotype)
        .filter(e => e[1] > 0)
        .map(([x, y]) => ({x, y}));

    // Biosamples summary
    // TODO: More ontology aware

    const numSamplesByTissue = {};
    searchFormattedResults.forEach(r => r.biosamples.forEach(b => {
        const key = (b.sampled_tissue || {}).label || "N/A";
        numSamplesByTissue[key] = (numSamplesByTissue[key] || 0) + 1;
    }));

    // TODO: Procedures: account for both code and (if specified) body_site
    //  e.g. "Biopsy" or "Biopsy on X body site" - maybe stacked bar or grouped bar chart?

    return searchResults ? <Modal title="Search Results" {...props} width={960} footer={null}>
        <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Individuals" value={searchFormattedResults.length} />
            </Col>
            <Col span={12}>
                <Statistic title="Biosamples"
                           value={searchFormattedResults
                               .map(i => i.biosamples.length)
                               .reduce((s, v) => s + v, 0)} />
            </Col>
        </Row>
        {(individualsBySex.length > 0 && individualsByKaryotype.length > 0) ? <>
            {/* TODO: Deduplicate with phenopacket summary */}
            <Divider />
            <Typography.Title level={4}>Overview: Individuals</Typography.Title>
            <Row gutter={16}>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={individualsBySex} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="SEX" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
                <Col span={12}>
                    <VictoryPieWrapSVG>
                        <VictoryPie data={individualsByKaryotype} {...VICTORY_PIE_PROPS} />
                        <VictoryLabel text="KARYOTYPE" {...VICTORY_PIE_LABEL_PROPS} />
                    </VictoryPieWrapSVG>
                </Col>
            </Row>
        </> : null}
    </Modal> : null;
}

export default SearchSummaryModal;
