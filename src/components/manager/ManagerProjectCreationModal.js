import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import ProjectForm from "./ProjectForm";

import {createProject, toggleProjectCreationModal} from "../../modules/manager/actions";

class ManagerProjectCreationModal extends Component {
    async componentDidMount() {
        this.handleCreateCancel = this.handleCreateCancel.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    handleCreateCancel() {
        this.props.toggleProjectCreationModal();
    }

    handleCreateSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            // TODO: Update after response from Adrian
            // TODO: Don't hard-code data use
            const project = {
                ...values,
                data_use: {
                    consent_code: {
                        primary_category: {code: "GRU"},
                        secondary_categories: [{code: "NGMR"}]
                    },
                    data_use_requirements: [{code: "COL"}, {code: "US"}]
                }
            };

            await this.props.createProject(project);

            // TODO: Only close modal if submission was a success
            this.props.toggleProjectCreationModal();
        });
    }

    render() {
        return (
            <Modal visible={this.props.showCreationModal} title="Create Project" footer={[
                <Button key="cancel" onClick={this.handleCreateCancel}>Cancel</Button>,
                <Button key="create" icon="plus" type="primary" onClick={this.handleCreateSubmit}>Create</Button>
            ]} onCancel={this.handleCreateCancel}>
                <ProjectForm ref={form => this.form = form}/>
            </Modal>
        )
    }
}

ManagerProjectCreationModal.propTypes = {
    showCreationModal: PropTypes.bool,
    toggleProjectCreationModal: PropTypes.func,
    createProject: PropTypes.func
};

const mapStateToProps = state => ({
    showCreationModal: state.manager.projectCreationModal,
});

const mapDispatchToProps = dispatch => ({
    toggleProjectCreationModal: () => dispatch(toggleProjectCreationModal()),
    createProject: async project => await dispatch(createProject(project)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerProjectCreationModal);