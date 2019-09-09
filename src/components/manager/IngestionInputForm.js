import React, {Component} from "react";

import {Button, Form, Icon, Input, Select, TreeSelect} from "antd";

import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/tree-select/style/css";

class IngestionInputForm extends Component {
    render() {
        let formContents = this.props.workflow.inputs.map(i => {
            let inputComponent = (<Input/>);

            switch (i.type) {
                case "file":
                    const files = this.props.tree
                        .filter(f => i.extensions.find(e => f.endsWith(e)))
                        .map(f => <TreeSelect.TreeNode title={f} key={f} value={f} isLeaf={true}/>);
                    inputComponent = (
                        <TreeSelect showSearch={true} treeDefaultExpandAll={true}>
                            <TreeSelect.TreeNode title="chord_drop_box" key="root">{files}</TreeSelect.TreeNode>
                        </TreeSelect>
                    );
                    break;

                case "enum":
                    inputComponent = (
                        <Select>
                            {i.values.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                        </Select>
                    );
                    break;

                case "number":
                    inputComponent = (<Input type="number"/>);
                    break;
            }

            return (
                <Form.Item label={i.id} key={i.id}>
                    {this.props.form.getFieldDecorator(i.id, {
                        rules: [{required: true}]
                    })(inputComponent)}
                </Form.Item>
            );
        });

        formContents.push(
            <Form.Item key="_submit" wrapperCol={{
                md: {span: 24},
                lg: {offset: 4, span: 16},
                xl: {offset: 8, span: 8}
            }}>
                <Button type="primary">
                    Next
                    <Icon type="right" />
                </Button>
            </Form.Item>
        );

        return (<Form labelCol={{md: {span: 24}, lg: {span: 4}, xl: {span: 8}}}
                      wrapperCol={{md: {span: 24}, lg: {span: 16}, xl: {span: 8}}}>{formContents}</Form>);
    }
}

export default Form.create({name: "ingestion_input_form"})(IngestionInputForm);
