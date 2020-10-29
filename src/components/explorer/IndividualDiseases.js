import React from "react";

import "antd/es/table/style/css";
import {Table} from "antd";


import {individualPropTypesShape} from "../../propTypes";
import { EM_DASH } from "../../constants";

// TODO: Only show diseases from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const DISEASE_COLUMNS = [
    {
        title: "Disease ID",
        key: "d_id",
        render: (_, individual) => individual.id,
        sorter: (a, b) => a.id.toString().localeCompare(b.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Term ID",
        key: "t_id",
        render: (_, individual) => individual.term.id,
    },
    {
        title: "Label",
        key: "t_label",
        render: (_, individual) => individual.term.label,
    },
    {
        title: "Extra Properties",
        key: "extra_properties",
        render: (_, individual) => 
            (individual.hasOwnProperty("extra_properties") && Object.keys(individual.extra_properties).length)
                ?  <div><pre>{JSON.stringify(individual.extra_properties, null, 2)}</pre></div>
                : EM_DASH,
    }
];

const IndividualDiseases = ({individual}) =>
    <Table bordered
           size="middle"
           pagination={{pageSize: 25}}
           columns={DISEASE_COLUMNS}
           rowKey="id"                    
           dataSource={(individual || {}).phenopackets.flatMap(p => p.diseases)} />;



IndividualDiseases.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualDiseases;
