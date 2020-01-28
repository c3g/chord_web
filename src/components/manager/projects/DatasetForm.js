import React, {Component} from "react";

import {Form, Input} from "antd";

import "antd/es/form/style/css";
import "antd/es/input/style/css";

import DataUseInput from "../../DataUseInput";

import {INITIAL_DATA_USE_VALUE} from "../../../duo";
import {simpleDeepCopy} from "../../../utils";


class DatasetForm extends Component {
    render() {
        return (
            <Form style={this.props.style || {}}>
                <Form.Item label="Title">
                    {this.props.form.getFieldDecorator("title", {
                        initialValue: (this.props.initialValue || {title: ""}).title || "",
                        rules: [{required: true}, {min: 3}]
                    })(<Input placeholder="My Dataset" size="large" />)}
                </Form.Item>
                <Form.Item label="Description">
                    {this.props.form.getFieldDecorator("description", {
                        initialValue: (this.props.initialValue || {description: ""}).description || "",
                        rules: [{required: true}]
                    })(<Input.TextArea placeholder="This is a dataset" />)}
                </Form.Item>
                <Form.Item label="Contact Information">
                    {this.props.form.getFieldDecorator("contact_info", {
                        initialValue: (this.props.initialValue || {contact_info: ""}).contact_info || "",
                    })(<Input.TextArea placeholder={"David Lougheed\ndavid.lougheed@mail.mcgill.ca"} />)}
                </Form.Item>
                <Form.Item label="Consent Code and Data Use Requirements">
                    {this.props.form.getFieldDecorator("data_use", {
                        initialValue: ((this.props.initialValue ||
                            {data_use: simpleDeepCopy(INITIAL_DATA_USE_VALUE)}).data_use ||
                            simpleDeepCopy(INITIAL_DATA_USE_VALUE)),
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

export default Form.create({name: "dataset_form"})(DatasetForm);
