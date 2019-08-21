import React, {Component} from "react";

import {Button, Input, Form} from "antd";

import "antd/es/button/style/css";
import "antd/es/input/style/css";
import "antd/es/form/style/css";

class ProjectCreationForm extends Component {
    // TODO: Unique name check
    render() {
        return (
            <Form>
                <Form.Item label="Name">
                    {this.props.form.getFieldDecorator("name", {rules: [{required: true}]})(
                        <Input placeholder="My Health Data Project" />
                    )}
                </Form.Item>
                <Form.Item label="Description">
                    {this.props.form.getFieldDecorator("description")(
                        <Input.TextArea placeholder="Description" rows={3} />
                    )}
                </Form.Item>
                <Form.Item label="Consent Code and Data Use Requirements">
                    TODO: Data use / consent code input
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({name: "project_creation_form"})(ProjectCreationForm);
