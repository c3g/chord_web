import React, {Component} from "react";
import {connect} from "react-redux";

import {Form, Input, Select} from "antd";
import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

// TODO: Load available data types from store

class TableForm extends Component {
    render() {
        const dataTypeOptions = this.props.dataTypes.map(dts => (
            <Select.Option key={`${dts.a}:${dts.dt.id}`}>{dts.dt.id}</Select.Option>
        ));

        return (
            <Form style={this.props.style || {}} initialValues={this.props.initialValue} layout="vertical">
                <Form.Item label="Name" name="name" rules={[{required: true}, {min: 3}]}>
                    <Input placeholder="My Variant Dataset" size="large" />
                </Form.Item>
                <Form.Item label="Data Type" name="dataType" rules={[{required: true}]}>
                    <Select style={{width: "100%"}}>{dataTypeOptions}</Select>
                </Form.Item>
            </Form>
        );
    }
}

const mapStateToProps = state => ({
    dataTypes: Object.entries(state.serviceDataTypes.dataTypesByServiceArtifact)
        .filter(([a, _]) => (state.chordServices.itemsByArtifact[a] || {manageable_tables: false}).manageable_tables)
        .flatMap(([a, dts]) => (dts.items || []).map(dt => ({dt, a})))
});

export default connect(mapStateToProps, null, null, {forwardRef: true})(TableForm);
