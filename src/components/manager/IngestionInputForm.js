import React, {Component} from "react";

import {Form, Input, Select, TreeSelect} from "antd";

import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/tree-select/style/css";

class IngestionInputForm extends Component {
    render() {
        const formContents = this.props.workflow.inputs.map(i => {
            let inputComponent = (<Input/>);

            switch (i.type) {
                case "file":
                    const files = this.props.tree.map(f =>
                        <TreeSelect.TreeNode title={f} key={f} value={f} isLeaf={true}/>);
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

        return (<Form>{formContents}</Form>);
    }
}

export default Form.create({name: "ingestion_input_form"})(IngestionInputForm);
