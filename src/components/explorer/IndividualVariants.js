import React from "react";

import {Table} from "antd";
import "antd/es/table/style/css";

import {individualPropTypesShape} from "../../propTypes";

// TODO: Only show variants from the relevant dataset, if specified;
//  highlight those found in search results, if specified

const IndividualVariants = ({individual}) =>
{
    const biosamples = (individual || {}).phenopackets.flatMap(p => p.biosamples);
    const variantsFlat = biosamples.map(b=> (b || {}).variants).flatMap(v => (v || []).map(_v => (_v || {}).hgvsAllele));
    const ids = (biosamples || []).map(b => 
        ({
            title: `Biosample ${b.id}`,
            // key: "id",
            render: (_, hgvs) => <div><pre>{JSON.stringify(hgvs, null, 2)}</pre></div>,
            //sorter: (a, b) => a.id.localeCompare(b.id),
            //defaultSortOrder: "ascend"
        })
    );

    return <Table bordered
                  size="middle"
                  pagination={{pageSize: 25}}
                  columns={ids}
                  rowKey="id"
                  dataSource={variantsFlat} 
        />;
};
        

IndividualVariants.propTypes = {
    individual: individualPropTypesShape
    //PropTypes.array,
};

export default IndividualVariants;
