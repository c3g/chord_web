import React, {Component} from "react";
import {connect} from "react-redux";

import {Col, Layout, PageHeader, Row, Spin, Statistic, Typography} from "antd";
import "antd/es/col/style/css";
import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/statistic/style/css";
import "antd/es/typography/style/css";

import ServiceList from "./ServiceList";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";
import {EM_DASH} from "../utils";


class DashboardContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Dashboard";
    }

    render() {
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Dashboard</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>Node status and health monitor</span>}
                            style={PAGE_HEADER_STYLE}/>
                <Layout>
                    <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                        <Typography.Title level={3}>Overview</Typography.Title>
                        <Row style={{marginBottom: "24px"}} gutter={[0, 16]}>
                            <Col lg={24} xl={12}>
                                <Spin spinning={this.props.isFetchingNodeInfo}>
                                    <Statistic title="Node URL"
                                               value={this.props.isFetchingNodeInfo
                                                   ? EM_DASH
                                                   : this.props.nodeInfo.CHORD_URL} />
                                </Spin>
                            </Col>
                            <Col md={12} lg={8} xl={3}>
                                <Spin spinning={this.props.isFetchingProjects}>
                                    <Statistic title="Projects"
                                               value={this.props.isFetchingProjects
                                                   ? EM_DASH
                                                   : this.props.projects.length} />
                                </Spin>
                            </Col>
                            <Col md={12} lg={8} xl={3}>
                                <Spin spinning={this.props.isFetchingProjects}>
                                    <Statistic title="Datasets"
                                               value={this.props.isFetchingProjects
                                                   ? EM_DASH
                                                   : this.props.projects.flatMap(p => p.datasets).length} />
                                </Spin>
                            </Col>
                            {/* TODO: Tables */}
                            <Col md={12} lg={8} xl={3}>
                                <Spin spinning={this.props.isFetchingPeers}>
                                    {/* Exclude self */}
                                    <Statistic title="Network Size"
                                               value={this.props.isFetchingPeers
                                                   ? EM_DASH
                                                   : this.props.peers.length} />
                                </Spin>
                            </Col>
                        </Row>
                        <Typography.Title level={3}>Services</Typography.Title>
                        <ServiceList />
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    isFetchingNodeInfo: state.nodeInfo.isFetching,

    projects: state.projects.items,
    isFetchingProjects: state.auth.isFetchingDependentData || state.projects.isFetching,

    peers: state.peers.items,
    isFetchingPeers: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(DashboardContent);
