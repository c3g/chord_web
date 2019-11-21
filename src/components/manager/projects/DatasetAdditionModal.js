import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import DatasetForm from "./DatasetForm";

import {toggleProjectDatasetAdditionModal} from "../../../modules/manager/actions";
import {addProjectDataset, fetchProjectsWithDatasetsAndTables} from "../../../modules/metadata/actions";

import {projectPropTypesShape} from "../../../utils";


class DatasetAdditionModal extends Component {
    componentDidMount() {
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleCancel() {
        this.props.toggleProjectDatasetAdditionModal();
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            await this.props.addProjectDataset(this.props.selectedProject, values.name, values.description);

            await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

            this.props.toggleProjectDatasetAdditionModal();
        })
    }

    render() {
        return this.props.selectedProject ? (
            <Modal visible={this.props.showDatasetAdditionModal}
                   title={`Add Dataset to "${this.props.selectedProject.name}"`}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="add" icon="plus" type="primary" onClick={this.handleSubmit}
                               loading={this.props.projectTablesAdding || this.props.projectTablesFetching}>
                           Add
                       </Button>
                   ]}
                   onCancel={this.handleCancel}>
                <DatasetForm ref={form => this.form = form} />
            </Modal>
        ) : null;
    }
}
DatasetAdditionModal.propTypes = {
    showDatasetAdditionModal: PropTypes.bool,
    toggleProjectTableAdditionModal: PropTypes.func,

    projectDatasetsAdding: PropTypes.bool,
    projectTablesFetching: PropTypes.bool,

    selectedProject: projectPropTypesShape,
    selectedProjectID: PropTypes.string,

    addProjectDataset: PropTypes.func
};

const mapStateToProps = state => ({
    showDatasetAdditionModal: state.manager.projectDatasetAdditionModal,

    projectDatasetsAdding: state.projects.isAddingDataset,
    projectTablesFetching: state.projectTables.isFetching,

    selectedProjectID: state.manager.selectedProjectID,
    selectedProject: state.projects.itemsByID[state.manager.selectedProjectID] || null,
});

const mapDispatchToProps = dispatch => ({
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    addProjectDataset: async (project, name, description) =>
        await dispatch(addProjectDataset(project, name, description)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetAdditionModal);
