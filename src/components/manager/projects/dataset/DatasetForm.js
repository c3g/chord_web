import React, {Component} from "react";

import {Form, Input} from "antd";
import "antd/es/form/style/css";
import "antd/es/input/style/css";

import DataUseInput from "../../../DataUseInput";

import {INITIAL_DATA_USE_VALUE} from "../../../../duo";
import {simpleDeepCopy} from "../../../../utils";


class DatasetForm extends Component {
    render() {
        const initialValues = {
            ...(this.props.initialValue || {}),
            data_use: ((this.props.initialValue || {data_use: simpleDeepCopy(INITIAL_DATA_USE_VALUE)}).data_use ||
                simpleDeepCopy(INITIAL_DATA_USE_VALUE))
        };

        return (
            <Form style={this.props.style || {}} initialValues={initialValues} layout="vertical">
                <Form.Item label="Title" name="title" rules={[{required: true}, {min: 3}]}>
                    <Input placeholder="My Dataset" size="large" />
                </Form.Item>
                <Form.Item label="Description" name="description" rules={[{required: true}]}>
                    <Input.TextArea placeholder="This is a dataset" />
                </Form.Item>
                <Form.Item label="Contact Information" name="contact_info">
                    <Input.TextArea placeholder={"David Lougheed\ndavid.lougheed@mail.mcgill.ca"} />
                </Form.Item>
                <Form.Item label="Consent Code and Data Use Requirements" name="data_use" rules={[
                    {required: true},
                    (rule, value, callback) => {
                        if (!(value.consent_code || {}).primary_category) {
                            callback(["Please specify one primary consent code"]);
                            return;
                        }
                        callback([]);
                    }
                ]}>
                    <DataUseInput />
                </Form.Item>
            </Form>
        );
    }
}

export default DatasetForm;
