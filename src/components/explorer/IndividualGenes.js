import React from "react";

import {Table} from "antd";
import "antd/es/table/style/css";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

import { PropTypes }from "prop-types";
// TODO: Only show genes from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualGenes = ({individual}) =>
{
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);
    const genes = (individual || {}).phenopackets.flatMap(p => p.genes);
    const genesFlat = genes.flatMap(g => g.symbol);
    const ids = (biosamples || []).map(b => 
        ({
            //title: `Genes`,
            // key: "id",
            render: (_, gene) => <div><pre>{gene}</pre></div>,
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
        })
    )

    return <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={ids}
           rowKey="id"
           dataSource={genesFlat} 
        />
    };
IndividualGenes.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualGenes;
