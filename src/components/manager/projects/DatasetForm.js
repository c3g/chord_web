import React, {Component} from "react";

import {Form, Input} from "antd";

import "antd/es/form/style/css";
import "antd/es/input/style/css";


class DatasetForm extends Component {
    render() {
        return (
            <Form style={this.props.style || {}}>
                <Form.Item label="Title">
                    {this.props.form.getFieldDecorator("title", {
                        initialValue: (this.props.initialValue || {title: ""}).title || "",
                        rules: [{required: true}]
                    })(<Input placeholder="My Dataset" size="large" />)}
                </Form.Item>
                <Form.Item label="Description">
                    {this.props.form.getFieldDecorator("description", {
                        initialValue: (this.props.initialValue || {description: ""}).description || "",
                        rules: [{required: true}]
                    })(<Input.TextArea placeholder="This is a dataset" />)}
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({name: "dataset_form"})(DatasetForm);
