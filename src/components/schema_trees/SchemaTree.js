import React, {Component} from "react";
import PropTypes from "prop-types";

import {Tree} from "antd";
import "antd/es/tree/style/css";

import {generateSchemaTreeData} from "../../schema";

class SchemaTree extends Component {
    render() {
        return <div>{this.props.schema
            ? <Tree defaultExpandAll={true} treeData={[generateSchemaTreeData(this.props.schema)]} />
            : null}</div>;
    }
}

SchemaTree.propTypes = {
    schema: PropTypes.object
};

export default SchemaTree;
