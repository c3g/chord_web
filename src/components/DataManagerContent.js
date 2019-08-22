import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Empty, Layout, Menu, Modal, PageHeader, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/page-header/style/css";
import "antd/es/typography/style/css";

import Project from "./manager/Project";
import ProjectCreationForm from "./manager/ProjectCreationForm";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../modules/services/actions";
import {fetchProjects, createProject, toggleProjectCreationModal} from "../modules/manager/actions";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
        this.props.fetchServiceDataIfNeeded();
        this.props.fetchProjects();  // TODO: If needed

        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleCancel() {
        this.props.toggleProjectCreationModal();
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            // TODO: Update after response from Adrian
            // TODO: Don't hard-code data use
            const project = {
                ...values,
                data_use: {
                    consent_code: {
                        primary_category: {code: "GRU"},
                        secondary_categories: [{code: "NGMR"}]
                    },
                    data_use_requirements: [{code: "COL"}, {code: "US"}]
                }
            };

            await this.props.createProject(project);

            // TODO: Only close modal if submission was a success
            this.props.toggleProjectCreationModal();
        });
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.id}>{project.name}</Menu.Item>
        ));

        const projectName = "Project 1";
        const projectDescription = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis earum et " +
            "laboriosam laborum maxime reiciendis sunt temporibus. Alias, consectetur corporis cumque dignissimos " +
            "eius eveniet ipsa laudantium numquam quis, suscipit vero!";

        const contentStyling = {
            background: "white",
            padding: "24px",
            position: "relative"
        };

        return (
            <>
                <PageHeader title="Data Manager" subTitle="Share data with the CHORD federation"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}
                            extra={[<Button key="create_project" style={{marginTop: "-3px"}} type="primary"
                                            onClick={() => this.props.toggleProjectCreationModal()}
                                            icon="plus">
                                Create Project
                            </Button>]} />
                <Modal visible={this.props.showCreationModal} title="Create Project" footer={[
                    <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                    <Button key="create" icon="plus" type="primary" onClick={this.handleSubmit}>Create</Button>
                ]} onCancel={this.handleCancel}>
                    <ProjectCreationForm ref={form => this.form = form} />
                </Modal>
                <Layout>
                    {projectMenuItems.length === 0 ? (
                        <Layout.Content style={contentStyling}>
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
                                <Button type="primary" icon="plus"
                                        onClick={() => this.props.toggleProjectCreationModal()}>Create Project</Button>
                            </Empty>
                        </Layout.Content>
                    ) : (
                        <>
                            <Layout.Sider style={{background: "white"}} width={256}>
                                <Menu style={{height: "100%"}} mode="inline">
                                    {projectMenuItems}
                                </Menu>
                            </Layout.Sider>
                            <Layout.Content style={contentStyling}>
                                <Project value={{name: projectName, description: projectDescription}}
                                         datasets={this.props.datasets}
                                         loadingDatasets={this.props.loadingDatasets} />
                            </Layout.Content>
                        </>
                    )}
                </Layout>
            </>
        );
    }
}

DataManagerContent.propTypes = {
    showCreationModal: PropTypes.bool,
    projects: PropTypes.arrayOf(PropTypes.object),
    loadingDatasets: PropTypes.bool,
    datasets: PropTypes.arrayOf(PropTypes.object),

    fetchServiceDataIfNeeded: PropTypes.func,
    toggleProjectCreationModal: PropTypes.func,
    fetchProjects: PropTypes.func,
    createProject: PropTypes.func
};

const mapStateToProps = state => {
    const datasets = state.serviceDatasets.datasetsByServiceAndDataTypeID;
    const datasetList = Object.keys(datasets)
        .map(sID => Object.keys(datasets[sID])
            .map(dtID => datasets[sID][dtID].map(ds => ({...ds, dataTypeID: dtID})))
            .flat())
        .flat();
    return {
        showCreationModal: state.manager.projectCreationModal,
        projects: state.projects.items,
        loadingDatasets: state.services.isLoadingAllData,
        datasets: datasetList  // TODO
    };
};

const mapDispatchToProps = dispatch => ({
    fetchServiceDataIfNeeded: () => dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded()),
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
    fetchProjects: () => dispatch(fetchProjects()),
    createProject: async project => await dispatch(createProject(project))
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
