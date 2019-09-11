import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";
import "antd/es/typography/style/css";

import {deleteProject, toggleProjectDeletionModal} from "../../modules/manager/actions";

class ManagerProjectDeletionModal extends Component {
    handleDeleteCancel() {
        this.props.toggleProjectDeletionModal();
    }

    async handleDeleteSubmit() {
        await this.props.deleteProject(this.props.selectedProject.id);

        // TODO: Only close modal if deletion was a success
        this.props.toggleProjectDeletionModal();
    }

    render() {
        return (
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
                    {/* TODO: Real terms and conditions */}
                </Typography.Paragraph>
            </Modal>
        )
    }
}

ManagerProjectDeletionModal.propTypes = {
    showDeletionModal: PropTypes.bool,

    selectedProject: PropTypes.object,
    selectedProjectName: PropTypes.string,

    toggleProjectDeletionModal: PropTypes.func,
    deleteProject: PropTypes.func
};

const mapStateToProps = state => {
    const selectedProject = state.projects.itemsByID[state.manager.selectedProjectID] || null;

    return {
        showDeletionModal: state.manager.projectDeletionModal,
        selectedProject,
        selectedProjectName: (selectedProject || {name: ""}).name,
    };
};

const mapDispatchToProps = dispatch => ({
    toggleProjectDeletionModal: () => dispatch(toggleProjectDeletionModal()),
    deleteProject: async projectID => await dispatch(deleteProject(projectID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerProjectDeletionModal);
