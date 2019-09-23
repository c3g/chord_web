import React, {Component} from "react";

import {Input, Form} from "antd";

import "antd/es/input/style/css";
import "antd/es/form/style/css";

import DataUseInput from "../../DataUseInput";

import {simpleDeepCopy} from "../../../utils";

const INITIAL_DATA_USE = {
    consent_code: {
        primary_category: null,
        secondary_categories: []
    },
    data_use_requirements: []
};

class ProjectForm extends Component {
    // TODO: Unique name check
    render() {
        return (
            <Form style={this.props.style || {}}>
                <Form.Item label="Name">
                    {this.props.form.getFieldDecorator("name", {
                        initialValue: (this.props.initialValue || {name: ""}).name || "",
                        rules: [{required: true}]
                    })(<Input placeholder="My Health Data Project" size="large" />)}
                </Form.Item>
                <Form.Item label="Description">
                    {this.props.form.getFieldDecorator("description", {
                        initialValue: (this.props.initialValue || {description: ""}).description || ""
                    })(<Input.TextArea placeholder="Description" rows={3} />)}
                </Form.Item>
                <Form.Item label="Consent Code and Data Use Requirements">
                    {this.props.form.getFieldDecorator("data_use", {
                        initialValue: ((this.props.initialValue ||
                            {data_use: simpleDeepCopy(INITIAL_DATA_USE)}).data_use || simpleDeepCopy(INITIAL_DATA_USE)),
                        rules: [{required: true}, (rule, value, callback) => {
                            if (!(value.consent_code || {}).primary_category) {
                                callback(["Please specify one primary consent code"]);
                                return;
                            }
                            callback([]);
                        }]
                    })(<DataUseInput />)}
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({name: "project_form"})(ProjectForm);
