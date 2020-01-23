import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Form, Icon, Input} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";

import SchemaTreeSelect from "../../SchemaTreeSelect";

const FIELD_KEYS = "fieldKeys";
let fieldKey = 0;

class LinkedFieldSetForm extends Component {
    constructor(props) {
        super(props);
        this.addField = this.addField.bind(this);
        this.removeField = this.removeField.bind(this);
    }

    addField() {
        this.props.form.setFieldsValue({[FIELD_KEYS]: [...this.props.form.getFieldValue(FIELD_KEYS), fieldKey++]});
    }

    removeField(key) {
        this.props.form.setFieldsValue({[FIELD_KEYS]: this.props.form.getFieldValue(FIELD_KEYS)
                .filter(k => k !== key)});
    }

    componentDidMount() {
        // TODO: If mode === add
        this.addField();
        this.addField();
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        const joinedSchema = {
            "type": "object",
            "properties": Object.fromEntries(Object.entries(this.props.dataTypes).map(([k, v]) => [k, {
                "type": "array",
                "items": v.schema
            }]))
        };

        // TODO: isExcluded
        // Initialize fieldKeys if needed  TODO: do this once?
        getFieldDecorator("fieldKeys", {initialValue: []});
        const fieldItems = getFieldValue(FIELD_KEYS).map((k, i) => (
            <Form.Item required={i < 2} key={k} label={`Field ${i+1}`}>
                <Input.Group compact={true}>
                    {getFieldDecorator(`fields[${k}]`, {
                        rules: [{required: true, message: "Please specify a field"}]
                    })(<SchemaTreeSelect schema={joinedSchema} style={{width: "calc(100% - 33px)"}} /> )}
                    <Button icon="close" type="danger" disabled={i < 2} onClick={() => this.removeField(k)} />
                </Input.Group>
            </Form.Item>
        ));

        return (
            <Form>
                <Form.Item label="Name">
                    {getFieldDecorator("name", {
                        rules: [{required: true}, {min: 3}]
                    })(<Input placeholder="Sample IDs" />)}
                </Form.Item>
                {fieldItems}
                <Form.Item>
                    <Button type="dashed" onClick={() => this.addField()} block={true}>
                        <Icon type="plus" /> Add Linked Field
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

LinkedFieldSetForm.propTypes = {
    dataTypes: PropTypes.object,
};

export default Form.create({name: "linked_field_set_form"})(LinkedFieldSetForm);
