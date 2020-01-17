import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Spin, Tag, TreeSelect} from "antd";
import "antd/es/spin/style/css";
import "antd/es/tag/style/css";
import "antd/es/tree-select/style/css";

class TableTreeSelect extends Component {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {selected: nextProps.value || undefined};
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {selected: props.value || undefined};
    }

    onChange(selected) {
        // Set the state directly unless value is bound
        if (!("value" in this.props)) this.setState({selected});

        // Update the change handler bound to the component
        if (this.props.onChange) this.props.onChange(this.state.selected);
    }

    render() {
        // TODO: Handle table loading better

        const getTableName = (serviceID, dataTypeID, tableID) =>
            ((((this.props.tablesByServiceAndDataTypeID[serviceID] || {})[dataTypeID]
                || {}).tablesByID || {})[tableID] || {}).name;

        const dataType = this.props.dataType || null;

        const selectTreeData = this.props.projects.map(p => ({
            title: p.title,
            selectable: false,
            key: `project:${p.identifier}`,
            value: `project:${p.identifier}`,
            children: p.datasets.map(d => ({
                title: d.title,
                selectable: false,
                key: `dataset:${d.identifier}`,
                value: `dataset:${d.identifier}`,
                children: [
                    // Add the dataset metadata table in manually -- it's not "owned" per se
                    // TODO: Don't hard-code data type name here, fetch from serviceTables
                    {
                        title: `${d.title} Metadata (${d.identifier})`,
                        data_type: "phenopacket",
                        table_id: d.identifier,
                    },
                    ...(this.props.projectTables[p.identifier] || [])
                        .filter(t => t.dataset === d.identifier &&
                            this.props.tablesByServiceAndDataTypeID.hasOwnProperty(t.service_id))
                        .map(t => ({
                            ...t,
                            title: getTableName(t.service_id, t.data_type, t.table_id)
                                ? `${getTableName(t.service_id, t.data_type, t.table_id)} (${t.table_id})`
                                : t.table_id
                        }))
                ].map(t => ({
                    title: (<><Tag style={{marginRight: "1em"}}>{t.data_type}</Tag> {t.title}</>),
                    disabled: !(dataType === null || dataType === t.data_type),
                    isLeaf: true,
                    key: `${p.identifier}:${t.data_type}:${t.table_id}`,
                    value: `${p.identifier}:${t.data_type}:${t.table_id}`
                }))
            }))
        }));

        return (
            <Spin spinning={this.props.servicesLoading || this.props.projectsLoading}>
                <TreeSelect style={this.props.style || {}}
                            onChange={this.props.onChange || (() => {})}
                            value={this.state.selected}
                            treeData={selectTreeData}
                            treeDefaultExpandAll={true}/>
            </Spin>
        )
    }
}

TableTreeSelect.propTypes = {
    style: PropTypes.object,

    dataType: PropTypes.string,
    onChange: PropTypes.func,

    projects: PropTypes.array,
    projectTables: PropTypes.object,  // TODO: Shape
    tablesByServiceAndDataTypeID: PropTypes.object,  // TODO: Shape

    servicesLoading: PropTypes.bool,
    projectsLoading: PropTypes.bool,
};

const mapStateToProps = state => ({
    projects: state.projects.items,
    projectTables: state.projectTables.itemsByProjectID,
    tablesByServiceAndDataTypeID: state.serviceTables.itemsByServiceAndDataTypeID,
    servicesLoading: state.services.isFetchingAll,
    projectsLoading: state.projects.isFetching,
});

export default connect(mapStateToProps)(TableTreeSelect);
