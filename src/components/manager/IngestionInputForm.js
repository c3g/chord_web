import React, {Component} from "react";

import {Button, Form, Icon, Input, Select, TreeSelect} from "antd";

import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/icon/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/tree-select/style/css";

class IngestionInputForm extends Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.props.onSubmit || (() => {});
        this.onBack = this.props.onBack || null;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            this.onSubmit(values);
        })
    }

    render() {
        let formContents = this.props.workflow.inputs.map(i => {
            let inputComponent = (<Input/>);

            switch (i.type) {
                case "file":
                    const files = this.props.tree
                        .filter(f => i.extensions.find(e => f.name.endsWith(e)))
                        .map(f => <TreeSelect.TreeNode title={f.name} key={f.path} value={f.path} isLeaf={true} />);
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
                xl: {offset: 6, span: 12},
                xxl: {offset: 8, span: 8}
            }}>
                {this.onBack ? <Button icon="left" onClick={() => this.onBack()}>Back</Button> : null}
                <Button type="primary" htmlType="submit" style={{float: "right"}}>
                    Next
                    <Icon type="right" />
                </Button>
            </Form.Item>
        );

        return (
            <Form labelCol={{md: {span: 24}, lg: {span: 4}, xl: {span: 6}, xxl: {span: 8}}}
                  wrapperCol={{md: {span: 24}, lg: {span: 16}, xl: {span: 12}, xxl: {span: 8}}}
                  onSubmit={this.handleSubmit}>
                {formContents}
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