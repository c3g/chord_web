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
        if (this.props.dataType === null) return;
        this.props.selectSearch(parseInt(searchIndex, 10));
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

        return (
            <>
                <Modal title={`Dataset ${((this.state.dataset || {}).name || (this.state.dataset || {}).id || "")
                    .substr(0, 18)}${((this.state.dataset || {}).name || "").length > 18 ? "…"
                    : ""}: Data Use Terms`}
                       visible={this.state.dataUseTermsModalShown}
                       onCancel={() => this.handleDatasetTermsCancel()} footer={null}>
                    <DataUseDisplay dataUse={(this.state.dataset || {}).data_use} />
                </Modal>
                <Spin spinning={this.props.searchLoading}>
                    <Collapse bordered={false}
                              accordion={true}
                              activeKey={(this.props.selectedSearch || 0).toString()}
                              onChange={this.handleSearchSelect}>
                        {[...this.props.searches].reverse().map((s, i) => (
                            <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                            key={this.props.searches.length - i - 1}>
                                <Table bordered={true} dataSource={s.results} rowKey="identifier">
                                    <Table.Column title="Dataset ID" dataIndex="identifier" />
                                    <Table.Column title="Title" dataIndex="title" />
                                    <Table.Column title="Actions" dataIndex="actions" render={(_, dataset) => (
                                        <Row type="flex">
                                            <Col>
                                                <Button type="link"
                                                        onClick={() => this.handleDatasetTermsClick(dataset)}>
                                                    Show Data Use Terms
                                                </Button>
                                            </Col>
                                            {/*<Col>*/}
                                            {/*    <Button type="link">/!*
                                            TODO: Real actions *!/Request Access</Button>*/}
                                            {/*</Col>*/}
                                        </Row>
                                    )} />
                                </Table>
                            </Collapse.Panel>
                        ))}
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
    selectSearch: (serviceInfo, dataTypeID, searchIndex) =>
        dispatch(selectSearch(serviceInfo, dataTypeID, searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchList);
