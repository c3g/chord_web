import React, {Component} from "react";

import {Button, Form, Icon, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

import SchemaTreeSelect from "../SchemaTreeSelect";

let conditionID = 0;

class DiscoverySearchForm extends Component {
    componentDidMount() {
        this.addCondition(); // Make sure there's one condition at least
    }

    removeCondition(k) {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").filter(key => key !== k)
        });
    }

    addCondition() {
        this.props.form.setFieldsValue({
            keys: this.props.form.getFieldValue("keys").concat(conditionID++)
        });
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            console.log(values);
        })
    }

    render() {
        this.props.form.getFieldDecorator("keys", {initialValue: []}); // Initialize keys if needed
        const keys = this.props.form.getFieldValue("keys");
        const formItems = keys.map((k, i) => (
            <Form.Item key={k} labelCol={{
                lg: {span: 24},
                xl: {span: 4},
                xxl: {span: 3}
            }} wrapperCol={{
                lg: {span: 24},
                xl: {span: 20},
                xxl: {span: 21}
            }} label={`Condition ${i+1}`}>
                <Input.Group compact>
                    {this.props.form.getFieldDecorator(`searchField[${k}]`, {validateTrigger: ["onChange"]})(
                        <SchemaTreeSelect style={{
                            width: "256px",
                            float: "left",
                            borderTopRightRadius: "0",
                            borderBottomRightRadius: "0"
                        }} schema={this.props.dataset.schema} />
                    )}
                    {this.props.form.getFieldDecorator(`negation[${k}]`, {initialValue: "pos"})(
                        <Select style={{width: "88px", float: "left"}}>
                            <Select.Option key="pos">is</Select.Option>
                            <Select.Option key="neg">is not</Select.Option>
                        </Select>
                    )}
                    {this.props.form.getFieldDecorator(`operator[${k}]`, {initialValue: "eq"})(
                        <Select style={{width: "116px", float: "left"}}>
                            <Select.Option key="eq">=</Select.Option>
                            <Select.Option key="lt">&lt;</Select.Option>
                            <Select.Option key="le">&le;</Select.Option>
                            <Select.Option key="gt">&gt;</Select.Option>
                            <Select.Option key="ge">&ge;</Select.Option>
                            <Select.Option key="co">containing</Select.Option>
                        </Select>
                    )}
                    {this.props.form.getFieldDecorator(`value[${k}]`, {initialValue: ""})(
                        <Input style={{width: `calc(100% - 510px)`}} placeholder="value" />
                    )}
                    <Button type="danger" style={{width: "50px"}} disabled={keys.length <= 1}
                            onClick={() => this.removeCondition.bind(this)(k)}>
                        <Icon type="close" />
                    </Button>
                </Input.Group>
            </Form.Item>
        ));

        return (
            <Form onSubmit={this.onSubmit.bind(this)}>
                {formItems}
                <Form.Item wrapperCol={{
                    xl: {span: 24},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="dashed" onClick={this.addCondition.bind(this)} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add condition
                    </Button>
                </Form.Item>
                <Form.Item wrapperCol={{
                    lg: {span: 24},
                    xl: {offset: 5, span: 14},
                    xxl: {offset: 3, span: 18}
                }}>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({name: "discovery_search_form"})(DiscoverySearchForm);
