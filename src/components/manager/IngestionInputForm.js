import React, {Component} from "react";

import {Button, Form, Input, Select, TreeSelect} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/tree-select/style/css";

import {LeftOutlined, RightOutlined} from "@ant-design/icons";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL
} from "./ingestion";

import {nop} from "../../utils";


const sortByName = (a, b) => a.name.localeCompare(b.name);
const generateFileTree = (directory, valid) => [...directory].sort(sortByName).map(entry =>
    <TreeSelect.TreeNode title={entry.name} key={entry.path} value={entry.path} disabled={!valid(entry)}
                         isLeaf={!entry.hasOwnProperty("contents")}
                         selectable={!entry.hasOwnProperty("contents")}>
        {(entry || {contents: []}).contents ? generateFileTree(entry.contents, valid) : null}
    </TreeSelect.TreeNode>);

class IngestionInputForm extends Component {
    constructor(props) {
        super(props);
        this.handleFinish = this.handleFinish.bind(this);
        this.getInputComponent = this.getInputComponent.bind(this);

        this.form = React.createRef();
    }

    async handleFinish() {
        try {
            const values = await this.form.current.validateFields();
            (this.props.onSubmit || nop)(values);
        } catch (e) {
            console.error(e);
            // Ignore errors
        }
    }

    getInputComponent(input) {
        switch (input.type) {
            case "file":
            case "file[]":
                // TODO: What about non-unique files?
                return (
                    <TreeSelect showSearch={true} treeDefaultExpandAll={true} multiple={input.type === "file[]"}>
                        <TreeSelect.TreeNode title="chord_drop_box" key="root">
                            {generateFileTree(
                                this.props.tree,
                                entry => entry.hasOwnProperty("contents") ||
                                    input.extensions.find(e => entry.name.endsWith(e)) !== undefined
                            )}
                        </TreeSelect.TreeNode>
                    </TreeSelect>
                );

            case "enum":
                // TODO: enum[]
                return (
                    <Select>
                        {input.values.map(v => <Select.Option key={v}>{v}</Select.Option>)}
                    </Select>
                );

            case "number":
                return <Input type="number" />;

            // TODO: string[], enum[], number[]

            default:
                return <Input />;
        }
    }

    render() {
        return (
            <Form ref={this.form}
                  labelCol={FORM_LABEL_COL}
                  wrapperCol={FORM_WRAPPER_COL}
                  initialValues={this.props.initialValues}
                  rules={[{required: true}]}
                  onFieldsChange={(_, allFields) => (this.props.onChange || nop)({...allFields})}
                  onFinish={this.handleFinish}>
                {[
                    ...this.props.workflow.inputs.map(i => (
                        <Form.Item label={i.id} key={i.id} name={i.id}>{this.getInputComponent(i)}</Form.Item>
                    )),

                    <Form.Item key="_submit" wrapperCol={FORM_BUTTON_COL}>
                        {this.props.onBack
                            ? <Button icon={<LeftOutlined />} onClick={() => this.props.onBack()}>Back</Button>
                            : null}
                        <Button type="primary" htmlType="submit" style={{float: "right"}}>
                            Next <RightOutlined />
                        </Button>
                    </Form.Item>
                ]}
            </Form>
        );
    }
}

export default IngestionInputForm;
