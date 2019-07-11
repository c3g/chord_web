import React from "react";
import {connect} from "react-redux";

import {Table, Typography, Icon} from "antd";

import "antd/es/icon/style/css";
import "antd/es/table/style/css.js";

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        render: id => (
            <Typography.Text code>{id}</Typography.Text>
        )
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "URL",
        dataIndex: "url",
        render: url => (
            <a href={`/api${url}`}>{`/api${url}`}</a>
        )
    },
    {
        title: "Data Service?",
        dataIndex: "metadata.chordDataService",
        render: dataService => (
            <Icon type={dataService ? "check" : "close"} />
        )
    }
];

const ServiceList = connect(
    state => ({
        dataSource: state.services.items,
        columns,
        rowKey: "id",
        bordered: true,
        loading: state.services.isFetching
    })
)(Table);

export default ServiceList;
