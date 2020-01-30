import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Modal} from "antd";
import "antd/es/modal/style/css";

import LinkedFieldSetForm from "./LinkedFieldSetForm";

import {addDatasetLinkedFieldSetIfPossible} from "../../../modules/metadata/actions";
import {datasetPropTypesShape, nop} from "../../../utils";

class LinkedFieldSetAdditionModal extends Component {
    constructor(props) {
        super(props);
        this.form = null;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        this.form.validateFields(async (err, values) => {
            if (err) return;
            const fieldSet = {
                name: values.name,
                fields: Object.fromEntries(values.fields.map(f => {
                    const parts = f.selected.split(".").slice(1);  // TODO: Condense this with filter (_, i)
                    return [parts[0], parts.slice(2)];
                }))
            };
            await this.props.addLinkedFieldSet(this.props.dataset, fieldSet, async () => {
                if (this.props.onSubmit) await this.props.onSubmit();
                this.form.resetFields();
            });
        });
    }

    render() {
        return (
            <Modal title="Add New Linked Field Set to Dataset"
                   visible={this.props.visible}
                   confirmLoading={this.props.isSavingDataset}
                   onOk={() => this.handleSubmit()}
                   onCancel={() => (this.props.onCancel || nop)()}>
                <LinkedFieldSetForm dataTypes={this.props.dataTypes} ref={form => this.form = form} />
            </Modal>
        );
    }
}

LinkedFieldSetAdditionModal.propTypes = {
    visible: PropTypes.bool,
    dataset: datasetPropTypesShape,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,

    dataTypes: PropTypes.object,  // TODO: shape
    addLinkedFieldSet: PropTypes.func,
};

const mapStateToProps = state => ({
    dataTypes: state.serviceDataTypes.itemsByID,
    isSavingDataset: state.projects.isSavingDataset,
});

const mapDispatchToProps = dispatch => ({
    addLinkedFieldSet: async (dataset, linkedFieldSet, onSuccess) =>
        await dispatch(addDatasetLinkedFieldSetIfPossible(dataset, linkedFieldSet, onSuccess)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedFieldSetAdditionModal);
