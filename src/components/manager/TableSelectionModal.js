import React, {Component} from "react";
import PropTypes from "prop-types";

import {Form, Modal} from "antd";
import "antd/es/form/style/css";
import "antd/es/modal/style/css";

import TableTreeSelect from "./TableTreeSelect";

class TableSelectionModal extends Component {
    constructor(props) {
        super(props);

        this.onCancel = this.props.onCancel || (() => {});
        this.onOk = this.props.onOk || (() => {});

        this.state = {
            selected: undefined
        };
    }

    render() {
        return (
            <Modal title={this.props.title || "Select a Table"}
                   visible={this.props.visible || false}
                   onCancel={this.onCancel}
                   onOk={() => this.onOk(this.state.selected)}>
                <Form>
                    <Form.Item label="Table">
                        <TableTreeSelect style={{width: "100%"}}
                                         value={this.state.selected}
                                         dataType={this.props.dataType || null}
                                         onChange={table => this.setState({selected: table})} />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

TableTreeSelect.propTypes = {
    dataType: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
};

export default TableSelectionModal;
