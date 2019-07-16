import React, {Component} from "react";

import {Tree} from "antd";
import "antd/es/tree/style/css";

import {generateSchemaTreeData} from "../schema";

const generateSchemaTree = schema => (
    <Tree defaultExpandAll treeData={generateSchemaTreeData(schema, "root", "chord_schema")} />
);

class SchemaTree extends Component {
    render() {
        return this.props.schema
            ? (<div>{generateSchemaTree(this.props.schema)}</div>)
            : (<div />);
    }
}

export default SchemaTree;
