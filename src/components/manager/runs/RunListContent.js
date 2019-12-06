import React, {Component} from "react";
import {connect} from "react-redux";

import {Table, Typography} from "antd";

import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import {fetchRunDetailsIfNeeded} from "../../../modules/wes/actions";

import {RUN_TABLE_COLUMNS} from "./utils";


const RUN_REFRESH_TIMEOUT = 5000;


class RunListContent extends Component {
    constructor(props) {
        super(props);
        this.runRefreshTimeout = null;
        this.refreshRuns = this.refreshRuns.bind(this);
    }

    componentDidMount() {
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), RUN_REFRESH_TIMEOUT);
    }

    componentWillUnmount() {
        if (this.runRefreshTimeout) clearTimeout(this.runRefreshTimeout);
    }

    async refreshRuns() {
        await Promise.all(this.props.runs.map(r => this.props.fetchRunDetailsIfNeeded(r.run_id)));
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), RUN_REFRESH_TIMEOUT);
    }

    // TODO: Loading for individual rows
    render() {
        return (
            <>
                <Typography.Title level={2}>Workflow Runs</Typography.Title>
                <Table bordered={true}
                       columns={RUN_TABLE_COLUMNS}
                       dataSource={this.props.runs}
                       loading={this.props.servicesFetching || this.props.runsFetching}
                       rowKey="run_id" />
            </>
        );
    }
}

const mapStateToProps = state => ({
    runs: state.runs.items.map(r => {
        const runDetails = (state.runs.itemDetails[r.run_id] || {details: null}).details;
        return {
            ...r,
            purpose: "Ingestion",  // TODO: Not hard-coded, Ingestion or Analysis
            name: (runDetails || {run_log: {name: ""}}).run_log.name || "",
            start_time: (runDetails || {run_log: {start_time: ""}}).run_log.start_time || "",
            end_time: (runDetails || {run_log: {end_time: ""}}).run_log.end_time || ""
        };
    }),
    servicesFetching: state.services.isFetchingAll,
    runsFetching: state.runs.isFetching,
});

const mapDispatchToProps = dispatch => ({
    fetchRunDetailsIfNeeded: async runID => await dispatch(fetchRunDetailsIfNeeded(runID))
});

export default connect(mapStateToProps, mapDispatchToProps)(RunListContent);
