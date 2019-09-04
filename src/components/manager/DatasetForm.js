import React, {Component} from "react";

import {Form, Input, Select} from "antd";

import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

// TODO: Load available data types from store

class DatasetForm extends Component {
    render() {
        return (
            <Form style={this.props.style || {}}>
                <Form.Item label="Name">
                    {this.props.form.getFieldDecorator("name", {
                        initialValue: (this.props.initialValue || {name: ""}).name || "",
                        rules: [{required: true}]
                    })(
                        <Input placeholder="My Variant Dataset" size="large" />
                    )}
                </Form.Item>
                <Form.Item label="Data Type">
                    {this.props.form.getFieldDecorator("dataType", {
                        initialValue: (this.props.initialValue || {dataType: null}).dataType || null,
                        rules: [{required: true}]
                    })(

                        <Select style={{width: "100%"}} />
                    )}
                </Form.Item>
                TODO: File ingestion here?
            </Form>
        );
    }
}

export default Form.create({name: "dataset_form"})(DatasetForm);
