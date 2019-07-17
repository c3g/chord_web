import React, {Component} from "react";

import {TreeSelect} from "antd";
import "antd/es/tree-select/style/css";

import {generateSchemaTreeData} from "../schema";

const generateSchemaTreeSelect = (schema, style, onChange) => (
    <TreeSelect treeDefaultExpandAll style={style}
                treeData={[generateSchemaTreeData(schema, "dataset item", "chord_schema")]}
                onChange={onChange} />
);

class SchemaTreeSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ""};
    }

    onChange(value) {
        this.setState({value});
        if (this.props.onChange) {
            this.props.onChange(Object.assign({}, this.state, {value}));
        }
    }

    render() {
        return this.props.schema
            ? generateSchemaTreeSelect(this.props.schema, this.props.style, this.onChange.bind(this))
            : (<div style={this.props.style} />);
    }
}

export default SchemaTreeSelect;
