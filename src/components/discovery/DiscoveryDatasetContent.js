import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Skeleton} from "antd";
import "antd/es/skeleton/style/css";

import Dataset from "../manager/projects/Dataset";
import {projectPropTypesShape} from "../../utils";

class DiscoveryDatasetContent extends Component {
    render() {
        const datasetId = this.props.match.params.dataset || null;
        if (!datasetId || this.props.isFetchingUserDependentData) {
            // TODO: Nicer
            return <Skeleton />;
        }

        const project = this.props.projects.find(p => p.datasets.find(d => d.identifier === datasetId));
        if (!project) return null;  // TODO: 404 or error

        // TODO: Deduplicate with RoutedProject
        const tables = this.props.serviceTablesByServiceAndDataTypeID;
        const projectTableRecords = this.props.projectTablesByProjectID[project.identifier] || [];

        const tableList = projectTableRecords
            .filter(table => tables.hasOwnProperty(table.service_id))
            .flatMap(table => (tables[table.service_id][table.data_type].tables || [])
                .filter(tb => tb.id === table.table_id)
                .map(tb => ({...tb, ...table})));

        const dataset = {
            ...project.datasets.find(d => d.identifier === datasetId),
            tables: tableList.filter(t => t.dataset === datasetId),  // TODO: Filter how?
        };

        return <Dataset mode="public" value={dataset} project={project} />;
    }
}

DiscoveryDatasetContent.propTypes = {
    projects: PropTypes.arrayOf(projectPropTypesShape),
    projectTablesByProjectID: PropTypes.object,  // TODO: Shape
    serviceTablesByServiceAndDataTypeID: PropTypes.object,  // TODO: Shape
    isFetchingProjects: PropTypes.bool,
};

const mapStateToProps = state => ({
    projects: state.projects.items,
    projectTablesByProjectID: state.projectTables.itemsByProjectID,
    serviceTablesByServiceAndDataTypeID: state.serviceTables.itemsByServiceAndDataTypeID,
    isFetchingUserDependentData: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(withRouter(DiscoveryDatasetContent));
