import React, {Component} from "react";
import {connect} from "react-redux";

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
        // TODO: support directories as well
        const files = this.props.files.map(f => <Tree.TreeNode title={f} key={f} isLeaf={true} />);
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
                        <Tree.TreeNode title="chord_drop_box" key="root">{files}</Tree.TreeNode>
                    </Tree.DirectoryTree>
                </Layout.Content>
            </Layout>
        );
    }
}

const mapStateToProps = state => ({
    files: state.dropBox.tree
});

export default connect(mapStateToProps)(ManagerFilesIngestionContent);
