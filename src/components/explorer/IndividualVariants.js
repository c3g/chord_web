import React from "react";

import {Table} from "antd";
import "antd/es/table/style/css";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";
import {individualPropTypesShape} from "../../propTypes";

import { PropTypes }from "prop-types";
// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

// const VARIANTS_COLUMNS = [
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

const IndividualVariants = ({individual}) =>
{
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);
    const variantsFlat = biosamples.map(b=>b.variants).flatMap(v => v.map(_v => _v.hgvsAllele));
    const ids = (biosamples || []).map(b => 
        ({
            title: b.id,
            // key: "id",
            render: (_, hgvs) => <div><pre>{JSON.stringify(hgvs, null, 2)}</pre></div>,
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
        })
    )
    
    return <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={ids}
           rowKey="id"
           dataSource={variantsFlat} 
        />
    };
        

IndividualVariants.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualVariants;
