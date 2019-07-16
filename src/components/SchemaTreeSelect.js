import React, {Component} from "react";

import {TreeSelect} from "antd";
import "antd/es/tree-select/style/css";

import {generateSchemaTreeData} from "../schema";

const generateSchemaTreeSelect = (schema, style) => (
    <TreeSelect treeDefaultExpandAll style={style}
                treeData={[generateSchemaTreeData(schema, "root", "chord_schema")]} />
);

class SchemaTreeSelect extends Component {
    render() {
        return this.props.schema
            ? (<div>{generateSchemaTreeSelect(this.props.schema, this.props.style)}</div>)
            : (<div />);
    }
}

export default SchemaTreeSelect;
