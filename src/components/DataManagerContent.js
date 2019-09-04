import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Empty, Layout, Menu, Modal, PageHeader, Skeleton, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/modal/style/css";
import "antd/es/page-header/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/typography/style/css";

import DatasetForm from "./manager/DatasetForm";
import Project from "./manager/Project";
import ProjectForm from "./manager/ProjectForm";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../modules/services/actions";
import {
    fetchProjectsWithDatasets,
    selectProjectIfItExists,
    createProject,
    deleteProject,
    toggleProjectCreationModal,
    toggleProjectDeletionModal,
    toggleProjectDatasetAdditionModal,
    beginProjectEditing,
    endProjectEditing,
    saveProject
} from "../modules/manager/actions";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";

class DataManagerContent extends Component {
    async componentDidMount() {
        document.title = "CHORD - Manage Your Data";

        this.handleCreateCancel = this.handleCreateCancel.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);

        this.handleDeleteCancel = this.handleDeleteCancel.bind(this);
        this.handleDeleteSubmit = this.handleDeleteSubmit.bind(this);

        await this.props.fetchServiceDataIfNeeded();
        await this.props.fetchProjectsWithDatasets();  // TODO: If needed
        if (!this.props.selectedProject && this.props.projects.length > 0) {
            this.props.selectProject(this.props.projects[0].id);
        }
    }

    handleCreateCancel() {
        this.props.toggleProjectCreationModal();
    }

    handleCreateSubmit() {
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

    handleDeleteCancel() {
        this.props.toggleProjectDeletionModal();
    }

    async handleDeleteSubmit() {
        await this.props.deleteProject(this.props.selectedProject.id);

        // TODO: Only close modal if deletion was a success
        this.props.toggleProjectDeletionModal();
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProject(project);
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.id}>{project.name}</Menu.Item>
        ));

        const contentStyling = {
            background: "white",
            padding: "24px",
            position: "relative"
        };

        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Data Manager</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>
                                Share data with the CHORD federation
                            </span>}
                            style={PAGE_HEADER_STYLE}
                            extra={[<Button key="create_project" type="primary"
                                            onClick={() => this.props.toggleProjectCreationModal()}
                                            icon="plus">
                                Create Project
                            </Button>]} />
                <Modal visible={this.props.showCreationModal} title="Create Project" footer={[
                    <Button key="cancel" onClick={this.handleCreateCancel}>Cancel</Button>,
                    <Button key="create" icon="plus" type="primary" onClick={this.handleCreateSubmit}>Create</Button>
                ]} onCancel={this.handleCreateCancel}>
                    <ProjectForm ref={form => this.form = form} />
                </Modal>
                <Modal visible={this.props.showDeletionModal}
                       title={`Are you sure you want to delete the "${this.props.selectedProjectName}" project?`}
                       footer={[
                           <Button key="cancel" onClick={this.handleDeleteCancel}>Cancel</Button>,
                           <Button key="confirm" icon="delete" type="danger" onClick={this.handleDeleteSubmit}>
                               Delete
                           </Button>
                       ]}
                       onCancel={this.handleDeleteCancel}>
                    <Typography.Paragraph>
                        Deleting this project means all data contained in the project will be deleted permanently, and
                        datasets will no longer be available for discovery within the CHORD federation.
                    </Typography.Paragraph>
                </Modal>
                <Modal visible={this.props.showDatasetCreationModal}
                       title={`Add Dataset to "${this.props.selectedProjectName}"`}
                       onCancel={() => this.props.toggleProjectDatasetAdditionModal()}>
                    <DatasetForm /> {/* TODO */}
                    TODO: Dataset file upload / pipeline selection? (or one pipeline per data type?)
                </Modal>
                <Layout>
                    {(!this.props.loadingProjects && projectMenuItems.length === 0) ? (
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
                                <Menu style={{height: "100%"}} mode="inline"
                                      onClick={item => this.props.selectProject(item.key)}
                                      selectedKeys={this.props.selectedProject ? [this.props.selectedProject.id] : []}>
                                    {projectMenuItems}
                                </Menu>
                            </Layout.Sider>
                            <Layout.Content style={contentStyling}>
                                {/* TODO: Fix project datasets */}
                                {this.props.selectedProject ? (
                                    <Project value={this.props.selectedProject}
                                             datasets={this.props.datasets}
                                             loadingDatasets={this.props.loadingDatasets}
                                             editing={this.props.editingProject}
                                             saving={this.props.savingProject}
                                             onDelete={() => this.props.toggleProjectDeletionModal()}
                                             onEdit={() => this.props.beginProjectEditing()}
                                             onCancelEdit={() => this.props.endProjectEditing()}
                                             onSave={project => this.handleProjectSave(project)}
                                             onAddDataset={() => this.props.toggleProjectDatasetAdditionModal()} />
                                 ) : (
                                     this.props.loadingProjects ? (
                                         <Skeleton title={{width: 300}}
                                                   paragraph={{rows: 4, width: [600, 580, 600, 480]}} />
                                     ) : (
                                         <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="Select a project from the menu on the left to manage it."
                                         />
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

DataManagerContent.propTypes = {
    showCreationModal: PropTypes.bool,
    showDeletionModal: PropTypes.bool,
    showDatasetCreationModal: PropTypes.bool,

    projects: PropTypes.arrayOf(PropTypes.object),

    loadingProjects: PropTypes.bool,

    selectedProject: PropTypes.object,
    selectedProjectName: PropTypes.string,

    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    loadingDatasets: PropTypes.bool,
    datasets: PropTypes.arrayOf(PropTypes.object),

    fetchServiceDataIfNeeded: PropTypes.func,
    toggleProjectCreationModal: PropTypes.func,
    toggleProjectDeletionModal: PropTypes.func,
    toggleProjectDatasetAdditionModal: PropTypes.func,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,

    fetchProjectsWithDatasets: PropTypes.func,

    createProject: PropTypes.func,
    saveProject: PropTypes.func
};

const mapStateToProps = state => {
    const datasets = state.serviceDatasets.datasetsByServiceAndDataTypeID;

    /**
     * @typedef {Object} ProjectDataset
     * @property {string} dataset_id
     * @property {string} service_id
     * @property {string} data_type_id
     * @type {ProjectDataset[]}
     */
    const projectDatasetRecords = state.manager.selectedProjectID !== null
        ? state.projectDatasets.itemsByProjectID[state.manager.selectedProjectID]
        : [];

    const datasetList = projectDatasetRecords
        .filter(dataset => datasets.hasOwnProperty(dataset.service_id))
        .map(dataset => datasets[dataset.service_id][dataset.data_type_id]
            .filter(ds => ds.id === dataset.dataset_id)
            .map(ds => ({...ds, dataTypeID: dataset.data_type_id})))
        .flat();

    const selectedProject = state.projects.itemsByID[state.manager.selectedProjectID] || null;

    return {
        showCreationModal: state.manager.projectCreationModal,
        showDeletionModal: state.manager.projectDeletionModal,
        showDatasetCreationModal: state.manager.projectDatasetCreationModal,

        editingProject: state.manager.editingProject,
        savingProject: state.projects.isSaving,
        projects: state.projects.items,
        loadingProjects: state.projects.isFetching,
        selectedProject,
        selectedProjectName: (selectedProject || {name: ""}).name,
        loadingDatasets: state.services.isFetchingAll || state.projectDatasets.isFetchingAll,
        datasets: datasetList
    };
};

const mapDispatchToProps = dispatch => ({
    fetchServiceDataIfNeeded: async () => await dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded()),
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
    toggleProjectDeletionModal: () => dispatch(toggleProjectDeletionModal()),
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    beginProjectEditing: () => dispatch(beginProjectEditing()),
    endProjectEditing: () => dispatch(endProjectEditing()),
    fetchProjectsWithDatasets: async () => await dispatch(fetchProjectsWithDatasets()),
    selectProject: projectID => dispatch(selectProjectIfItExists(projectID)),
    createProject: async project => await dispatch(createProject(project)),
    deleteProject: async projectID => await dispatch(deleteProject(projectID)),
    saveProject: project => dispatch(saveProject(project))
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
