import React, {Component} from "react";

import {Button, Form, Icon, Input, Select} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";

import DiscoverySearchCondition from "./DiscoverySearchCondition";

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
                {this.props.form.getFieldDecorator(`conditions[${k}]`, {
                    initialValue: {
                        searchField: undefined,
                        negation: "pos",
                        condition: "eq",
                        searchValue: ""
                    }
                })(<DiscoverySearchCondition dataset={this.props.dataset}
                                             onRemoveClick={() => this.removeCondition.bind(this)(k)}
                                             removeDisabled={keys.length <= 1}/>)}
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
