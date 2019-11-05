import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, Table, Tag, Typography} from "antd";

import "antd/es/layout/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {fetchRunDetailsIfNeeded} from "../../modules/wes/actions";

const renderDate = date => date === "" ? "" : new Date(Date.parse(date)).toLocaleString("en-CA");

const sortDate = (a, b, dateProperty) =>
    (new Date(Date.parse(a[dateProperty])).getTime() || Infinity) -
    (new Date(Date.parse(b[dateProperty])).getTime() || Infinity);

const RUN_STATE_TAG_COLORS = {
    UNKNOWN: "",
    QUEUED: "blue",
    INITIALIZING: "cyan",
    RUNNING: "geekblue",
    PAUSED: "orange",
    COMPLETE: "green",
    EXECUTOR_ERROR: "red",
    SYSTEM_ERROR: "volcano",
    CANCELED: "magenta",
    CANCELING: "purple"
};

const RUN_TABLE_COLUMNS = [
    {
        title: "Run ID",
        dataIndex: "run_id",
        sorter: (a, b) => a.run_id.localeCompare(b.run_id)
    },
    {
        title: "Purpose",
        dataIndex: "purpose",
        width: 120,
        sorter: (a, b) => a.purpose.localeCompare(b.purpose)
    },
    {
        title: "Name",
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
        title: "Started",
        dataIndex: "start_time",
        width: 205,
        render: renderDate,
        sorter: (a, b) => sortDate(a, b, "start_time")
    },
    {
        title: "Ended",
        dataIndex: "end_time",
        width: 205,
        render: renderDate,
        sorter: (a, b) => sortDate(a, b, "end_time"),
        defaultSortOrder: "descend"
    },
    {
        title: "State",
        dataIndex: "state",
        width: 150,
        render: state => <Tag color={RUN_STATE_TAG_COLORS[state]}>{state}</Tag>,
        sorter: (a, b) => a.state.localeCompare(b.state)
    }
];

class ManagerRunsContent extends Component {
    constructor(props) {
        super(props);
        this.runRefreshTimeout = null;
        this.refreshRuns = this.refreshRuns.bind(this);
    }

    componentDidMount() {
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), 200);
    }

    componentWillUnmount() {
        if (this.runRefreshTimeout) clearTimeout(this.runRefreshTimeout);
    }

    async refreshRuns() {
        await Promise.all(this.props.runs.map(r => this.props.fetchRunDetailsIfNeeded(r.run_id)));
        this.runRefreshTimeout = setTimeout(() => this.refreshRuns(), 200);
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={2}>Workflow Runs</Typography.Title>
                    <Table bordered={true} dataSource={this.props.runs} rowKey="run_id" columns={RUN_TABLE_COLUMNS} />
                </Layout.Content>
            </Layout>
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
    })
});

const mapDispatchToProps = dispatch => ({
    fetchRunDetailsIfNeeded: async runID => await dispatch(fetchRunDetailsIfNeeded(runID))
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagerRunsContent);
