import React, {Component} from "react";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";
import {connect} from "react-redux";

import PropTypes from "prop-types";

import {Button, Empty, Layout, Menu, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/typography/style/css";

import {PlusOutlined} from "@ant-design/icons";

import ProjectCreationModal from "./ProjectCreationModal";
import ProjectSkeleton from "./ProjectSkeleton";
import RoutedProject from "./RoutedProject";

import {toggleProjectCreationModal} from "../../../modules/manager/actions";

import {
    renderMenuItem,
    matchingMenuKeys,
    projectPropTypesShape,
    nodeInfoDataPropTypesShape,
    withBasePath
} from "../../../utils";


import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";


class ManagerProjectDatasetContent extends Component {
    render() {
        const projectMenuItems = this.props.projects.map(project => ({
            url: withBasePath(`data/manager/projects/${project.identifier}`),
            text: project.title
        }));

        return (
            <>
                <ProjectCreationModal />
                <Layout>
                    {(!this.props.loadingAuthDependentData && projectMenuItems.length === 0) ? (
                        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false}>
                                <Typography.Title level={3}>No Projects</Typography.Title>
                                <Typography.Paragraph style={{
                                    maxWidth: "600px",
                                    marginLeft: "auto",
                                    marginRight: "auto"
                                }}>
                                    To create datasets and ingest data, you have to create a CHORD project
                                    first. CHORD projects have a name and description, and let you group related
                                    datasets together. You can then specify project-wide consent codes and data use
                                    restrictions to control data access.
                                </Typography.Paragraph>
                                <Button type="primary" icon={<PlusOutlined />}
                                        onClick={() => this.props.toggleProjectCreationModal()}>Create Project</Button>
                            </Empty>
                        </Layout.Content>
                    ) : (
                        <>
                            <Layout.Sider style={{background: "white"}} width={256} breakpoint="lg" collapsedWidth={0}>
                                <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                                    <Menu style={{flex: 1, paddingTop: "8px"}}
                                          mode="inline"
                                          selectedKeys={matchingMenuKeys(projectMenuItems)}>
                                        {projectMenuItems.map(renderMenuItem)}
                                    </Menu>
                                    <div style={{borderRight: "1px solid #e8e8e8", padding: "24px"}}>
                                        <Button type="primary" style={{width: "100%"}}
                                                onClick={() => this.props.toggleProjectCreationModal()}
                                                loading={this.props.loadingAuthDependentData}
                                                disabled={this.props.loadingAuthDependentData}
                                                icon={<PlusOutlined />}>
                                            Create Project
                                        </Button>
                                    </div>
                                </div>
                            </Layout.Sider>
                            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                                {/* TODO: Fix project datasets */}
                                {projectMenuItems.length > 0 ? (
                                    <Switch>
                                        <Route path={withBasePath("data/manager/projects/:project")}
                                               component={RoutedProject} />
                                        <Redirect from={withBasePath("data/manager/projects")}
                                                  to={withBasePath(`data/manager/projects/${
                                                      this.props.projects[0].identifier}`)} />
                                    </Switch>
                                ) : (
                                    this.props.loadingAuthDependentData ? (
                                        <ProjectSkeleton />
                                    ) : (
                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                               description="Select a project from the menu on the left to manage it." />
                                    )
                                )}
                            </Layout.Content>
                        </>
                    )}
                </Layout>
            </>
        );
    }
}

ManagerProjectDatasetContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,

    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectsByID: PropTypes.objectOf(projectPropTypesShape),
    loadingAuthDependentData: PropTypes.bool,

    toggleProjectCreationModal: PropTypes.func,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,
    loadingAuthDependentData: state.auth.isFetchingDependentData,
});

const mapDispatchToProps = dispatch => ({
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerProjectDatasetContent));
