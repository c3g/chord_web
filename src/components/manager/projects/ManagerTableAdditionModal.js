import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import TableForm from "./TableForm";


const modalTitle = (dataset, project) =>
    `Add Table to Dataset "${(dataset || {}).name || ""}" (Project "${(project || {}).name || ""}")`;

class ManagerTableAdditionModal extends Component {
    componentDidMount() {
        this.onCancel = this.props.onCancel || (() => {});
        this.onSubmit = this.props.onSubmit || (() => {});

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        this.form.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            this.onSubmit(values);
        });
    }

    render() {
        return (
            <Modal visible={this.props.visible}
                   title={modalTitle(this.props.dataset, this.props.project)}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="add" icon="plus" type="primary" onClick={this.handleSubmit}
                               loading={this.props.projectTablesAdding || this.props.projectTablesFetchingAll}>
                           Add
                       </Button>
                   ]}
                   onCancel={() => this.onCancel()}>
                <TableForm ref={form => this.form = form} />
            </Modal>
        );
    }
}
ManagerTableAdditionModal.propTypes = {
    visible: PropTypes.bool,

    projectTablesAdding: PropTypes.bool,
    projectTablesFetchingAll: PropTypes.bool,

    project: PropTypes.object,  // TODO: Re-used shape
    dataset: PropTypes.object,

    onCancel: PropTypes.func,
    onSubmit: PropTypes.func
};

const mapStateToProps = state => ({
    projectTablesAdding: state.projectTables.isAdding,
    projectTablesFetchingAll: state.projectTables.isFetchingAll,
});


export default connect(mapStateToProps)(ManagerTableAdditionModal);
