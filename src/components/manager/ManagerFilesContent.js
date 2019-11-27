import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import fetch from "cross-fetch";

import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import {a11yLight} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import {json, markdown, plaintext} from "react-syntax-highlighter/dist/cjs/languages/hljs";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);


const LANGUAGE_HIGHLIGHTERS = {
    ".json": "json",
    ".md": "markdown",
    ".txt": "plaintext",

    // Special files
    "README": "plaintext",
    "CHANGELOG": "plaintext",
};

import {Button, Dropdown, Icon, Layout, Menu, Modal, Spin, Tree} from "antd";

import "antd/es/button/style/css";
import "antd/es/dropdown/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
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

const resourceLoadError = resource => `An error was encountered while loading ${resource}`;

class ManagerFilesContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFiles: [],
            fileContents: {},
            fileContentsModal: false
        };

        this.handleSelect = this.handleSelect.bind(this);
        this.showFileContentsModal = this.showFileContentsModal.bind(this);
        this.hideFileContentsModal = this.hideFileContentsModal.bind(this);
        this.handleViewFile = this.handleViewFile.bind(this);
    }

    handleSelect(keys) {
        this.setState({selectedFiles: keys.filter(k => k !== "root")});
    }

    showFileContentsModal() {
        this.setState({fileContentsModal: true});
    }

    hideFileContentsModal() {
        this.setState({fileContentsModal: false});
    }

    async handleViewFile() {  // TODO: Action-ify?
        if (this.state.selectedFiles.length !== 1) return;
        const file = this.state.selectedFiles[0];
        if (this.state.fileContents.hasOwnProperty(file)) {
            this.showFileContentsModal();
            return;
        }

        try {
            // TODO: Auth / proper url stuff
            // TODO: Don't hard-code replace
            const r = await fetch(`${this.props.dropBoxService.url}/retrieve${
                file.replace("/chord/data/drop-box", "")}`);

            this.setState({
                fileContents: {
                    ...this.state.fileContents,
                    [file]: r.ok ? await r.text() : resourceLoadError(file)
                }
            });

            this.showFileContentsModal();
        } catch (e) {
            console.error(e);
            this.setState({
                fileContents: {
                    ...this.state.fileContents,
                    [file]: resourceLoadError(file)
                }
            });
        }
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

        const selectedFileViewable = this.state.selectedFiles.length === 1 &&
            Object.keys(LANGUAGE_HIGHLIGHTERS).filter(e => this.state.selectedFiles[0].endsWith(e)).length > 0;

        const selectedFile = selectedFileViewable ? this.state.selectedFiles[0] : "";

        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Modal visible={this.state.fileContentsModal}
                           title={selectedFile}
                           width={800}
                           footer={null}
                           onCancel={this.hideFileContentsModal}>
                        <SyntaxHighlighter language={LANGUAGE_HIGHLIGHTERS[`.${selectedFile.split(".").slice(-1)[0]}`]}
                                           style={a11yLight} customStyle={{fontSize: "12px"}} showLineNumbers={true}>
                            {this.state.fileContents[selectedFile]}
                        </SyntaxHighlighter>
                        {/*<pre>{this.state.fileContents[this.state.selectedFiles[0] || null] || ""}</pre>*/}
                    </Modal>
                    <div style={{marginBottom: "1em"}}>
                        <Dropdown.Button overlay={workflowMenu} style={{marginRight: "12px"}}
                                         disabled={this.state.selectedFiles.length === 0 || !oneWorkflowSupported}>
                            <Icon type="import" /> Ingest
                        </Dropdown.Button>
                        <Button icon="file-text" onClick={this.handleViewFile} style={{marginRight: "12px"}}
                                disabled={!selectedFileViewable}>View</Button>
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
    dropBoxService: PropTypes.object,
    ...dropBoxTreeStateToPropsMixinPropTypes,
    ...workflowsStateToPropsMixinPropTypes
};

const mapStateToProps = state => ({
    dropBoxService: state.services.dropBoxService,
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state)
});

export default connect(mapStateToProps)(ManagerFilesContent);
