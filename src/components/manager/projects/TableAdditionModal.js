import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Modal} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";

import TableForm from "./TableForm";

import {datasetPropTypesShape, projectPropTypesShape} from "../../../utils";


const modalTitle = (dataset, project) =>
    `Add Table to Dataset "${(dataset || {}).title || ""}" (Project "${(project || {}).title || ""}")`;

class TableAdditionModal extends Component {
    componentDidMount() {
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        this.form.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            (this.props.onSubmit || (() => {}))(values);
        });
    }

    render() {
        return (
            <Modal visible={this.props.visible}
                   title={modalTitle(this.props.dataset, this.props.project)}
                   footer={[
                       <Button key="cancel" onClick={this.handleCancel}>Cancel</Button>,
                       <Button key="add"
                               icon="plus"
                               type="primary"
                               onClick={() => this.handleSubmit()}
                               loading={this.props.projectTablesAdding || this.props.projectTablesFetching}>
                           Add
                       </Button>
                   ]}
                   onCancel={() => (this.props.onCancel || (() => {}))()}>
                <TableForm ref={form => this.form = form} />
            </Modal>
        );
    }
}
TableAdditionModal.propTypes = {
    visible: PropTypes.bool,

    projectTablesAdding: PropTypes.bool,
    projectTablesFetching: PropTypes.bool,

    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,

    onCancel: PropTypes.func,
    onSubmit: PropTypes.func
};

const mapStateToProps = state => ({
    projectTablesAdding: state.projectTables.isAdding,
    projectTablesFetching: state.projectTables.isFetching,
});


export default connect(mapStateToProps)(TableAdditionModal);
