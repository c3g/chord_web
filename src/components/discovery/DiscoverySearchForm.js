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

        this.initialValues = {};

        this.getDataTypeFieldSchema = this.getDataTypeFieldSchema.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
    }

    componentDidMount() {
        // TODO: MAKE THIS WORK this.addCondition(); // Make sure there's one condition at least
        if (this.props.form.getFieldValue("keys").length === 0) {
            const requiredFields = this.props.dataType
                ? getFields(this.props.dataType.schema).filter(f =>
                    (getFieldSchema(this.props.dataType.schema, f).search || {required: false}).required || false)
                : [];

            requiredFields.forEach(c => this.addCondition(c));

            // Add a single default condition if necessary
            if (requiredFields.length === 0) this.addCondition();
        }
    }

    removeCondition(k) {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").filter(key => key !== k)
        });
    }

    getDataTypeFieldSchema(field) {
        const fs = field ? getFieldSchema(this.props.dataType.schema, field) : {};
        return {
            ...fs,
            search: {
                ...DEFAULT_SEARCH_PARAMETERS,
                ...(fs.search || {})
            }
        };
    }

    addCondition(field = undefined, field2 = undefined) {
        const conditionType = this.props.conditionType || "data-type";

        const newKey = this.props.form.getFieldValue("keys").length;

        // TODO: What if operations is an empty list?

        const fieldSchema = conditionType === "data-type"
            ? this.getDataTypeFieldSchema(field)
            : {search: {...DEFAULT_SEARCH_PARAMETERS}};  // Join search conditions have all operators "available" TODO

        this.initialValues = {
            ...this.initialValues,
            [`conditions[${newKey}]`]: {
                field,
                ...(conditionType === "data-type" ? {} : {field2}),
                fieldSchema,
                negated: false,
                operation: ((fieldSchema || {search: {}}).search.operations || [OP_EQUALS])[0] || OP_EQUALS,
                ...(conditionType === "data-type" ? {searchValue: ""} : {})
            }
        };


        // Initialize new condition, otherwise the state won't get it
        this.props.form.getFieldDecorator(`conditions[${newKey}]`, {
            initialValue: this.initialValues[`conditions[${newKey}]`]
        });

        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(newKey)
        });
    }

    cannotBeUsed(fieldString) {
        if (this.props.conditionType === "join") return;
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
                    initialValue: this.initialValues[`conditions[${k}]`],
                    rules: [
                        {
                            validator: (rule, value, cb) => {
                                cb(value.field === undefined
                                    ? "A field must be specified for this search condition."
                                    : []);
                            }
                        }

                    ]
                })(<DiscoverySearchCondition conditionType={this.props.conditionType || "data-type"}
                                             dataType={this.props.dataType}
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
                    <Button type="dashed" onClick={() => this.addCondition()} style={{width: "100%"}}>
                        <Icon type="plus" /> Add condition
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({
    mapPropsToFields: ({formValues}) => ({
        keys: Form.createFormField({...formValues.keys}),
        ...Object.assign({}, ...(formValues["conditions"] || [])
            .filter(c => c !== null)  // TODO: Why does this happen?
            .map(c => ({[c.name]: Form.createFormField({...c})})))
    }),
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    },
})(DiscoverySearchForm);
