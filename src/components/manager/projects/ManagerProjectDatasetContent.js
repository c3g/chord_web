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
import ManagerDatasetAdditionModal from "./ManagerDatasetAdditionModal";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../../../modules/services/actions";

import {
    beginProjectEditing,
    endProjectEditing,

    selectProjectIfItExists,

    toggleProjectCreationModal,
    toggleProjectDeletionModal,
    toggleProjectDatasetAdditionModal,
} from "../../../modules/manager/actions";

import {
    fetchProjectsWithDatasetsAndTables,
    saveProjectIfPossible
} from "../../../modules/metadata/actions";

import {projectPropTypesShape} from "../../../utils";


import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";


class ManagerProjectDatasetContent extends Component {
    async componentDidMount() {
        this.ingestIntoDataset = this.ingestIntoDataset.bind(this);

        await this.props.fetchServiceDataIfNeeded();
        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed
    }

    componentDidUpdate() {
        if (!this.props.selectedProject && this.props.projects.length > 0) {
            this.props.selectProject(this.props.projects[0].project_id);
        }
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProject(project);
    }

    ingestIntoDataset(d) {
        this.props.history.push("/data/manager/ingestion", {selectedTable: d.id});  // TODO: Redux for sD?
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.project_id}>{project.name}</Menu.Item>
        ));

        return (
            <>
                <ManagerProjectCreationModal />
                <ManagerProjectDeletionModal />
                <ManagerDatasetAdditionModal />

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
                                              ? [this.props.selectedProject.project_id]
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
                                             tables={this.props.tables}
                                             loadingDatasets={this.props.loadingDatasets}
                                             loadingTables={this.props.loadingTables}
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
    projects: PropTypes.arrayOf(projectPropTypesShape),

    loadingProjects: PropTypes.bool,
    loadingDatasets: PropTypes.bool,
    loadingTables: PropTypes.bool,

    selectedProject: projectPropTypesShape,

    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    datasets: PropTypes.arrayOf(PropTypes.object),
    tables: PropTypes.arrayOf(PropTypes.object),

    fetchServiceDataIfNeeded: PropTypes.func,
    toggleProjectCreationModal: PropTypes.func,
    toggleProjectDeletionModal: PropTypes.func,
    toggleProjectDatasetAdditionModal: PropTypes.func,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,

    fetchProjectsWithDatasetsAndTables: PropTypes.func,

    saveProject: PropTypes.func
};

const mapStateToProps = state => {
    const datasets = state.manager.selectedProjectID !== null
        ? state.projectDatasets.itemsByProjectID[state.manager.selectedProjectID] || []
        : [];

    const tables = state.serviceTables.itemsByServiceAndDataTypeID;

    /**
     * @typedef {Object} ProjectTable
     * @property {string} table_id
     * @property {string} service_id
     * @property {string} dataset
     * @property {string} data_type
     * @property {string} sample
     * @type {ProjectTable[]}
     */
    const projectTableRecords = state.manager.selectedProjectID !== null
        ? state.projectTables.itemsByProjectID[state.manager.selectedProjectID] || []  // TODO: Try not to need ||
        : [];

    const tableList = projectTableRecords
        .filter(table =>  tables.hasOwnProperty(table.service_id))
        .map(table => (tables[table.service_id][table.data_type].tables || [])
            .filter(tb => tb.id === table.table_id)
            .map(tb => ({...tb, ...table})))
        .flat();

    return {
        editingProject: state.manager.editingProject,
        savingProject: state.projects.isSaving,

        projects: state.projects.items,
        datasets,
        tables: tableList,

        loadingProjects: state.projects.isFetching,
        loadingDatasets: state.projectDatasets.isFetching || state.projectDatasets.isAdding,
        loadingTables: state.services.isFetchingAll || state.projectTables.isFetchingAll,

        selectedProject: state.projects.itemsByID[state.manager.selectedProjectID] || null
    };
};

const mapDispatchToProps = dispatch => ({
    fetchServiceDataIfNeeded: async () => await dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded()),
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
    toggleProjectDeletionModal: () => dispatch(toggleProjectDeletionModal()),
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    beginProjectEditing: () => dispatch(beginProjectEditing()),
    endProjectEditing: () => dispatch(endProjectEditing()),
    fetchProjectsWithDatasetsAndTables: async () => await dispatch(fetchProjectsWithDatasetsAndTables()),
    selectProject: projectID => dispatch(selectProjectIfItExists(projectID)),
    saveProject: project => dispatch(saveProjectIfPossible(project))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerProjectDatasetContent));
