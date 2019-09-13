import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

import PropTypes from "prop-types";

import {Button, Empty, Layout, Menu, Skeleton, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/typography/style/css";

import Project from "./Project";
import ManagerProjectCreationModal from "./ManagerProjectCreationModal";
import ManagerProjectDeletionModal from "./ManagerProjectDeletionModal";
import ManagerDatasetCreationModal from "./ManagerDatasetCreationModal";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../../modules/services/actions";
import {
    beginProjectEditing,
    endProjectEditing,
    fetchProjectsWithDatasets, saveProject,
    selectProjectIfItExists,
    toggleProjectCreationModal,
    toggleProjectDatasetAdditionModal,
    toggleProjectDeletionModal
} from "../../modules/manager/actions";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerProjectDatasetContent extends Component {
    async componentDidMount() {
        this.ingestIntoDataset = this.ingestIntoDataset.bind(this);

        await this.props.fetchServiceDataIfNeeded();
        await this.props.fetchProjectsWithDatasets();  // TODO: If needed
    }

    componentDidUpdate() {
        if (!this.props.selectedProject && this.props.projects.length > 0) {
            this.props.selectProject(this.props.projects[0].id);
        }
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProject(project);
    }

    ingestIntoDataset(d) {
        this.props.history.push("/data/manager/ingestion", {selectedDataset: d.id});  // TODO: Redux for sD?
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.id}>{project.name}</Menu.Item>
        ));

        return (
            <>
                <ManagerProjectCreationModal />
                <ManagerProjectDeletionModal />
                <ManagerDatasetCreationModal />
                <Layout>
                    {(!this.props.loadingProjects && projectMenuItems.length === 0) ? (
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
                                <Button type="primary" icon="plus"
                                        onClick={() => this.props.toggleProjectCreationModal()}>Create Project</Button>
                            </Empty>
                        </Layout.Content>
                    ) : (
                        <>
                            <Layout.Sider style={{background: "white"}} width={256}>
                                <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                                    <Menu style={{flex: 1, paddingTop: "8px"}} mode="inline"
                                          onClick={item => this.props.selectProject(item.key)}
                                          selectedKeys={this.props.selectedProject
                                              ? [this.props.selectedProject.id]
                                              : []}>
                                        {projectMenuItems}
                                    </Menu>
                                    <div style={{borderRight: "1px solid #e8e8e8", padding: "24px"}}>
                                        <Button type="primary" style={{width: "100%"}}
                                                onClick={() => this.props.toggleProjectCreationModal()}
                                                icon="plus">
                                            Create Project
                                        </Button>
                                    </div>
                                </div>
                            </Layout.Sider>
                            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
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
                                             onAddDataset={() => this.props.toggleProjectDatasetAdditionModal()}
                                             onDatasetIngest={d => this.ingestIntoDataset(d)} />
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

ManagerProjectDatasetContent.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object),

    loadingProjects: PropTypes.bool,

    selectedProject: PropTypes.object,

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
        ? state.projectDatasets.itemsByProjectID[state.manager.selectedProjectID] || []  // TODO: Try not to need ||
        : [];

    const datasetList = projectDatasetRecords
        .filter(dataset => datasets.hasOwnProperty(dataset.service_id))
        .map(dataset => datasets[dataset.service_id][dataset.data_type_id]
            .filter(ds => ds.id === dataset.dataset_id)
            .map(ds => ({...ds, dataTypeID: dataset.data_type_id})))
        .flat();

    return {
        editingProject: state.manager.editingProject,
        savingProject: state.projects.isSaving,
        projects: state.projects.items,
        loadingProjects: state.projects.isFetching,
        selectedProject: state.projects.itemsByID[state.manager.selectedProjectID] || null,
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
    saveProject: project => dispatch(saveProject(project))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerProjectDatasetContent));
