import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Icon, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

import SchemaTreeSelect from "../SchemaTreeSelect";

const OPERATION_TEXT = {
    "eq": "=",
    "lt": "<",
    "le": "\u2264",
    "gt": ">",
    "ge": "\u2265",
    "co": "contains"
};

class DiscoverySearchCondition extends Component {
    static getDerivedStateFromProps(nextProps) {
        return "value" in nextProps
            ? {...(nextProps.value || {})}
            : null;
    }

    constructor(props) {
        super(props);
        const value = this.props.value || {};
        this.state = {
            searchField: value.searchField || undefined,
            fieldSchema: value.fieldSchema || {
                search: {
                    operations: ["eq", "lt", "le", "gt", "ge", "co"],
                    canNegate: false,
                    required: false,
                    type: "unlimited"
                }
            },
            negation: value.negation || "pos",
            condition: value.condition || "eq",
            searchValue: value.searchValue || ""
        };
        this.onRemoveClick = this.props.onRemoveClick || (() => {});
    }

    handleSearchField(value) {
        if (!("value" in this.props)) this.setState({searchField: value.selected, fieldSchema: value.schema});
        this.triggerChange.bind(this)({searchField: value.selected, fieldSchema: value.schema});
    }

    handleNegation(value) {
        if (!("value" in this.props)) this.setState({negation: value});
        this.triggerChange.bind(this)({negation: value});
    }

    handleCondition(value) {
        if (!("value" in this.props)) this.setState({condition: value});
        this.triggerChange.bind(this)({condition: value});
    }

    handleSearchValue(e) {
        if (!("value" in this.props)) this.setState({searchValue: e.target.value});
        this.triggerChange.bind(this)({searchValue: e.target.value});
    }

    triggerChange(change) {
        if (this.props.onChange) {
            this.props.onChange(Object.assign({}, this.state, change));
        }
    }

    equalsOnly() {
        return this.state.fieldSchema.search.operations.includes("eq") &&
            this.state.fieldSchema.search.operations.length === 1;
    }

    render() {
        const canRemove = !(this.state.fieldSchema.search.hasOwnProperty("type")
            && this.state.fieldSchema.search.type === "single" && this.state.fieldSchema.search.required);

        const operationOptions = this.state.fieldSchema.search.operations.map(o =>
            (<Select.Option key={o}>{OPERATION_TEXT[o]}</Select.Option>));

        const operationsWidth = this.equalsOnly() ? 0 : 116;

        const valueWidth = 256 + (canRemove ? 50 : 0)
            + (this.state.fieldSchema.search.canNegate ? 88 + operationsWidth : operationsWidth);

        return (
            <Input.Group compact>
                <SchemaTreeSelect
                    style={{
                        width: "256px",
                        float: "left",
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0"
                    }}
                    disabled={!canRemove}
                    schema={this.props.dataType.schema}
                    value={{selected: this.state.searchField, schema: this.state.fieldSchema}}
                    onChange={this.handleSearchField.bind(this)} />
                {this.state.fieldSchema.search.canNegate ? (
                    <Select style={{width: "88px", float: "left"}} value={this.state.negation}
                            onChange={this.handleNegation.bind(this)}>
                        <Select.Option key="pos">is</Select.Option>
                        <Select.Option key="neg">is not</Select.Option>
                    </Select>
                ) : null}
                {this.equalsOnly() ? null : (
                    <Select style={{width: "116px", float: "left"}} value={this.state.condition}
                            onChange={this.handleCondition.bind(this)}>
                        {operationOptions}
                    </Select>
                )}
                <Input style={{width: `calc(100% - ${valueWidth}px)`}} placeholder="value"
                       onChange={this.handleSearchValue.bind(this)} value={this.state.searchValue} />
                {canRemove ? (
                    <Button type="danger" style={{width: "50px"}} disabled={this.props.removeDisabled}
                            onClick={this.onRemoveClick}>
                        <Icon type="close" />
                    </Button>
                ) : null}
            </Input.Group>
        );
    }
}

DiscoverySearchCondition.propTypes = {
    dataType: PropTypes.object,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
    removeDisabled: PropTypes.bool
};

export default DiscoverySearchCondition;
