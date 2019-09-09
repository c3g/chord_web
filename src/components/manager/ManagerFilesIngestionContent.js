import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Dropdown, Icon, Layout, Menu, Tree} from "antd";

import "antd/es/button/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/tree/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerFilesIngestionContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFile: null
        };

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(keys) {
        if (keys.includes("root")) {
            this.setState({selectedFile: null});
            return;
        }

        this.setState({selectedFile: keys[0] || null});
    }

    render() {
        // TODO: Loading for workflows...
        // TODO: Proper workflow keys

        let oneWorkflowSupported = false;

        const workflowMenu = (
            <Menu>
                {this.props.workflows.map(w => {
                    // TODO: Extend to multiple files by checking all file inputs are matched

                    const workflowSupported = w.inputs
                        .filter(i => i.type === "file")
                        .filter(i => i.extensions
                            .filter(e => this.state.selectedFile && this.state.selectedFile.endsWith(e)).length > 0)
                        .length > 0;

                    oneWorkflowSupported = oneWorkflowSupported || workflowSupported;

                    return (
                        <Menu.Item key={w.name} disabled={!workflowSupported}>
                            Ingest with Workflow "{w.name}"
                        </Menu.Item>
                    );
                })}
            </Menu>
        );

        // TODO: support directories as well
        // TODO: Loading for files...
        const files = this.props.files.map(f => <Tree.TreeNode title={f} key={f} isLeaf={true} />);

        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <div style={{marginBottom: "1em"}}>
                        <Dropdown.Button overlay={workflowMenu} style={{marginRight: "10px"}}
                                         disabled={!this.state.selectedFile || !oneWorkflowSupported}>
                            <Icon type="import" /> Ingest
                        </Dropdown.Button>
                        <Button type="danger" icon="delete" disabled={!this.state.selectedFile}>Delete</Button>
                        <Button type="primary" icon="upload" style={{float: "right"}}>Upload</Button>
                    </div>
                    <Tree.DirectoryTree defaultExpandAll={true} onSelect={this.handleSelect}
                                        selectedKeys={this.state.selectedFile ? [this.state.selectedFile] : []}>
                        <Tree.TreeNode title="chord_drop_box" key="root">{files}</Tree.TreeNode>
                    </Tree.DirectoryTree>
                </Layout.Content>
            </Layout>
        );
    }
}

const mapStateToProps = state => ({
    files: state.dropBox.tree,
    workflows: Object.values(state.serviceWorkflows.workflowsByServiceID)
        .filter(s => !s.isFetching)
        .flatMap(s => Object.values(s.workflows.ingestion))
});

export default connect(mapStateToProps)(ManagerFilesIngestionContent);
