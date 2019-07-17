import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Icon, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

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
            searchField: value.searchField || undefined,
            negation: value.negation || "pos",
            condition: value.condition || "eq",
            searchValue: value.searchValue || ""
        };
        this.onRemoveClick = this.props.onRemoveClick || (() => {});
    }

    handleSearchField(value) {
        if (!("value" in this.props)) this.setState({searchField: value.selected});
        this.triggerChange.bind(this)({searchField: value.selected});
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

    render() {
        return (
            <Input.Group compact>
                <SchemaTreeSelect
                    style={{
                        width: "256px",
                        float: "left",
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0"
                    }}
                    schema={this.props.dataset.schema} value={{selected: this.state.searchField}}
                    onChange={this.handleSearchField.bind(this)} />
                <Select style={{width: "88px", float: "left"}} value={this.state.negation}
                        onChange={this.handleNegation.bind(this)}>
                    <Select.Option key="pos">is</Select.Option>
                    <Select.Option key="neg">is not</Select.Option>
                </Select>
                <Select style={{width: "116px", float: "left"}} value={this.state.condition}
                        onChange={this.handleCondition.bind(this)}>
                    <Select.Option key="eq">=</Select.Option>
                    <Select.Option key="lt">&lt;</Select.Option>
                    <Select.Option key="le">&le;</Select.Option>
                    <Select.Option key="gt">&gt;</Select.Option>
                    <Select.Option key="ge">&ge;</Select.Option>
                    <Select.Option key="co">containing</Select.Option>
                </Select>
                <Input style={{width: `calc(100% - 510px)`}} placeholder="value"
                       onChange={this.handleSearchValue.bind(this)} value={this.state.searchValue} />
                <Button type="danger" style={{width: "50px"}} disabled={this.props.removeDisabled}
                        onClick={this.onRemoveClick}>
                    <Icon type="close" />
                </Button>
            </Input.Group>
        );
    }
}

DiscoverySearchCondition.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    onRemoveClick: PropTypes.func,
    removeDisabled: PropTypes.bool
};

export default DiscoverySearchCondition;
