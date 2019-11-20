import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS, OPERATION_TEXT} from "../../search";

import SchemaTreeSelect from "../SchemaTreeSelect";

// TODO: On change dropdown, clear the value if it's incompatible!

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
            field2: value.field2 || undefined,

            fieldSchema: value.fieldSchema || {
                search: {...DEFAULT_SEARCH_PARAMETERS}
            },
            fieldSchema2: value.fieldSchema2 || {
                search: {...DEFAULT_SEARCH_PARAMETERS}
            },

            negated: value.negated || false,
            operation: value.operation || OP_EQUALS,
            searchValue: value.searchValue || "",

            // Non-value props
            dataType: props.dataType || null,
            dataType2: props.dataType2 || null,
        };

        this.onRemoveClick = this.props.onRemoveClick || (() => {});

        this.handleField = this.handleField.bind(this);
        this.handleNegation = this.handleNegation.bind(this);
        this.handleOperation = this.handleOperation.bind(this);
        this.handleSearchValue = this.handleSearchValue.bind(this);
        this.handleSearchSelectValue = this.handleSearchSelectValue.bind(this);
        this.triggerChange = this.triggerChange.bind(this);
    }

    handleField(value, key="field", fieldSchemaKey="fieldSchema") {
        if (!("value" in this.props)) this.setState({[key]: value.selected, [fieldSchemaKey]: value.schema});
        this.triggerChange({[key]: value.selected, [fieldSchemaKey]: value.schema});
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
        const conditionType = this.props.conditionType || "data-type";

        if (!this.state.fieldSchema) return (<div />);

        const canRemove = !(this.state.fieldSchema.search.hasOwnProperty("type")
            && this.state.fieldSchema.search.type === "single" && this.state.fieldSchema.search.required);

        const operationOptions = this.state.fieldSchema.search.operations.map(o =>
            <Select.Option key={o}>{OPERATION_TEXT[o]}</Select.Option>);

        // Subtract 1 from different elements' widths due to -1 margin-left
        const valueWidth = (224 + (conditionType === "join" ? 224 : 0) + (canRemove ? 49 : 0)
            + (this.state.fieldSchema.search.canNegate ? 87 : 0) + (this.equalsOnly() ? 0 : 115));

        const getInputStyle = () => ({width: `calc(100% - ${valueWidth}px)`});

        const dataTypeOptions = Object.keys(this.props.dataTypes).map(d => (
            <Select.Option key={d} value={d}>{d}</Select.Option>
        ));

        const lhs = (
            <>
                {conditionType === "join" ? (
                    <Select style={{float: "left", width: `calc(50% - ${valueWidth / 2}px)`}}
                            onChange={v => this.setState({dataType: this.props.dataTypes[v]})}
                            placeholder="Data Type 1">
                        {dataTypeOptions}
                    </Select>
                ) : null}
                <SchemaTreeSelect
                    style={{
                        width: "224px",
                        float: "left",
                        ...(conditionType === "join" ? {
                            borderTopLeftRadius: "0",
                            borderBottomLeftRadius: "0"
                        } : {}),
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0"
                    }}
                    disabled={!canRemove}
                    schema={(this.state.dataType || {}).schema}
                    excludedKeys={this.props.existingUniqueFields}
                    value={{selected: this.state.field, schema: this.state.fieldSchema}}
                    onChange={this.handleField} />
            </>
        );

        const rhs = conditionType === "join" ? (
            <>
                <Select style={{float: "left", width: `calc(50% - ${valueWidth / 2}px)`}}
                        placeholder="Data Type 2"
                        onChange={v => this.setState({dataType2: this.props.dataTypes[v]})}>
                    {dataTypeOptions}
                </Select>
                <SchemaTreeSelect
                    style={{
                        width: "224px",
                        float: "left",
                        ...(conditionType === "join" ? {
                            borderTopRightRadius: "0",
                            borderBottomRightRadius: "0"
                        } : {}),
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0"
                    }}
                    disabled={!canRemove}
                    schema={(this.state.dataType2 || {}).schema}
                    excludedKeys={this.props.existingUniqueFields}
                    value={{selected: this.state.field2, schema: this.state.fieldSchema2}}
                    onChange={v => this.handleField(v, "field2", "fieldSchema2")} />
            </>
        ) : (
            this.state.fieldSchema.hasOwnProperty("enum") ? (
                <Select style={getInputStyle()} onChange={this.handleSearchSelectValue}
                        value={this.state.searchValue} showSearch filterOption={(i, o) =>
                    o.props.children.toLocaleLowerCase().includes(i.toLocaleLowerCase())}>
                    {this.state.fieldSchema.enum.map(v => <Select.Option key={v}>{v}</Select.Option>)}
                </Select>
            ) : (
                <Input style={getInputStyle()} placeholder="value" onChange={this.handleSearchValue}
                       value={this.state.searchValue} />
            )
        );

        return (
            <Input.Group compact>
                {lhs}
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
                {rhs}
                {canRemove ? (
                    <Button type="danger" style={{width: "50px"}} disabled={this.props.removeDisabled}
                            onClick={this.onRemoveClick} icon="close" />
                ) : null}
            </Input.Group>
        );
    }
}

DiscoverySearchCondition.propTypes = {
    conditionType: PropTypes.oneOf(["data-type", "join"]),
    dataType: PropTypes.object,
    dataTypes: PropTypes.object,
    existingUniqueFields: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
    removeDisabled: PropTypes.bool
};

const mapStateToProps = state => ({
    dataTypes: state.serviceDataTypes.itemsByID
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(DiscoverySearchCondition);
