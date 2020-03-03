import React, {Component} from "react";
import PropTypes from "prop-types";

import {Input, Modal, Radio, Table, Tabs} from "antd";
import "antd/es/input/style/css";
import "antd/es/modal/style/css";
import "antd/es/radio/style/css";
import "antd/es/table/style/css";
import "antd/es/tabs/style/css";

import {ShareAltOutlined, TableOutlined} from '@ant-design/icons';

import SchemaTree from "../schema_trees/SchemaTree";
import {generateSchemaTreeData, generateSchemaTableData} from "../../schema";
import {nop} from "../../utils";

// TODO: Add more columns
const FIELD_COLUMNS = [
    {title: "Key", dataIndex: "key", render: t =>
            <span style={{fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap"}}>{t}</span>},
    {title: "JSON Type", dataIndex: ["data", "type"]},
    {title: "Description", dataIndex: ["data", "description"]},
];

class DataTypeExplorationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "tree",
            filter: ""
        };
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    onFilterChange(v) {
        this.setState({filter: v.toLocaleLowerCase().trim()});
    }

    render() {
        // TODO: Cache tree data for data type
        const getTableData = d => (l => this.state.filter === ""
                ? l : l.filter(f => f.key.toLocaleLowerCase().includes(this.state.filter)
                        || (f.data.description || "").toLocaleLowerCase().includes(this.state.filter))
            )(generateSchemaTableData(generateSchemaTreeData(d.schema)));
        return (
            <Modal title="Data Types"
                   visible={this.props.visible}
                   width={1280}
                   onCancel={this.props.onCancel || nop}
                   footer={null}>
                <Radio.Group value={this.state.view}
                             onChange={e => this.setState({view: e.target.value})}
                             buttonStyle="solid"
                             style={{position: "absolute", top: "73px", right: "24px", zIndex: "50"}}>
                    <Radio.Button value="tree"><ShareAltOutlined /> Tree View</Radio.Button>
                    <Radio.Button value="table"><TableOutlined /> Table Detail View</Radio.Button>
                </Radio.Group>
                <Tabs>
                    {Object.values(this.props.dataTypes).flatMap(ds => (ds.items || []).map(d => (
                        <Tabs.TabPane tab={d.id} key={d.id}>
                            {this.state.view === "tree" ? (
                                <SchemaTree schema={d.schema} />
                            ) : (
                                <>
                                    <Input.Search allowClear={true}
                                                  onChange={e => this.onFilterChange(e.target.value)}
                                                  placeholder="Search for a field..." style={{marginBottom: "16px"}} />
                                    <Table bordered={true}
                                           columns={FIELD_COLUMNS}
                                           dataSource={getTableData(d)} />
                                </>
                            )}
                        </Tabs.TabPane>
                    )))}
                </Tabs>
            </Modal>
        );
    }
}

DataTypeExplorationModal.propTypes = {
    dataTypes: PropTypes.object,  // TODO: Shape
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default DataTypeExplorationModal;
