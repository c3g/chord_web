import React, {Component} from "react";

import {Form, Input} from "antd";
import "antd/es/input/style/css";
import "antd/es/form/style/css";

class ProjectForm extends Component {
    // TODO: Unique name check
    render() {
        return (
            <Form style={this.props.style || {}} initialValues={this.props.initialValue} layout="vertical">
                <Form.Item label="Title" name="title" rules={[{required: true}, {min: 3}]}>
                    <Input placeholder="My Health Data Project" size="large" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input.TextArea placeholder="Description" rows={3} />
                </Form.Item>
            </Form>
        );
    }
}

export default ProjectForm;
