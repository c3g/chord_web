import React, {Component} from "react";
import PropTypes from "prop-types";

import {Collapse, Divider, Empty, Table, Typography} from "antd";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";

class DiscoverySearchContent extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.renderSearches = this.renderSearches.bind(this);
    }

    handleSubmit(cs) {
        this.props.onSubmit(cs);
    }

    handleSearchSelect(searchIndex) {
        this.props.onSearchSelect(parseInt(searchIndex, 10));
    }

    renderSearches() {
        if (!this.props.dataset || !this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        return (
            <Collapse bordered={false} accordion={true} activeKey={this.props.selectedSearch.toString()}
                      onChange={this.handleSearchSelect}>
                {[...this.props.searches].reverse().map((s, i) => (
                    <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                    key={this.props.searches.length - i - 1}>
                        <Table bordered={true} dataSource={s.results} rowKey="id"
                               columns={Object.keys(this.props.dataset.schema.properties)
                                   .map(e => ({title: e, dataIndex: e}))} />
                               {/* TODO: BAD LOGIC (NO NESTED HANDLING, ASSUMES OBJECT AT ROOT LEVEL), HARDCODED ID */}
                    </Collapse.Panel>
                ))}
            </Collapse>
        );
    }

    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset '{this.props.dataset.id}'</Typography.Title>
                <DiscoverySearchForm dataset={this.props.dataset} onSubmit={this.handleSubmit} />
                <Divider />
                <Typography.Title level={3}>Results</Typography.Title>
                {this.renderSearches()}
            </div>
        ) : (<div>Loading...</div>);
    }
}

DiscoverySearchContent.propTypes = {
    onSubmit: PropTypes.func,
    onSearchSelect: PropTypes.func,
    dataset: PropTypes.object,
    searches: PropTypes.array,
    selectedSearch: PropTypes.number
};

export default DiscoverySearchContent;
