import React, {Component} from "react";

import {PageHeader, Row, Statistic, Tabs, Tag} from "antd";

import "antd/es/page-header/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";
import "antd/es/tabs/style/css";
import "antd/es/tag/style/css";

import RunRequest from "./RunRequest";
import RunLog from "./RunLog";
import RunTaskLogs from "./RunTaskLogs";

import {renderDate, RUN_STATE_TAG_COLORS} from "./utils";


const TABS = {
    "request": RunRequest,
    "run_log": RunLog,
    "task_logs": RunTaskLogs
};


class Run extends Component {
    render() {
        const run = this.props.run || {};
        const tab = this.props.tab || "request";
        const Content = TABS[tab];
        return (
            <>
                <PageHeader title={`Run ${run.run_id}`}
                            tags={<Tag color={RUN_STATE_TAG_COLORS[run.state]}>{run.state}</Tag>}
                            footer={
                                <Tabs activeKey={tab} onChange={this.props.onChangeTab || (() => {})}>
                                    <Tabs.TabPane tab="Request" key="request" />
                                    <Tabs.TabPane tab="Run Log" key="run_log" />
                                    <Tabs.TabPane tab="Task Logs" key="task_logs" />
                                </Tabs>
                            }
                            onBack={this.props.onBack || (() => {})}>
                    <Row type="flex">
                        <Statistic title="Started" value={renderDate(run.details.run_log.start_time) || "N/A"} />
                        <Statistic title="Ended" value={renderDate(run.details.run_log.end_time) || "N/A"}
                                   style={{marginLeft: "24px"}} />
                    </Row>
                </PageHeader>
                <div style={{margin: "24px 24px 16px 24px"}}>
                    <Content run={run} />
                </div>
            </>
        );
    }
}

export default Run;
