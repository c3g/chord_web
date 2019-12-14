import React, {Component} from "react";

import {Input, Form} from "antd";

import "antd/es/input/style/css";
import "antd/es/form/style/css";

class ProjectForm extends Component {
    // TODO: Unique name check
    render() {
        return (
            <Form style={this.props.style || {}}>
                <Form.Item label="Title">
                    {this.props.form.getFieldDecorator("title", {
                        initialValue: (this.props.initialValue || {title: ""}).title || "",
                        rules: [{required: true}, {min: 3}]
                    })(<Input placeholder="My Health Data Project" size="large" />)}
                </Form.Item>
                <Form.Item label="Description">
                    {this.props.form.getFieldDecorator("description", {
                        initialValue: (this.props.initialValue || {description: ""}).description || ""
                    })(<Input.TextArea placeholder="Description" rows={3} />)}
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({name: "project_form"})(ProjectForm);
