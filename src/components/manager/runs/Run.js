import React, {Component} from "react";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";

import {PageHeader, Row, Skeleton, Statistic, Tabs, Tag} from "antd";

import "antd/es/page-header/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/row/style/css";
import "antd/es/statistic/style/css";
import "antd/es/tabs/style/css";
import "antd/es/tag/style/css";

import RunRequest from "./RunRequest";
import RunLog from "./RunLog";
import RunTaskLogs from "./RunTaskLogs";

import {renderDate, RUN_STATE_TAG_COLORS} from "./utils";


const renderContent = (Content, run, history, tab) => route => (
    <>
        <PageHeader title={`Run ${run.run_id}`}
                    tags={<Tag color={RUN_STATE_TAG_COLORS[run.state]}>{run.state}</Tag>}
                    footer={
                        <Tabs activeKey={tab}
                              onChange={key => history.push(`/data/manager/runs/${route.match.params.id}/${key}`)}>
                            <Tabs.TabPane tab="Request" key="request" />
                            <Tabs.TabPane tab="Run Log" key="run_log" />
                            <Tabs.TabPane tab="Task Logs" key="task_logs" />
                        </Tabs>
                    }
                    onBack={() => history.push("/data/manager/runs")}>
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


const TABS = {
    "request": RunRequest,
    "run_log": RunLog,
    "task_logs": RunTaskLogs
};


class Run extends Component {
    render() {
        // TODO: 404
        const loading = this.props.run === null || (this.props.run || {details: null}).details === null;
        return (
            <>
                {loading ? (
                    <div style={{marginTop: "12px", marginLeft: "24px", marginRight: "24px"}}>
                        <Skeleton />
                    </div>
                ) : (
                    <Switch>
                        {Object.entries(TABS).map(([tab, Content]) => (
                            <Route exact path={`${this.props.match.path}/${tab}`} key={tab}
                                   component={renderContent(Content, this.props.run, this.props.history, tab)} />
                        ))}
                        <Redirect from={this.props.match.path} to={this.props.match.path + "/request"} />
                    </Switch>
                )}
            </>
        );
    }
}

export default withRouter(Run);
