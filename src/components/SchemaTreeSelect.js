import React, {Component} from "react";

import {TreeSelect} from "antd";
import "antd/es/tree-select/style/css";

import {ROOT_SCHEMA_ID, generateSchemaTreeData, getFieldSchema} from "../schema";
import PropTypes from "prop-types";

class SchemaTreeSelect extends Component {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {...(nextProps.value || {})};
        }
        return null;
    }

    constructor(props) {
        super(props);
        const value = props.value || {};
        this.state = {
            selected: value.selected || undefined,
            schema: value.schema || undefined
        };
    }

    onChange(selected) {
        // Set the state directly unless value is bound
        if (!("value" in this.props)) {
            this.setState({selected, schema: getFieldSchema(this.props.schema, selected)});
        }

        // Update the change handler bound to the component
        if (this.props.onChange) {
            this.props.onChange({...this.state, selected, schema: getFieldSchema(this.props.schema, selected)});
        }
    }

    render() {
        return this.props.schema
            ? (<TreeSelect treeDefaultExpandAll style={this.props.style} disabled={this.props.disabled}
                           treeData={[generateSchemaTreeData(this.props.schema, ROOT_SCHEMA_ID, "",
                               this.props.excludedKeys)]}
                           value={this.state.selected} onChange={this.onChange.bind(this)}
                           treeNodeLabelProp="titleSelected" />)
            : (<div style={this.props.style} />);
    }
}

SchemaTreeSelect.propTypes = {
    schema: PropTypes.object,
    excludedKeys: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    value: PropTypes.object
};

export default SchemaTreeSelect;
