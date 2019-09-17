import React from "react";
import {connect} from "react-redux";

import {Table, Typography, Icon, Tag} from "antd";

import "antd/es/icon/style/css";
import "antd/es/tag/style/css";
import "antd/es/table/style/css.js";

const columns = [
    {
        title: "ID",
        dataIndex: "id",
        render: id => <Typography.Text code>{id}</Typography.Text>
    },
    {
        title: "Name",
        dataIndex: "name",
    },
    {
        title: "Version",
        dataIndex: "version",
        render: version => <Typography.Text>{version ? version : "-"}</Typography.Text>
    },
    {
        title: "URL",
        dataIndex: "url",
        render: url => <a href={`/api${url}`}>{`/api${url}`}</a>
    },
    {
        title: "Data Service?",
        dataIndex: "metadata.chordDataService",
        render: dataService => <Icon type={dataService ? "check" : "close"} />
    },
    {
        title: "Status",
        dataIndex: "status",
        render: status => {
            const statusText = status ? "HEALTHY" : "ERROR";
            const color = status ? "green" : "red";
            return <Tag color={color}>{statusText}</Tag>;
        }
    }
];

// noinspection JSUnusedGlobalSymbols
const ServiceList = connect(
    state => ({
        dataSource: state.services.items.map(service => ({
            ...service,
            status: (state.serviceMetadata.metadata[service.id] || {metadata: null}).metadata || null,
            version: (state.serviceMetadata.metadata[service.id] || {version: "-"}).version
        })),
        columns,
        rowKey: "id",
        bordered: true,
        loading: state.services.isFetching,
        size: "middle"
    })
)(Table);

export default ServiceList;
