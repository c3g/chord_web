import React, {Component} from "react";
import PropTypes from "prop-types";

import {Tree} from "antd";
import "antd/es/tree/style/css";

import {generateSchemaTreeData} from "../schema";

const generateSchemaTree = schema => (
    <Tree defaultExpandAll={true}
          treeData={[generateSchemaTreeData(schema, "[dataset item]", "", [])]} />
);

class SchemaTree extends Component {
    render() {
        return <div>{this.props.schema ? generateSchemaTree(this.props.schema) : null}</div>;
    }
}

SchemaTree.propTypes = {
    schema: PropTypes.object
};

export default SchemaTree;
