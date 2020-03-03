import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Form, Input} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/input/style/css";

import {CloseOutlined, PlusOutlined} from "@ant-design/icons";

import SchemaTreeSelect from "../../../../schema_trees/SchemaTreeSelect";
import {FORM_MODE_EDIT, propTypesFormMode} from "../../../../../utils";
import {getFieldSchema} from "../../../../../schema";

const FIELD_KEYS = "fieldKeys";
let fieldKey = 0;

class LinkedFieldSetForm extends Component {
    constructor(props) {
        super(props);
        this.syncForm = this.syncForm.bind(this);
        this.rootSchema = this.rootSchema.bind(this);

        this.form = React.createRef();
    }

    syncForm(prevProps={}) {
        if (JSON.stringify(prevProps.initialValue || {}) !==
                JSON.stringify(this.props.initialValue || {}) && this.props.mode === FORM_MODE_EDIT) {
            const initialValueObj = this.props.initialValue || {};
            fieldKey = Object.entries(initialValueObj.fields || {}).length;

            // this.form.current.getFieldDecorator("name", {initialValue: initialValueObj.name || ""});
            this.form.current.setFieldsValue({[FIELD_KEYS]: [...(new Array(fieldKey)).keys()]});

            const rootSchema = this.rootSchema();

            Object.entries(initialValueObj.fields || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([dt, f], i) => {
                    const selected = `[dataset item].${dt}.[item].${f.join(".")}`;
                    try {
                        this.form.current.setFieldsValue({
                            [`fields[${i}]`]: {selected, schema: getFieldSchema(rootSchema, selected)}
                        })
                        // this.props.form.getFieldDecorator(`fields[${i}]`, {
                        //     initialValue: {selected, schema: getFieldSchema(rootSchema, selected)}
                        // });
                    } catch {
                        // Possibly invalid field (due to migration / data model change), skip it.
                        console.log(`Encountered invalid field: ${selected}`);
                    }
                });

            // TODO: Shouldn't need these
            this.forceUpdate();
        }
    }

    componentDidMount() {
        this.syncForm();
    }

    componentDidUpdate(prevProps) {
        this.syncForm(prevProps);
    }

    rootSchema() {
        return {
            "type": "object",
            "properties": Object.fromEntries(Object.entries(this.props.dataTypes).map(([k, v]) => [k, {
                "type": "array",
                "items": v.schema
            }]))
        };
    }

    render() {
        const joinedSchema = this.rootSchema();

        // TODO: isExcluded

        return (
            <Form ref={this.form} layout="vertical" initialValues={{
                fields: [{selected: null, schema: null}, {selected: null, schema: null}],
                ...(this.props.initialValue || {}),
            }}>
                <Form.Item label="Name" name="name" rules={[{required: true}, {min: 3}]}>
                    <Input placeholder="Sample IDs" />
                </Form.Item>
                <Form.List name="fields">
                    {(fields, {add, remove}) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item {...field} required={index < 2} label={`Field ${index + 1}`}>
                                    <Input.Group compact={true}
                                                 rules={[{required: true, message: "Please specify a field"}]}>
                                        <SchemaTreeSelect schema={joinedSchema} style={{width: "calc(100% - 33px)"}} />
                                        <Button icon={<CloseOutlined />}
                                                danger={true}
                                                disabled={index < 2}
                                                onClick={() => remove(field.name)} />
                                    </Input.Group>
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block={true}>
                                    <PlusOutlined /> Add Linked Field
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        );
    }
}

LinkedFieldSetForm.propTypes = {
    mode: propTypesFormMode,
    dataTypes: PropTypes.objectOf(PropTypes.object),
    initialValue: PropTypes.shape({
        name: PropTypes.string,
        fields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
};

export default LinkedFieldSetForm;
