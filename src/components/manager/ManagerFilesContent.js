import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Dropdown, Icon, Layout, Menu, Spin, Tree} from "antd";

import "antd/es/button/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/spin/style/css";
import "antd/es/tree/style/css";

import {
    dropBoxTreeStateToPropsMixin,
    dropBoxTreeStateToPropsMixinPropTypes,

    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../utils";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

const generateFileTree = directory => directory.map(entry =>
    <Tree.TreeNode title={entry.name} key={entry.path} isLeaf={!entry.hasOwnProperty("contents")}>
        {(entry || {contents: []}).contents ? generateFileTree(entry.contents) : null}
    </Tree.TreeNode>);

class ManagerFilesContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: []
        };

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(keys) {
        this.setState({selectedFiles: keys.filter(k => k !== "root")});
    }

    render() {
        // TODO: Loading for workflows...
        // TODO: Proper workflow keys

        let oneWorkflowSupported = false;

        const workflowMenu = (
            <Menu>
                {this.props.workflows.map(w => {
                    // TODO: Extend to multiple files by checking all file inputs are matched
                    // TODO: Match greedily

                    let workflowSupported = true;
                    let files = [...this.state.selectedFiles];

                    for (let i of w.inputs.filter(i => i.type === "file")) {
                        // Find files where 1+ of the valid extensions (e.g. jpeg or jpg) match.
                        const compatibleFiles = files.filter(f => !!i.extensions.find(e => f.endsWith(e)));
                        if (compatibleFiles.length === 0) {
                            workflowSupported = false;
                            break;
                        }

                        files = files.filter(f => f !== compatibleFiles[0]);  // Steal the first compatible file
                    }

                    if (files.length > 0) {
                        // If there are unclaimed files remaining at the end, the workflow is not compatible with the
                        // total selection of files.
                        workflowSupported = false;
                    }

                    oneWorkflowSupported = oneWorkflowSupported || workflowSupported;

                    return (
                        <Menu.Item key={w.id} disabled={!workflowSupported}>
                            Ingest with Workflow "{w.name}"
                        </Menu.Item>
                    );
                })}
            </Menu>
        );

        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <div style={{marginBottom: "1em"}}>
                        <Dropdown.Button overlay={workflowMenu} style={{marginRight: "10px"}}
                                         disabled={this.state.selectedFiles.length === 0 || !oneWorkflowSupported}>
                            <Icon type="import" /> Ingest
                        </Dropdown.Button>
                        <Button type="danger" icon="delete" disabled={this.state.selectedFiles.length === 0}>
                            Delete
                        </Button>
                        <Button type="primary" icon="upload" style={{float: "right"}}>Upload</Button>
                    </div>
                    <Spin spinning={this.props.treeLoading}>
                        <Tree.DirectoryTree defaultExpandAll={true} multiple={true} onSelect={this.handleSelect}
                                            selectedKeys={this.state.selectedFiles}>
                            <Tree.TreeNode title="chord_drop_box" key="root">
                                {generateFileTree(this.props.tree)}
                            </Tree.TreeNode>
                        </Tree.DirectoryTree>
                    </Spin>
                </Layout.Content>
            </Layout>
        );
    }
}

ManagerFilesContent.propTypes = {
    ...dropBoxTreeStateToPropsMixinPropTypes,
    ...workflowsStateToPropsMixinPropTypes
};

const mapStateToProps = state => ({
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state)
});

export default connect(mapStateToProps)(ManagerFilesContent);
