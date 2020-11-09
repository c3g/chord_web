import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";
import {BASE_PATH, signInURLWithRedirect, urlPath, withBasePath} from "../utils/url";

import {Col, Layout, Row, Spin, Statistic, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/layout/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import AdminHeader from "./AdminHeader";
import SitePageHeader from "./SitePageHeader";
import DashboardContent from "./DashboardContent";
import DataManagerContent from "./DataManagerContent";
import ServiceList from "./ServiceList";
import PeersContent from "./PeersContent";
import ServiceDetail from "./services/ServiceDetail";

import {SITE_NAME} from "../constants";
import {nodeInfoDataPropTypesShape, projectPropTypesShape} from "../propTypes";
import {EM_DASH} from "../constants";


class AdminContent extends Component {
    componentDidMount() {
        document.title = `${SITE_NAME} - Admin`;
    }

    render() {
        return <>
            <AdminHeader />
            <SitePageHeader title="Admin" subTitle="Administrative tools" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                    {/* <Typography.Title level={3}>Admin</Typography.Title> */}
                    <Switch>
                        <Route path={withBasePath("admin/services")} component={DashboardContent} />
                        <Route path={withBasePath("admin/services/:artifact")} component={ServiceDetail} />
                        <Route path={withBasePath("admin/data/manager")} component={DataManagerContent} />
                        <Route path={withBasePath("admin/peers")} component={PeersContent} />
                        <Redirect from={BASE_PATH} to={withBasePath("admin/services")} />
                    </Switch>
                </Layout.Content>
            </Layout>
        </>;
    }
}

AdminContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    isFetchingNodeInfo: PropTypes.bool,

    projects: PropTypes.arrayOf(projectPropTypesShape),
    isFetchingProjects: PropTypes.bool,

    peers: PropTypes.arrayOf(PropTypes.string),
    isFetchingPeers: PropTypes.bool,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,

    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(AdminContent);
