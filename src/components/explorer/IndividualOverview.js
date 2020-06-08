import React from "react";

import {Descriptions} from "antd";
import "antd/es/descriptions/style/css";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

const IndividualOverview = ({individual}) => individual ?
    <Descriptions bordered={true} size="middle">
        <Descriptions.Item label="Date of Birth">{individual.date_of_birth || EM_DASH}</Descriptions.Item>
        <Descriptions.Item label="Sex">{individual.sex || "UNKNOWN_SEX"}</Descriptions.Item>
        <Descriptions.Item label="Karyotypic Sex">{individual.karyotypic_sex || "UNKNOWN_KARYOTYPE"}</Descriptions.Item>
        {/* TODO: Link to ontology term */}
        <Descriptions.Item label="Taxonomy">
            {renderOntologyTerm(individual.taxonomy
                ? {...individual.taxonomy, label: <em>{individual.taxonomy.label}</em>}
                : null)}
        </Descriptions.Item>
    </Descriptions> : <div />;

IndividualOverview.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualOverview;
