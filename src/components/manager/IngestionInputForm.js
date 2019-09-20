import React, {Component} from "react";

import {Button, Form, Icon, Input, Select, Tree, TreeSelect} from "antd";

import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/tree-select/style/css";

const generateFileTree = (directory, valid) => directory.map(entry =>
    <TreeSelect.TreeNode title={entry.name} key={entry.path} value={entry.path} disabled={!valid(entry)}
                         isLeaf={!entry.hasOwnProperty("contents")}
                         selectable={!entry.hasOwnProperty("contents")}>
        {(entry || {contents: []}).contents ? generateFileTree(entry.contents, valid) : null}
    </TreeSelect.TreeNode>);

class IngestionInputForm extends Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.props.onSubmit || (() => {});
        this.onBack = this.props.onBack || null;
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getInputComponent = this.getInputComponent.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            this.onSubmit(values);
        })
    }

    getInputComponent(input) {
        let inputComponent = <Input />;

        switch (input.type) {
            case "file":
                inputComponent = (
                    <TreeSelect showSearch={true} treeDefaultExpandAll={true}>
                        <TreeSelect.TreeNode title="chord_drop_box" key="root">
                            {generateFileTree(
                                this.props.tree,
                                entry => entry.hasOwnProperty("contents") ||
                                    input.extensions.find(e => entry.name.endsWith(e)) !== undefined
                            )}
                        </TreeSelect.TreeNode>
                    </TreeSelect>
                );
                break;

            case "enum":
                inputComponent = (
                    <Select>
                        {input.values.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                    </Select>
                );
                break;

            case "number":
                inputComponent = <Input type="number"/>;
                break;
        }

        return inputComponent;
    }

    render() {
        return (
            <Form labelCol={{md: {span: 24}, lg: {span: 4}, xl: {span: 6}, xxl: {span: 8}}}
                  wrapperCol={{md: {span: 24}, lg: {span: 16}, xl: {span: 12}, xxl: {span: 8}}}
                  onSubmit={this.handleSubmit}>
                {[
                    ...this.props.workflow.inputs.map(i => (
                        <Form.Item label={i.id} key={i.id}>
                            {this.props.form.getFieldDecorator(i.id, {
                                rules: [{required: true}]
                            })(this.getInputComponent(i))}
                        </Form.Item>
                    )),

                    <Form.Item key="_submit" wrapperCol={{
                        md: {span: 24},
                        lg: {offset: 4, span: 16},
                        xl: {offset: 6, span: 12},
                        xxl: {offset: 8, span: 8}
                    }}>
                        {this.onBack ? <Button icon="left" onClick={() => this.onBack()}>Back</Button> : null}
                        <Button type="primary" htmlType="submit" style={{float: "right"}}>
                            Next <Icon type="right" />
                        </Button>
                    </Form.Item>
                ]}
            </Form>
        );
    }
}

export default Form.create({
    name: "ingestion_input_form",
    mapPropsToFields: ({workflow, formValues}) => {
        const fields = {};
        workflow.inputs.forEach(i => {
            fields[i.id] = Form.createFormField({...formValues[i.id]});
        });
        return fields;
    },
    onFieldsChange: ({onChange}, _, allFields) => {
        onChange({...allFields});
    }
})(IngestionInputForm);
