import React, {Component} from "react";

import {Button, Dropdown, Icon, Layout, Menu, Tree} from "antd";

import "antd/es/button/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/tree/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

const menu = (
    <Menu>
        <Menu.Item key="1">
            Ingest with Workflow 1
        </Menu.Item>
    </Menu>
);

class ManagerFilesIngestionContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <div style={{marginBottom: "1em"}}>
                        <Dropdown.Button overlay={menu} style={{marginRight: "10px"}}>
                            <Icon type="import" /> Ingest
                        </Dropdown.Button>
                        <Button type="danger" icon="delete">Delete</Button>
                        <Button type="primary" icon="upload" style={{float: "right"}}>Upload</Button>
                    </div>
                    <Tree.DirectoryTree defaultExpandAll={true}>
                        <Tree.TreeNode title="chord_drop_box" key="root">
                            <Tree.TreeNode title="file 1" key="file_1" isLeaf={true} />
                            <Tree.TreeNode title="file 2" key="file_2" isLeaf={true} />
                            <Tree.TreeNode title="file 3" key="file_3" isLeaf={true} />
                        </Tree.TreeNode>
                    </Tree.DirectoryTree>
                </Layout.Content>
            </Layout>
        );
    }
}

export default ManagerFilesIngestionContent;
