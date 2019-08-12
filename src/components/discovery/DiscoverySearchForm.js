import React, {Component} from "react";

import {Button, Form, Icon} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";

import {getFieldSchema, getFields} from "../../schema";

import DiscoverySearchCondition from "./DiscoverySearchCondition";

class DiscoverySearchForm extends Component {
    componentDidMount() {
        // TODO: MAKE THIS WORK this.addCondition(); // Make sure there's one condition at least
        if (this.props.form.getFieldValue("keys").length === 0) {
            getFields(this.props.dataType.schema)
                .filter(f => {
                    const fs = getFieldSchema(this.props.dataType.schema, f);
                    return fs.hasOwnProperty("search") && fs.search.hasOwnProperty("required") && fs.search.required;
                })
                .forEach(c => this.addCondition(c));
        }
    }

    removeCondition(k) {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").filter(key => key !== k)
        });
    }

    addCondition(searchField = undefined) {
        const newKey = this.props.form.getFieldValue("keys").length;

        // Initialize new condition, otherwise the state won't get it
        this.props.form.getFieldDecorator(`conditions[${newKey}]`, {initialValue: {
            searchField,
            fieldSchema: { // TODO: Deduplicate this default object
                search: {
                    operations: ["eq", "lt", "le", "gt", "ge", "co"],
                    canNegate: false
                }
            },
            negation: "pos",
            condition: "eq",
            searchValue: ""
        }});

        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(newKey),
        });

    }

    onSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            this.props.onSubmit(values["keys"].map(k => values["conditions"][k]));
        });
    }

    render() {
        this.props.form.getFieldDecorator("keys", {initialValue: []}); // Initialize keys if needed
        const keys = this.props.form.getFieldValue("keys");
        const formItems = keys.map((k, i) => (
            <Form.Item key={k} labelCol={{
                lg: {span: 24},
                xl: {span: 4},
                xxl: {span: 3}
            }} wrapperCol={{
                lg: {span: 24},
                xl: {span: 20},
                xxl: {span: 21}
            }} label={`Condition ${i+1}`}>
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: {
                        searchField: undefined,
                        negation: "pos",
                        condition: "eq",
                        searchValue: ""
                    },
                    rules: [
                        {
                            validator: (rule, value, cb) => {
                                cb(value.searchField === undefined
                                    ? "A field must be specified for this search condition."
                                    : []);
                            }
                        }

                    ]
                })(<DiscoverySearchCondition dataType={this.props.dataType}
                                             onRemoveClick={() => this.removeCondition.bind(this)(k)}
                                             removeDisabled={keys.length <= 1}/>)}
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit.bind(this)}>
                {formItems}
                <Form.Item wrapperCol={{
                    xl: {span: 24},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="dashed" onClick={this.addCondition.bind(this)} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add condition
                    </Button>
                </Form.Item>
                <Form.Item wrapperCol={{
                    lg: {span: 24},
                    xl: {offset: 5, span: 14},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="primary" htmlType="submit" loading={this.props.loading}>
                        Search
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({
    name: "discovery_search_form",
    mapPropsToFields: ({formValues}) => ({
        keys: Form.createFormField({...formValues.keys}),
        ...Object.assign({}, ...(formValues["conditions"] || [])
            .map(c => ({[c.name]: Form.createFormField({...c})})))
    }),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(DiscoverySearchForm);
