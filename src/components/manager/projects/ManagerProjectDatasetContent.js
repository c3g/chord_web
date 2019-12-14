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
import ProjectCreationModal from "./ProjectCreationModal";
import ProjectDeletionModal from "./ProjectDeletionModal";
import DatasetFormModal from "./DatasetFormModal";

import {
    beginProjectEditing,
    endProjectEditing,

    selectProjectIfItExists,

    toggleProjectCreationModal,
    toggleProjectDeletionModal,
    toggleProjectDatasetAdditionModal,
} from "../../../modules/manager/actions";

import {saveProjectIfPossible,} from "../../../modules/metadata/actions";

import {projectPropTypesShape} from "../../../utils";


import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";


class ManagerProjectDatasetContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetAdditionModal: false,
            datasetEditModal: false,
            selectedDataset: null
        }
    }

    componentDidMount() {
        this.selectProjectIfNeeded = this.selectProjectIfNeeded.bind(this);
        this.ingestIntoTable = this.ingestIntoTable.bind(this);

        this.hideDatasetAdditionModal = this.hideDatasetAdditionModal.bind(this);
        this.hideDatasetEditModal = this.hideDatasetEditModal.bind(this);

        this.selectProjectIfNeeded();
    }

    componentDidUpdate() {
        this.selectProjectIfNeeded();
    }

    selectProjectIfNeeded() {
        if (!this.props.selectedProject && this.props.projects.length > 0) {
            this.props.selectProject(this.props.projects[0].identifier);
        }
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProject(project);
    }

    ingestIntoTable(p, t) {
        this.props.history.push("/data/manager/ingestion", {selectedTable: `${p.identifier}:${t.data_type}:${t.id}`});
    }

    hideDatasetAdditionModal() {
        this.setState({datasetAdditionModal: false});
    }

    hideDatasetEditModal() {
        this.setState({datasetEditModal: false});
    }

    render() {
        const projectMenuItems = this.props.projects.map(project => (
            <Menu.Item key={project.identifier}>{project.title}</Menu.Item>
        ));

        return (
            <>
                <ProjectCreationModal />
                <ProjectDeletionModal />

                <DatasetFormModal mode="add"
                                  visible={this.state.datasetAdditionModal}
                                  onCancel={this.hideDatasetAdditionModal}
                                  onOk={this.hideDatasetAdditionModal} />

                <DatasetFormModal mode="edit"
                                  visible={this.state.datasetEditModal}
                                  initialValue={this.state.selectedDataset}
                                  onCancel={this.hideDatasetEditModal}
                                  onOk={this.hideDatasetEditModal} />

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
                                              ? [this.props.selectedProject.identifier]
                                              : []}>
                                        {projectMenuItems}
                                    </Menu>
                                    <div style={{borderRight: "1px solid #e8e8e8", padding: "24px"}}>
                                        {this.props.loadingProjects ? null : (
                                            <Button type="primary" style={{width: "100%"}}
                                                    onClick={() => this.props.toggleProjectCreationModal()}
                                                    icon="plus">
                                                Create Project
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Layout.Sider>
                            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                                {/* TODO: Fix project datasets */}
                                {this.props.selectedProject ? (
                                    <Project value={this.props.selectedProject}
                                             tables={this.props.tables}
                                             strayTables={this.props.strayTables}
                                             loadingTables={this.props.loadingTables}
                                             editing={this.props.editingProject}
                                             saving={this.props.savingProject}
                                             individuals={this.props.individuals.filter(i =>
                                                i.phenopackets.filter(p =>
                                                    this.props.selectedProject.datasets
                                                        .map(d => d.identifier)
                                                        .includes(p.dataset)
                                                ).length > 0
                                             )}
                                             loadingIndividuals={this.props.loadingIndividuals}
                                             onDelete={() => this.props.toggleProjectDeletionModal()}
                                             onEdit={() => this.props.beginProjectEditing()}
                                             onCancelEdit={() => this.props.endProjectEditing()}
                                             onSave={project => this.handleProjectSave(project)}
                                             onAddDataset={() => this.props.toggleProjectDatasetAdditionModal()}
                                             onEditDataset={dataset => {
                                                 this.setState({
                                                     selectedDataset: dataset,
                                                     datasetEditModal: true
                                                 })
                                             }}
                                             onTableIngest={(p, t) => this.ingestIntoTable(p, t)} />
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
    loadingTables: PropTypes.bool,

    selectedProject: projectPropTypesShape,

    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    tables: PropTypes.arrayOf(PropTypes.object),

    toggleProjectCreationModal: PropTypes.func,
    toggleProjectDeletionModal: PropTypes.func,
    toggleProjectDatasetAdditionModal: PropTypes.func,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,

    saveProject: PropTypes.func,

    phenopackets: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        dataset: PropTypes.string
    })),
    individuals: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        biosamples: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string
        })),
        phenopackets: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            dataset: PropTypes.string
        }))
    })),

    loadingPhenopackets: PropTypes.bool,
    loadingIndividuals: PropTypes.bool,
};

const mapStateToProps = state => {
    const tables = state.serviceTables.itemsByServiceAndDataTypeID;

    const manageableDataTypes = state.services.items
        .filter(s => (s.metadata || {chordManageableTables: false}).chordManageableTables)
        .filter(s => (state.serviceDataTypes.dataTypesByServiceID[s.id] || {}).items)
        .flatMap(s => state.serviceDataTypes.dataTypesByServiceID[s.id].items.map(dt => dt.id));

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

    // TODO: Inconsistent schemas
    const strayTables = [
        ...state.serviceTables.items.filter(t2 =>
            !state.projectTables.items.map(t => t.table_id).includes(t2.id) &&
            manageableDataTypes.includes(t2.data_type)).map(t => ({...t, table_id: t.id})),
        ...state.projectTables.items.filter(t => !Object.keys(state.services.itemsByID).includes(t.service_id))
    ];

    return {
        editingProject: state.manager.editingProject,
        savingProject: state.projects.isSaving,

        projects: state.projects.items,
        tables: tableList,
        strayTables,

        loadingProjects: state.services.isFetchingAll || state.projects.isFetching,
        loadingTables: state.services.isFetchingAll || state.projectTables.isFetching,

        selectedProject: state.projects.itemsByID[state.manager.selectedProjectID] || null,

        phenopackets: state.phenopackets.items,
        individuals: state.individuals.items,

        loadingPhenopackets: state.phenopackets.isFetching,
        loadingIndividuals: state.individuals.isFetching,
    };
};

const mapDispatchToProps = dispatch => ({
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
    toggleProjectDeletionModal: () => dispatch(toggleProjectDeletionModal()),
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    beginProjectEditing: () => dispatch(beginProjectEditing()),
    endProjectEditing: () => dispatch(endProjectEditing()),
    selectProject: projectID => dispatch(selectProjectIfItExists(projectID)),
    saveProject: project => dispatch(saveProjectIfPossible(project)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerProjectDatasetContent));
