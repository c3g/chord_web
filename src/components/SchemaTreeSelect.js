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
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {...(nextProps.value ? nextProps.value : {})};
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value ? props.value : {};
        this.state = {selected: value.selected ? value.selected : undefined};
    }

    onChange(selected) {
        // Set the state directly unless value is bound
        if (!("value" in this.props)) {
            this.setState({selected});
        }

        // Update the change handler bound to the component
        if (this.props.onChange) {
            this.props.onChange(Object.assign({}, this.state, {selected}));
        }
    }

    render() {
        return this.props.schema
            ? generateSchemaTreeSelect(this.props.schema, this.props.style, this.onChange.bind(this))
            : (<div style={this.props.style} />);
    }
}

export default SchemaTreeSelect;
