import React from "react";

import {Table} from "antd";
import "antd/es/table/style/css";

import {EM_DASH} from "../../constants";
import {renderOntologyTerm} from "./ontologies";

// TODO: Only show biosamples from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const BIOSAMPLE_COLUMNS = [
    {
        title: "ID",
        key: "id",
        sorter: (a, b) => a.id.localeCompare(b.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Sampled Tissue",
        key: "sampled_tissue",
        render: renderOntologyTerm,
    },
    {
        title: "Procedure",
        key: "procedure",
        render: (_, individual) => <>
            <strong>Code:</strong> {renderOntologyTerm(individual.procedure.code)}<br />
            {individual.procedure.body_site
                ? <><br /><strong>Body Site:</strong> {renderOntologyTerm(individual.procedure.body_site)}</>
                : null}
        </>,
    },
    {
        title: "Ind. Age at Collection",
        key: "individual_age_at_collection",
        render: (_, individual) => {
            const age = individual.individual_age_at_collection;
            return age
                ? (age.hasOwnProperty("age") ? age.age : `Between ${age.start.age} and ${age.end.age}`)
                : EM_DASH
        },
    },
];

const IndividualBiosamples = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={BIOSAMPLE_COLUMNS}
           dataSource={(individual || {}).biosamples || []} />;

export default IndividualBiosamples;
