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


const renderContent = (Content, details, history, tab) => route => (
    <>
        <PageHeader title={`Run ${details.run_id}`}
                    tags={<Tag color={RUN_STATE_TAG_COLORS[details.state]}>{details.state}</Tag>}
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
                <Statistic title="Started" value={renderDate(details.run_log.start_time) || "N/A"} />
                <Statistic title="Ended" value={renderDate(details.run_log.end_time) || "N/A"}
                           style={{marginLeft: "24px"}} />
            </Row>
        </PageHeader>
        <div style={{margin: "24px 24px 16px 24px"}}>
            <Content details={details} />
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
        console.log(this.props.run);
        const details = (this.props.run || {}).details || null;
        const loading = this.props.run === null || details === null;
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
                                   component={renderContent(Content, details, this.props.history, tab)} />
                        ))}
                        <Redirect from={this.props.match.path} to={this.props.match.path + "/request"} />
                    </Switch>
                )}
            </>
        );
    }
}

export default withRouter(Run);
