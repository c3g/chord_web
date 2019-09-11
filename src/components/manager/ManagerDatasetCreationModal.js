import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import DatasetForm from "./DatasetForm";

import {toggleProjectDatasetAdditionModal} from "../../modules/manager/actions";

class ManagerDatasetCreationModal extends Component {
    render() {
        return (
            <Modal visible={this.props.showDatasetCreationModal}
                   title={`Add Dataset to "${this.props.selectedProjectName}"`}
                   onCancel={() => this.props.toggleProjectDatasetAdditionModal()}>
                <DatasetForm /> {/* TODO */}
            </Modal>
        );
    }
}
ManagerDatasetCreationModal.propTypes = {
    showDatasetCreationModal: PropTypes.bool,
    selectedProjectName: PropTypes.string,
    toggleProjectDatasetAdditionModal: PropTypes.func
};

const mapStateToProps = state => ({
    showDatasetCreationModal: state.manager.projectDatasetCreationModal,
    selectedProjectName: (state.projects.itemsByID[state.manager.selectedProjectID] || {name: ""}).name
});

const mapDispatchToProps = dispatch => ({
    toggleProjectDatasetAdditionModal: () => dispatch(toggleProjectDatasetAdditionModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerDatasetCreationModal);
