import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Modal} from "antd";
import "antd/es/modal/style/css";

import DatasetFormModal from "./dataset/DatasetFormModal";
import Project from "./Project";
import ProjectSkeleton from "./ProjectSkeleton";

import {deleteProjectIfPossible, saveProjectIfPossible} from "../../../modules/metadata/actions";
import {beginProjectEditing, endProjectEditing} from "../../../modules/manager/actions";
import {withBasePath} from "../../../utils/url";
import {FORM_MODE_ADD, FORM_MODE_EDIT} from "../../../constants";
import {projectPropTypesShape, serviceInfoPropTypesShape} from "../../../propTypes";

class RoutedProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetAdditionModal: false,
            datasetEditModal: false,
            selectedDataset: null
        };
    }

    componentDidMount() {
        this.showDatasetAdditionModal = this.showDatasetAdditionModal.bind(this);
        this.hideDatasetAdditionModal = this.hideDatasetAdditionModal.bind(this);
        this.hideDatasetEditModal = this.hideDatasetEditModal.bind(this);
        this.ingestIntoTable = this.ingestIntoTable.bind(this);
        this.handleDeleteProject = this.handleDeleteProject.bind(this);
    }

    componentDidUpdate() {
        if (!this.props.projectsByID[this.props.match.params.project] && !this.props.loadingProjects) {
            this.props.history.push(withBasePath("data/manager/projects/"));
        }
    }

    ingestIntoTable(p, t) {
        this.props.history.push(withBasePath("data/manager/ingestion"),
            {selectedTable: `${p.identifier}:${t.data_type}:${t.id}`});
    }

    handleProjectSave(project) {
        // TODO: Form validation for project
        this.props.saveProject(project);
    }

    showDatasetAdditionModal() {
        this.setState({datasetAdditionModal: true});
    }

    hideDatasetAdditionModal() {
        this.setState({datasetAdditionModal: false});
    }

    hideDatasetEditModal() {
        this.setState({datasetEditModal: false});
    }

    handleDeleteProject(project) {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${project.title}" project?`,
            content:
                <>
                    Deleting this project means all data contained in the project will be deleted
                    permanently, and datasets will no longer be available for discovery within the
                    CHORD federation. {/* TODO: Real terms and conditions */}
                </>,
            width: 576,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({okButtonProps: {loading: true}});
                await this.props.deleteProject(project);
                deleteModal.update({okButtonProps: {loading: false}});
            },
        });
    }

    render() {
        const selectedProjectID = this.props.match.params.project;
        if (selectedProjectID) {
            const project = this.props.projectsByID[this.props.match.params.project];
            if (!project) return <ProjectSkeleton />;

            const tables = this.props.serviceTablesByServiceAndDataTypeID;

            /**
             * @typedef {Object} ProjectTable
             * @property {string} table_id
             * @property {string} service_id
             * @property {string} dataset
             * @property {string} data_type
             * @property {string} sample
             * @type {ProjectTable[]}
             */
            const projectTableRecords = this.props.projectTablesByProjectID[selectedProjectID] || [];

            const manageableDataTypes = this.props.services
                .filter(s =>
                    (s.metadata || {chordManageableTables: false}).chordManageableTables &&
                    (this.props.serviceDataTypesByServiceID[s.id] || {}).items)
                .flatMap(s => this.props.serviceDataTypesByServiceID[s.id].items.map(dt => dt.id));


            const tableList = projectTableRecords
                .filter(table =>  tables.hasOwnProperty(table.service_id))
                .flatMap(table => (tables[table.service_id][table.data_type].tables || [])
                    .filter(tb => tb.id === table.table_id)
                    .map(tb => ({...tb, ...table})));

            // TODO: Inconsistent schemas
            const strayTables = [
                ...this.props.serviceTables.filter(t2 =>
                    !this.props.projectTables.map(t => t.table_id).includes(t2.id) &&
                    manageableDataTypes.includes(t2.data_type)).map(t => ({...t, table_id: t.id})),
                ...this.props.projectTables.filter(t => !this.props.servicesByID.hasOwnProperty(t.service_id))
            ];

            return <>
                <DatasetFormModal mode={FORM_MODE_ADD}
                                  project={project}
                                  visible={this.state.datasetAdditionModal}
                                  onCancel={this.hideDatasetAdditionModal}
                                  onOk={this.hideDatasetAdditionModal} />

                <DatasetFormModal mode={FORM_MODE_EDIT}
                                  project={project}
                                  visible={this.state.datasetEditModal}
                                  initialValue={this.state.selectedDataset}
                                  onCancel={this.hideDatasetEditModal}
                                  onOk={this.hideDatasetEditModal} />

                <Project value={project}
                         tables={tableList}
                         strayTables={strayTables}
                         editing={this.props.editingProject}
                         saving={this.props.savingProject}
                         individuals={this.props.individuals.filter(i =>
                             i.phenopackets
                                 .filter(p => project.datasets.map(d => d.identifier).includes(p.dataset))
                                 .length > 0)}
                         loadingIndividuals={this.props.loadingIndividuals}
                         onDelete={() => this.handleDeleteProject(project)}
                         onEdit={() => this.props.beginProjectEditing()}
                         onCancelEdit={() => this.props.endProjectEditing()}
                         onSave={project => this.handleProjectSave(project)}
                         onAddDataset={() => this.showDatasetAdditionModal()}
                         onEditDataset={dataset => this.setState({
                             selectedDataset: dataset,
                             datasetEditModal: true
                         })}
                         onTableIngest={(p, t) => this.ingestIntoTable(p, t)} />
            </>;
        }

        return null;
    }
}

RoutedProject.propTypes = {
    editingProject: PropTypes.bool,
    savingProject: PropTypes.bool,

    services: PropTypes.arrayOf(serviceInfoPropTypesShape),
    servicesByID: PropTypes.objectOf(serviceInfoPropTypesShape),

    serviceDataTypesByServiceID: PropTypes.objectOf(PropTypes.shape({
        items: PropTypes.array,  // TODO: Shape
        itemsByID: PropTypes.object,  // TODO: Shape
        isFetching: PropTypes.bool,
    })),

    serviceTables: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    serviceTablesByServiceAndDataTypeID: PropTypes.objectOf(PropTypes.objectOf(PropTypes.object)),  // TODO: Shape

    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectsByID: PropTypes.objectOf(projectPropTypesShape),

    projectTables: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    projectTablesByProjectID: PropTypes.objectOf(PropTypes.object),  // TODO: Shape

    phenopackets: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape
    individuals: PropTypes.arrayOf(PropTypes.object),  // TODO: Shape

    loadingPhenopackets: PropTypes.bool,
    loadingIndividuals: PropTypes.bool,
    loadingProjects: PropTypes.bool,

    isDeletingProject: PropTypes.bool,

    beginProjectEditing: PropTypes.func,
    endProjectEditing: PropTypes.func,
    saveProject: PropTypes.func,
    deleteProject: PropTypes.func,
};

const mapStateToProps = state => ({
    editingProject: state.manager.editingProject,
    savingProject: state.projects.isSaving,

    services: state.services.items,
    servicesByID: state.services.itemsByID,

    serviceDataTypesByServiceID: state.serviceDataTypes.dataTypesByServiceID,

    serviceTables: state.serviceTables.items,
    serviceTablesByServiceAndDataTypeID: state.serviceTables.itemsByServiceAndDataTypeID,

    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,

    projectTables: state.projectTables.items,
    projectTablesByProjectID: state.projectTables.itemsByProjectID,

    phenopackets: state.phenopackets.items,
    individuals: state.individuals.items,

    loadingPhenopackets: state.phenopackets.isFetching,
    loadingIndividuals: state.individuals.isFetching,
    loadingProjects: state.projects.isAdding || state.projects.isFetching,

    isDeletingProject: state.projects.isDeleting,
});

const mapDispatchToProps = dispatch => ({
    beginProjectEditing: () => dispatch(beginProjectEditing()),
    endProjectEditing: () => dispatch(endProjectEditing()),
    saveProject: project => dispatch(saveProjectIfPossible(project)),
    deleteProject: async project => await dispatch(deleteProjectIfPossible(project)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RoutedProject);
