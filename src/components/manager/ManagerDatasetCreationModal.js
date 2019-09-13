import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import DatasetForm from "./DatasetForm";

import {
    addProjectDataset,
    fetchProjectsWithDatasets,
    toggleProjectDatasetAdditionModal
} from "../../modules/manager/actions";

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

            const [serviceID, dataTypeID] = values.dataType.split(":");
            await this.props.addProjectDataset(this.props.selectedProjectID, serviceID, dataTypeID, values.name);

            await this.props.fetchProjectsWithDatasets();  // TODO: If needed / only this project...

            this.props.toggleProjectDatasetAdditionModal();
        })
    }

    render() {
        return (
            <Modal visible={this.props.showDatasetAdditionModal}
                   title={`Add Dataset to "${this.props.selectedProjectName}"`}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="create" icon="plus" type="primary" onClick={this.handleSubmit}>Create</Button>
                   ]}
                   onCancel={this.handleCancel}>
                <DatasetForm ref={form => this.form = form} />
            </Modal>
        );
    }
}
ManagerDatasetAdditionModal.propTypes = {
    showDatasetAdditionModal: PropTypes.bool,
    toggleProjectDatasetAdditionModal: PropTypes.func,

    selectedProjectID: PropTypes.string,
    selectedProjectName: PropTypes.string,

    addProjectDataset: PropTypes.func
};

const mapStateToProps = state => ({
    showDatasetAdditionModal: state.manager.projectDatasetCreationModal,
    selectedProjectID: state.manager.selectedProjectID,
    selectedProjectName: (state.projects.itemsByID[state.manager.selectedProjectID] || {name: ""}).name
});

const mapDispatchToProps = dispatch => ({
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
    addProjectDataset: async (projectID, serviceID, dataTypeID, datasetName) =>
        await dispatch(addProjectDataset(projectID, serviceID, dataTypeID, datasetName)),
    fetchProjectsWithDatasets: async () => dispatch(fetchProjectsWithDatasets())
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerDatasetAdditionModal);
