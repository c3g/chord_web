import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, Table, Tag, Typography} from "antd";

import "antd/es/layout/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {fetchRunDetailsIfNeeded} from "../../modules/wes/actions";

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
        const renderDate = date => date === "" ? "" : new Date(Date.parse(date)).toLocaleString("en-CA");
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={2}>Workflow Runs</Typography.Title>
                    <Table bordered={true} dataSource={this.props.runs} rowKey="run_id">
                        <Table.Column title="Run ID" dataIndex="run_id" />
                        <Table.Column title="Purpose" dataIndex="purpose" width={120} />
                        <Table.Column title="Name" dataIndex="name" />
                        <Table.Column title="Started" dataIndex="start_time" width={205} render={renderDate}/>
                        <Table.Column title="Ended" dataIndex="end_time" width={205} render={renderDate} />
                        <Table.Column title="State" dataIndex="state" width={150}
                                      render={state => <Tag color={RUN_STATE_TAG_COLORS[state]}>{state}</Tag>} />
                    </Table>
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
