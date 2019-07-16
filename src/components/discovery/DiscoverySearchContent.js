import React, {Component} from "react";

import {Button, Form, Input, Select, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/form/style/css";
import "antd/es/input/style/css";
import "antd/es/select/style/css";
import "antd/es/typography/style/css";

import SchemaTreeSelect from "../SchemaTreeSelect";

class DiscoverySchemaContent extends Component {
    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset {this.props.dataset.id}</Typography.Title>

                <Form>
                    <Form.Item labelCol={{
                        lg: {span: 24},
                        xl: {span: 4}
                    }} wrapperCol={{
                        lg: {span: 24},
                        xl: {span: 20}
                    }} label="Search Condition">
                        <Input.Group compact>
                            <SchemaTreeSelect style={{
                                width: "288px",
                                float: "left",
                                borderTopRightRadius: "0",
                                borderBottomRightRadius: "0"
                            }} schema={this.props.dataset.schema} />
                            <Select style={{width: "128px", float: "left"}}>
                                <Select.Option key="equals">equals</Select.Option>
                            </Select>
                            <Input style={{width: "calc(100% - 416px)"}} placeholder="value" />
                        </Input.Group>
                    </Form.Item>
                    <Form.Item wrapperCol={{
                        lg: {span: 24},
                        xl: {offset: 4, span: 20}
                    }}>
                        <Button type="primary" htmlType="submit">
                            Search
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        ) : (<div>Loading...</div>);
    }
}

export default DiscoverySchemaContent;
