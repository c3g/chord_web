import React, {Component} from "react";
import {connect} from "react-redux";

import {Icon, Layout, PageHeader, Table} from "antd";

import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";
import "antd/es/table/style/css";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";

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
                        <Icon type={this.props.nodeInfo.CHORD_URL === peer.url ? "home" : "global"} />
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
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Peers</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>Other CHORD nodes</span>}
                            style={PAGE_HEADER_STYLE}/>
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
