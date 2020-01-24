import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Col, Collapse, Empty, Modal, Row, Spin, Table} from "antd";
import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/collapse/style/css";
import "antd/es/empty/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";

import {selectSearch} from "../../modules/discovery/actions";
import DataUseDisplay from "../DataUseDisplay";


class SearchList extends Component {
    constructor(props) {
        super(props);

        // TODO: Redux?
        this.state = {
            dataUseTermsModalShown: false,
            dataset: null
        };

        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.handleDatasetTermsClick = this.handleDatasetTermsClick.bind(this);
        this.handleDatasetTermsCancel = this.handleDatasetTermsCancel.bind(this);
    }

    handleSearchSelect(searchIndex) {
        this.props.selectSearch(searchIndex === null ? null : parseInt(searchIndex, 10));
    }

    handleDatasetTermsClick(dataset) {
        this.setState({
            dataUseTermsModalShown: true,
            dataset
        });
    }

    handleDatasetTermsCancel() {
        this.setState({dataUseTermsModalShown: false});
    }

    render() {
        if (!this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        const searchResultsColumns = [
            {
                title: "Dataset ID",
                dataIndex: "identifier",
                sorter: (a, b) => a.identifier.localeCompare(b.identifier),
            },
            {
                title: "Title",
                dataIndex: "title",
                sorter: (a, b) => a.title.localeCompare(b.title),
                defaultSortOrder: "ascend",
            },
            {
                title: "Node",
                dataIndex: "node",
                render: node => <a href={node} target="_blank" rel="noreferrer noopener">{node}</a>,
            },
            {
                title: "Actions",
                dataIndex: "actions",
                render: (_, dataset) => (
                    <Row type="flex">
                        <Col>
                            <Button type="link" onClick={() => this.handleDatasetTermsClick(dataset)}>
                                Show Data Use Terms
                            </Button>
                        </Col>
                        {/*<Col>*/}
                        {/*    <Button type="link">/!*
                                            TODO: Real actions *!/Request Access</Button>*/}
                        {/*</Col>*/}
                    </Row>
                ),
            },
        ];

        const datasetNameOrID = (this.state.dataset || {}).name || (this.state.dataset || {}).id || "";
        const dataUseTermsTitle = `Dataset ${datasetNameOrID
            .substr(0, 18)}${datasetNameOrID ? "…" : ""}: Data Use Terms`;

        return (
            <>
                <Modal title={dataUseTermsTitle}
                       visible={this.state.dataUseTermsModalShown}
                       onCancel={() => this.handleDatasetTermsCancel()}
                       footer={null}>
                    <DataUseDisplay dataUse={(this.state.dataset || {}).data_use} />
                </Modal>
                <Spin spinning={this.props.searchLoading}>
                    <Collapse bordered={true}
                              accordion={true}
                              activeKey={(this.props.selectedSearch || 0).toString(10)}
                              onChange={i => this.handleSearchSelect(i)}>
                        {[...this.props.searches].reverse().map((s, i) => {
                            const searchResults = Object.entries(s.results).flatMap(([n, r]) =>
                                r.map(d => ({...d, node: n})));
                            const title = `Search ${this.props.searches.length - i}: ${searchResults.length} result${
                                searchResults.length === 1 ? "" : "s"}`;
                            return (
                                <Collapse.Panel header={title}
                                                key={(this.props.searches.length - i - 1).toString(10)}>
                                    <Table bordered={true}
                                           columns={searchResultsColumns}
                                           dataSource={searchResults}
                                           rowKey="identifier" />
                                </Collapse.Panel>
                            );
                        })}
                    </Collapse>
                </Spin>
            </>
        );
    }
}

const mapStateToProps = state => ({
    searches: state.discovery.searches,
    selectedSearch: state.discovery.selectedSearch,

    searchLoading: state.discovery.isFetching,
});

const mapDispatchToProps = dispatch => ({
    selectSearch: searchIndex => dispatch(selectSearch(searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchList);
