import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import DatasetForm from "./DatasetForm";

import {toggleProjectDatasetAdditionModal} from "../../../modules/manager/actions";
import {addProjectDataset, fetchProjectsWithDatasetsAndTables} from "../../../modules/metadata/actions";


class ManagerDatasetAdditionModal extends Component {
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
                               loading={this.props.projectTablesAdding || this.props.projectTablesFetchingAll}>
                           Add
                       </Button>
                   ]}
                   onCancel={this.handleCancel}>
                <DatasetForm ref={form => this.form = form} />
            </Modal>
        ) : null;
    }
}
ManagerDatasetAdditionModal.propTypes = {
    showDatasetAdditionModal: PropTypes.bool,
    toggleProjectTableAdditionModal: PropTypes.func,

    projectDatasetsAdding: PropTypes.bool,
    projectDatasetsFetching: PropTypes.bool,

    selectedProject: PropTypes.object,  // TODO: Shape
    selectedProjectID: PropTypes.string,

    addProjectDataset: PropTypes.func
};

const mapStateToProps = state => ({
    showDatasetAdditionModal: state.manager.projectDatasetAdditionModal,

    projectDatasetsAdding: state.projectDatasets.isAdding,
    projectDatasetsFetching: state.projectDatasets.isFetching,

    selectedProjectID: state.manager.selectedProjectID,
    selectedProject: state.projects.itemsByID[state.manager.selectedProjectID] || null,
});

const mapDispatchToProps = dispatch => ({
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    addProjectDataset: async (projectID, name, description) =>
        await dispatch(addProjectDataset(projectID, name, description)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerDatasetAdditionModal);
