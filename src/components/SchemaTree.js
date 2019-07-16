import React, {Component} from "react";

import {Tree, Typography} from "antd";
import "antd/es/tree/style/css";
import "antd/es/typography/style/css";

const generateSchemaTreeData = (node, name, prefix) => {
    const key = `${prefix}.${name}`;
    const title = (<span><Typography.Text code>{name}</Typography.Text> - {node.type}</span>);
    switch (node.type) {
        case "object":
            return {
                key,
                title,
                children: Object.keys(node.properties)
                    .sort()
                    .map(k => generateSchemaTreeData(node.properties[k], k, key))
            };
        case "array":
            return {key, title, children: [generateSchemaTreeData(node.items, "[array item]", key)]};
        default:
            return {key, title, children: []};
    }
};

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
