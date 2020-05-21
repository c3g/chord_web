import React, {Component} from "react";

import {Layout, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerAccessContent extends Component {
    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={2}>Access Management</Typography.Title>
            </Layout.Content>
        </Layout>;
    }
}

export default ManagerAccessContent;
