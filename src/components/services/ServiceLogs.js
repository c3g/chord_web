import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {connect} from "react-redux";

import {Empty, Layout, Menu, Skeleton} from "antd";
import "antd/es/empty/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/skeleton/style/css";

import ServiceLog from "./ServiceLog";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {withBasePath} from "../../utils/url";
import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";

class ServiceLogs extends Component {
    render() {
        const artifact = this.props.match.params.artifact;
        const logs = this.props.serviceLogs.itemsByArtifact[artifact] || {};
        const loading = this.props.loadingAuthDependentData || this.props.serviceLogs.isFetching;

        const logList = Object.entries((logs || {}).logs || {}).map(l => l[0]);

        const logMenuItems = logList.map(log => ({
            url: withBasePath(`services/${artifact}/logs/${log}`),
            text: log,
        }));

        return <Layout>
            {/* TODO: De-duplicate with project-dataset content */}
            <Layout.Sider style={{background: "white"}} width={256} breakpoint="lg" collapsedWidth={0}>
                <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                    <Menu style={{flex: 1, paddingTop: "8px"}}
                          mode="inline"
                          selectedKeys={matchingMenuKeys(logMenuItems)}>
                        {logMenuItems.map(renderMenuItem)}
                    </Menu>
                </div>
            </Layout.Sider>
            <Layout.Content style={{...LAYOUT_CONTENT_STYLE, ...(loading ? {} : {padding: 0})}}>
                {loading ? <Skeleton active={true} title={false} /> : (
                    Object.keys(logs).length ? (
                        <Switch>
                            <Route path={withBasePath("services/:artifact/logs/:log")} component={ServiceLog} />
                            <Redirect from={withBasePath(`services/${artifact}/logs`)}
                                      to={withBasePath(`services/${artifact}/logs/${logList[0]}`)} />
                        </Switch>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Layout.Content>
        </Layout>;
    }
}

const mapStateToProps = state => ({
    serviceLogs: state.logs.service,
    loadingAuthDependentData: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(ServiceLogs);
