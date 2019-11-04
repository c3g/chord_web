import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Modal, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/modal/style/css";
import "antd/es/typography/style/css";


class TableDeletionModal extends Component {
    constructor(props) {
        super(props);
        this.onSubmit = props.onSubmit || (() => {});
        this.onCancel = props.onCancel || (() => {});
    }

    render() {
        return (
            <Modal visible={this.props.visible}
                   title={`Are you sure you want to delete the "${(this.props.table || {}).name || ""}" table?`}
                   footer={[
                       <Button key="cancel" onClick={this.onCancel}>Cancel</Button>,
                       <Button key="confirm" icon="delete" type="danger" onClick={this.onSubmit}>
                           Delete
                       </Button>
                   ]}
                   onCancel={this.onCancel}>
                <Typography.Paragraph>
                    Deleting this table means all data contained in the table will be deleted permanently, and
                    the will no longer be available for discovery within the CHORD federation.
                    {/* TODO: Real terms and conditions */}
                </Typography.Paragraph>
            </Modal>
        )
    }
}

TableDeletionModal.propTypes = {
    visible: PropTypes.bool,
    table: PropTypes.object,

    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
};

export default TableDeletionModal;
