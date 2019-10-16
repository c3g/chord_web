import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS, OPERATION_TEXT} from "../../search";

import SchemaTreeSelect from "../SchemaTreeSelect";

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
            field: value.field || undefined,
            fieldSchema: value.fieldSchema || {
                search: {...DEFAULT_SEARCH_PARAMETERS}
            },
            negated: value.negated || false,
            operation: value.operation || OP_EQUALS,
            searchValue: value.searchValue || ""
        };

        this.onRemoveClick = this.props.onRemoveClick || (() => {});

        this.handleField = this.handleField.bind(this);
        this.handleNegation = this.handleNegation.bind(this);
        this.handleOperation = this.handleOperation.bind(this);
        this.handleSearchValue = this.handleSearchValue.bind(this);
        this.handleSearchSelectValue = this.handleSearchSelectValue.bind(this);
        this.triggerChange = this.triggerChange.bind(this);
    }

    handleField(value) {
        if (!("value" in this.props)) this.setState({field: value.selected, fieldSchema: value.schema});
        this.triggerChange({field: value.selected, fieldSchema: value.schema});
    }

    handleNegation(value) {
        if (!("value" in this.props)) this.setState({negated: (value === true || value === "neg")});
        this.triggerChange({negated: (value === true || value === "neg")});
    }

    handleOperation(value) {
        if (!("value" in this.props)) this.setState({operation: value});
        this.triggerChange({operation: value});
    }

    handleSearchValue(e) {
        if (!("value" in this.props)) this.setState({searchValue: e.target.value});
        this.triggerChange({searchValue: e.target.value});
    }

    handleSearchSelectValue(searchValue) {
        if (!("value" in this.props)) this.setState({searchValue});
        this.triggerChange({searchValue});
    }

    triggerChange(change) {
        if (this.props.onChange) {
            this.props.onChange({...this.state, ...change});
        }
    }

    equalsOnly() {
        return this.state.fieldSchema.search.operations.includes(OP_EQUALS) &&
            this.state.fieldSchema.search.operations.length === 1;
    }

    render() {
        const canRemove = !(this.state.fieldSchema.search.hasOwnProperty("type")
            && this.state.fieldSchema.search.type === "single" && this.state.fieldSchema.search.required);

        const operationOptions = this.state.fieldSchema.search.operations.map(o =>
            <Select.Option key={o}>{OPERATION_TEXT[o]}</Select.Option>);

        // Subtract 1 from different elements' widths due to -1 margin-left
        const valueWidth = 224 + (canRemove ? 49 : 0)
            + (this.state.fieldSchema.search.canNegate ? 87 : 0) + (this.equalsOnly() ? 0 : 115);

        const getInputStyle = () => ({width: `calc(100% - ${valueWidth}px)`});

        return (
            <Input.Group compact>
                <SchemaTreeSelect
                    style={{
                        width: "224px",
                        float: "left",
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0"
                    }}
                    disabled={!canRemove}
                    schema={this.props.dataType.schema}
                    excludedKeys={this.props.existingUniqueFields}
                    value={{selected: this.state.field, schema: this.state.fieldSchema}}
                    onChange={this.handleField} />
                {this.state.fieldSchema.search.canNegate ? (
                    <Select style={{width: "88px", float: "left"}} value={this.state.negated ? "neg" : "pos"}
                            onChange={this.handleNegation}>
                        <Select.Option key="pos">is</Select.Option>
                        <Select.Option key="neg">is not</Select.Option>
                    </Select>
                ) : null}
                {this.equalsOnly() ? null : (
                    <Select style={{width: "116px", float: "left"}} value={this.state.operation}
                            onChange={this.handleOperation}>
                        {operationOptions}
                    </Select>
                )}
                {this.state.fieldSchema.hasOwnProperty("enum") ? (
                    <Select style={getInputStyle()} onChange={this.handleSearchSelectValue}
                            value={this.state.searchValue} showSearch filterOption={(i, o) =>
                                o.props.children.toLocaleLowerCase().includes(i.toLocaleLowerCase())}>
                        {this.state.fieldSchema.enum.map(v => <Select.Option key={v}>{v}</Select.Option>)}
                    </Select>
                ) : (
                    <Input style={getInputStyle()} placeholder="value" onChange={this.handleSearchValue}
                           value={this.state.searchValue} />
                )}
                {canRemove ? (
                    <Button type="danger" style={{width: "50px"}} disabled={this.props.removeDisabled}
                            onClick={this.onRemoveClick} icon="close" />
                ) : null}
            </Input.Group>
        );
    }
}

DiscoverySearchCondition.propTypes = {
    dataType: PropTypes.object,
    existingUniqueFields: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
    removeDisabled: PropTypes.bool
};

export default DiscoverySearchCondition;
