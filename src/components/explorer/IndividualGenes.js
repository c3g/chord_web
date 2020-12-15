import React from "react";

import {Table} from "antd";
import "antd/es/table/style/css";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

import { PropTypes }from "prop-types";
// TODO: Only show genes from the relevant dataset, if specified;
//  highlight those found in search results, if specified

// const GENES_COLUMNS = [
//     {
//         title: "ID",
//         key: "id",
//         render: (_, individual) => individual.id,
//         sorter: (a, b) => a.id.localeCompare(b.id),
//         defaultSortOrder: "ascend",
//     },
//     {
//         title: "Sampled Tissue",
//         key: "sampled_tissue",
//         render: (_, individual) => renderOntologyTerm(individual.sampled_tissue),
//     },
//     {
//         title: "Procedure",
//         key: "procedure",
//         render: (_, individual) => <>
//             <strong>Code:</strong> {renderOntologyTerm(individual.procedure.code)}<br />
//             {individual.procedure.body_site
//                 ? <><br /><strong>Body Site:</strong> {renderOntologyTerm(individual.procedure.body_site)}</>
//                 : null}
//         </>,
//     },
//     {
//         title: "Ind. Age at Collection",
//         key: "individual_age_at_collection",
//         render: (_, individual) => {
//             const age = individual.individual_age_at_collection;
//             return age
//                 ? (age.hasOwnProperty("age") ? age.age : `Between ${age.start.age} and ${age.end.age}`)
//                 : EM_DASH;
//         },
//     },
// ];

const IndividualGenes = ({individual}) =>
{
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);
    const genes = (individual || {}).phenopackets.flatMap(p => p.genes);
    const genesFlat = genes.flatMap(g => g.symbol);
    const ids = (biosamples || []).map(b => 
        ({
            title: b.id,
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
