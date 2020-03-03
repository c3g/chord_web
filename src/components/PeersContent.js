import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, Table} from "antd";
import "antd/es/layout/style/css";
import "antd/es/table/style/css";

import {HomeOutlined, GlobalOutlined} from "@ant-design/icons";

import SitePageHeader from "./SitePageHeader";

class PeersContent extends Component {
    constructor(props) {
        super(props);
        this.peerColumns = [
            {
                title: "",
                key: "icon",
                width: 75,
                render: (_, peer) => (
                    <div style={{width: "100%", textAlign: "center"}}>
                        {this.props.nodeInfo.CHORD_URL === peer.url ? <HomeOutlined /> : <GlobalOutlined/>}
                    </div>
                )
            },
            {
                title: "Peer",
                dataIndex: "url",
                render: url => <>
                    <a href={url} target="_blank" rel="noreferrer noopener">{url}</a>
                    {this.props.nodeInfo.CHORD_URL === url ? <span style={{marginLeft: "0.5em"}}>(current node)</span>
                        : null}
                </>,
                sorter: (a, b) => a.url.localeCompare(b.url),
                defaultSortOrder: "ascend"
            }
        ];
    }

    componentDidMount() {
        document.title = "CHORD - Peers";
    }

    render() {
        return (
            <>
                <SitePageHeader title="Peers" subTitle="Other CHORD nodes" />
                <Layout>
                    <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                        <Table dataSource={this.props.peers}
                               columns={this.peerColumns}
                               loading={this.props.loadingPeers}
                               rowKey="url"
                               bordered={true}
                               size="middle" />
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    peers: state.peers.items.map(p => ({url: p})),
    loadingPeers: state.services.isFetchingAll || state.peers.isFetching
});

export default connect(mapStateToProps)(PeersContent);
