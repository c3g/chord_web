import React, {Component} from "react";

import {Button, Form, Icon} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";

import {getFieldSchema, getFields} from "../../schema";
import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS} from "../../search";

import DiscoverySearchCondition from "./DiscoverySearchCondition";

class DiscoverySearchForm extends Component {
    constructor(props) {
        super(props);

        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
        this.onSubmit = this.onSubmit.bind(this)
    }

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

    addCondition(field = undefined) {
        const newKey = this.props.form.getFieldValue("keys").length;

        let searchParameters = {...DEFAULT_SEARCH_PARAMETERS};

        if (field) {
            const fs = getFieldSchema(this.props.dataType.schema, field);
            if (fs.hasOwnProperty("search")) {
                if (fs.search.hasOwnProperty("operations")) searchParameters.operations = fs.search.operations;
                if (fs.search.hasOwnProperty("canNegate")) searchParameters.canNegate = fs.search.canNegate;
                if (fs.search.hasOwnProperty("required")) searchParameters.required = fs.search.required;
                if (fs.search.hasOwnProperty("type")) searchParameters.type = fs.search.type;
            }
        }

        // Initialize new condition, otherwise the state won't get it
        this.props.form.getFieldDecorator(`conditions[${newKey}]`, {initialValue: {
            field,
            fieldSchema: { // TODO: Deduplicate this default object
                search: {...searchParameters}
            },
            negated: false,
            operation: OP_EQUALS,
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

    cannotBeUsed(fieldString) {
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return fs.search.hasOwnProperty("type") && fs.search.type === "single";
    }

    render() {
        this.props.form.getFieldDecorator("keys", {initialValue: []}); // Initialize keys if needed
        const keys = this.props.form.getFieldValue("keys");
        const existingUniqueFields = keys
            .filter(k => k !== undefined)
            .map(k => this.props.form.getFieldValue(`conditions[${k}]`).field)
            .filter(f => f !== undefined && this.cannotBeUsed(f));

        const formItems = keys.map((k, i) => (
            <Form.Item key={k} labelCol={{
                lg: {span: 24},
                xl: {span: 4},
                xxl: {span: 3}
            }} wrapperCol={{
                lg: {span: 24},
                xl: {span: 20},
                xxl: {span: 18}
            }} label={`Condition ${i+1}`}>
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: {
                        field: undefined,
                        fieldSchema: undefined,
                        negated: false,
                        operation: OP_EQUALS,
                        searchValue: ""
                    },
                    rules: [
                        {
                            validator: (rule, value, cb) => {
                                cb(value.field === undefined
                                    ? "A field must be specified for this search condition."
                                    : []);
                            }
                        }

                    ]
                })(<DiscoverySearchCondition dataType={this.props.dataType}
                                             existingUniqueFields={existingUniqueFields}
                                             onRemoveClick={() => this.removeCondition(k)}
                                             removeDisabled={keys.length <= 1}/>)}
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit}>
                {formItems}
                <Form.Item wrapperCol={{
                    xl: {span: 24},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="dashed" onClick={() => this.addCondition()} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add condition
                    </Button>
                </Form.Item>
                <Form.Item wrapperCol={{
                    xl: {span: 24},
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
