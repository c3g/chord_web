import React from "react";
import {connect} from "react-redux";

import {Table, Typography} from "antd";
import "antd/es/table/style/css.js";

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        render: id => (
            <Typography.Text code>{id}</Typography.Text>
        )
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "URL",
        dataIndex: "url",
        key: "url",
        render: url => (
            <a href={`/api${url}`}>{`/api${url}`}</a>
        )
    }
];

const ServiceList = connect(
    state => ({
        dataSource: state.services.items,
        columns,
        rowKey: "id",
        bordered: "bordered"
    })
)(Table);

export default ServiceList;
