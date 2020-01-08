import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, PageHeader, Table} from "antd";

import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";
import "antd/es/table/style/css";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";


class PeersContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Peers";
    }

    render() {
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Peers</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>Other CHORD nodes</span>}
                            style={PAGE_HEADER_STYLE}/>
                <Layout>
                    <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                        <Table dataSource={this.props.peers} columns={[{
                            title: "Peer",
                            dataIndex: "url",
                            sorter: (a, b) => a.url.localeCompare(b.url),
                            defaultSortOrder: "ascend"
                        }]} loading={this.props.loadingPeers} rowKey="url" bordered={true} size="middle" />
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

const mapStateToProps = state => ({
    peers: state.peers.items.map(p => ({url: p})),
    loadingPeers: state.services.isFetchingAll || state.peers.isFetching
});

export default connect(mapStateToProps)(PeersContent);
