import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Form} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";

import {PlusOutlined} from "@ant-design/icons";

import {getFieldSchema, getFields} from "../../schema";
import {DEFAULT_SEARCH_PARAMETERS, OP_EQUALS} from "../../search";

import DiscoverySearchCondition, {getSchemaTypeTransformer} from "./DiscoverySearchCondition";


// noinspection JSUnusedGlobalSymbols
const CONDITION_RULES = [
    {
        validator: (rule, value, cb) => {
            if (value.field === undefined) {
                cb("A field must be specified for this search condition.");
            }

            const searchValue = getSchemaTypeTransformer(value.fieldSchema.type)[1](value.searchValue);
            const isEnum = value.fieldSchema.hasOwnProperty("enum");

            // noinspection JSCheckFunctionSignatures
            if (searchValue === null
                    || (!isEnum && !searchValue)
                    || (isEnum && !value.fieldSchema.enum.includes(searchValue))) {
                cb("This field is required.");
            }

            cb();
        }
    }

];


class DiscoverySearchForm extends Component {
    constructor(props) {
        super(props);

        this.initialValues = {};

        this.getDataTypeFieldSchema = this.getDataTypeFieldSchema.bind(this);
        this.makeCondition = this.makeCondition.bind(this);

        this.form = React.createRef();
    }

    componentDidMount() {
        const requiredFields = this.props.dataType
            ? getFields(this.props.dataType.schema).filter(f =>
                (getFieldSchema(this.props.dataType.schema, f).search || {required: false}).required || false)
            : [];

        this.initialValues = {
            ...this.initialValues,
            conditions: requiredFields.map(c => this.makeCondition(c, undefined, true))
        };

        if (requiredFields.length === 0 && this.props.conditionType !== "join") {
            this.initialValues = {
                ...this.initialValues,
                conditions: [this.makeCondition(undefined, undefined, true)]
            };
        }

        this.form.current.setFieldsValue(this.initialValues);

        // TODO: Add all required fields
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

    makeCondition(field = undefined, field2 = undefined, didMount = false) {
        const conditionType = this.props.conditionType || "data-type";

        // TODO: What if operations is an empty list?

        const fieldSchema = conditionType === "data-type"
            ? this.getDataTypeFieldSchema(field)
            : {search: {...DEFAULT_SEARCH_PARAMETERS}};  // Join search conditions have all operators "available" TODO

        return {
            field,
            ...(conditionType === "data-type" ? {} : {field2}),
            fieldSchema,
            negated: false,
            operation: ((fieldSchema || {search: {}}).search.operations || [OP_EQUALS])[0] || OP_EQUALS,
            ...(conditionType === "data-type" ? {searchValue: ""} : {})
        };
    }

    cannotBeUsed(fieldString) {
        if (this.props.conditionType === "join") return;
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return (fs.search || {}).type === "single";
    }

    isNotPublic(fieldString) {
        if (this.props.conditionType === "join") return;
        const fs = getFieldSchema(this.props.dataType.schema, fieldString);
        return ["internal", "none"].includes((fs.search || {}).queryable);
    }

    render() {
        // const getCondition = ck => this.form.current.getFieldValue(`conditions[${ck}]`);

        // let formItems = [];
        //
        // if (this.form.current) {
        //     const keys = this.form.current.getFieldValue("keys");
        //     const existingUniqueFields = keys
        //         .filter(k => k !== undefined)
        //         .map(k => getCondition(k).field)
        //         .filter(f => f !== undefined && this.cannotBeUsed(f));
        //
        //     formItems = keys.map((k, i) => (
        //         <Form.Item key={k}
        //                    labelCol={{lg: {span: 24}, xl: {span: 4}, xxl: {span: 3}}}
        //                    wrapperCol={{lg: {span: 24}, xl: {span: 20}, xxl: {span: 18}}}
        //                    label={`Condition ${i + 1}`}
        //                    help={this.state.conditionsHelp[k] || undefined}
        //                    name={`conditions[${k}]`}
        //                    validateTrigger={false}
        //                    rules={CONDITION_RULES}>
        //             <DiscoverySearchCondition conditionType={this.props.conditionType || "data-type"}
        //                                       dataType={this.props.dataType}
        //                                       isExcluded={f => existingUniqueFields.includes(f) || this.isNotPublic(f)}
        //                                       onFieldChange={change => this.handleFieldChange(k, change)}
        //                                       onRemoveClick={() => this.removeCondition(k)}
        //                                       removeDisabled={(() => {
        //                                           if (this.props.conditionType === "join") return false;
        //                                           if (keys.length <= 1) return true;
        //
        //                                           const conditionValue = getCondition(k);
        //
        //                                           // If no field has been selected, it's removable
        //                                           if (!conditionValue.field) return false;
        //
        //                                           return keys.map(getCondition)
        //                                               .filter(cv => ((cv.fieldSchema || {}).search || {}).required
        //                                                   && cv.field === conditionValue.field).length <= 1;
        //                                       })()}/>
        //         </Form.Item>
        //     ));
        // }

        const getFields = (fields, {add, remove}) => {
            const conditionType = this.props.conditionType || "data-type";

            const existingUniqueFields = fields
                .map(f => f.value)
                .filter(f => f !== undefined && this.cannotBeUsed(f));

            return (
                <>
                    {fields.map((field, i) => {
                        const fieldSchema = field && conditionType === "data-type"
                            ? this.getDataTypeFieldSchema(
                                (this.form.current.getFieldValue("conditions")[i] || {}).field)
                            : {search: {...DEFAULT_SEARCH_PARAMETERS}};

                        return (
                            <Form.Item {...field}
                                       labelCol={{lg: {span: 24}, xl: {span: 4}, xxl: {span: 3}}}
                                       wrapperCol={{lg: {span: 24}, xl: {span: 20}, xxl: {span: 18}}}
                                       label={`Condition ${i + 1}`}
                                       help={fieldSchema.description || undefined}
                                       validateTrigger={false}
                                       rules={CONDITION_RULES}>
                                <DiscoverySearchCondition conditionType={conditionType}
                                                          dataType={this.props.dataType}
                                                          isExcluded={f => existingUniqueFields.includes(f)
                                                              || this.isNotPublic(f)}
                                                          onRemoveClick={() => remove(field.name)}
                                                          removeDisabled={(() => {
                                                              if (this.props.conditionType === "join") return false;
                                                              if (fields.length <= 1) return true;

                                                              // If no field has been selected, it's removable
                                                              if (!field.value || !field.value.field) return false;

                                                              return fields.map(f => f.value)
                                                                  .filter(cv => ((cv.fieldSchema || {}).search
                                                                      || {}).required && cv.field === field.value.field
                                                                  ).length <= 1;
                                                          })()}/>
                            </Form.Item>
                        )
                    })}
                    <Form.Item wrapperCol={{
                        xl: {span: 24},
                        xxl: {offset: 3, span: 18}
                    }}>
                        <Button type="dashed" onClick={() => add()} style={{width: "100%"}}>
                            <PlusOutlined /> Add condition
                        </Button>
                    </Form.Item>
                </>
            );
        };

        return (
            <Form ref={this.form}
                  onFieldsChange={(_, allFields) => this.props.onChange({...allFields})}
                  // mapPropsToFields={({formValues}) => ({
                  //     keys: Form.createFormField({...formValues.keys}),
                  //     ...Object.assign({}, ...(formValues["conditions"] || [])
                  //         .filter(c => c !== null)  // TODO: Why does this happen?
                  //         .map(c => ({[c.name]: Form.createFormField({...c})})))
                  // })}
                  onFinish={this.onFinish}
                  initialValues={this.initialValues}>
                <Form.List name="conditions">{getFields}</Form.List>
            </Form>
        );
    }
}

DiscoverySearchForm.propTypes = {
    conditionType: PropTypes.oneOf(["data-type", "join"]),
    dataType: PropTypes.object,  // TODO: Shape?
    // TODO
};

export default DiscoverySearchForm;
