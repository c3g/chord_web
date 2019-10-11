import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import TableForm from "./TableForm";

import {toggleProjectTableAdditionModal} from "../../../modules/manager/actions";
import {addProjectTable, fetchProjectsWithDatasetsAndTables} from "../../../modules/metadata/actions";


class ManagerTableAdditionModal extends Component {
    componentDidMount() {
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleCancel() {
        this.props.toggleProjectTableAdditionModal();
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            const [serviceID, dataTypeID] = values.dataType.split(":");
            await this.props.addProjectTable(this.props.selectedProjectID, serviceID, dataTypeID, values.name);

            await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

            this.props.toggleProjectTableAdditionModal();
        })
    }

    render() {
        return (
            <Modal visible={this.props.showTableAdditionModal}
                   title={`Add Table to "${this.props.selectedProjectName}"`}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="add" icon="plus" type="primary" onClick={this.handleSubmit}
                               loading={this.props.projectTablesAdding || this.props.projectTablesFetchingAll}>
                           Add
                       </Button>
                   ]}
                   onCancel={this.handleCancel}>
                <TableForm ref={form => this.form = form} />
            </Modal>
        );
    }
}
ManagerTableAdditionModal.propTypes = {
    showTableAdditionModal: PropTypes.bool,
    toggleProjectTableAdditionModal: PropTypes.func,

    projectTablesAdding: PropTypes.bool,
    projectTablesFetchingAll: PropTypes.bool,

    selectedProjectID: PropTypes.string,
    selectedProjectName: PropTypes.string,

    addProjectTable: PropTypes.func
};

const mapStateToProps = state => ({
    showTableAdditionModal: state.manager.projectTableAdditionModal,

    projectTablesAdding: state.projectTables.isAdding,
    projectTablesFetchingAll: state.projectTables.isFetchingAll,

    selectedProjectID: state.manager.selectedProjectID,
    selectedProjectName: (state.projects.itemsByID[state.manager.selectedProjectID] || {name: ""}).name
});

const mapDispatchToProps = dispatch => ({
    toggleProjectTableAdditionModal: () => dispatch(toggleProjectTableAdditionModal()),
    addProjectTable: async (projectID, serviceID, dataTypeID, datasetName) =>
        await dispatch(addProjectTable(projectID, serviceID, dataTypeID, datasetName)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerTableAdditionModal);
