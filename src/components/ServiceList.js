import React from "react";
import {connect} from "react-redux";

import {Table, Typography, Icon, Tag} from "antd";

import "antd/es/table/style/css";
import "antd/es/icon/style/css";
import "antd/es/tag/style/css";
import "antd/es/table/style/css.js";

const columns = [
    {
        title: "ID",
        dataIndex: "serviceInfo.id",
        render: id => id ? <Typography.Text code>{id}</Typography.Text> : ""
    },
    {
        title: "Artifact",
        dataIndex: "type.artifact",
        render: artifact => artifact ? <span style={{fontFamily: "monospace"}}>{artifact}</span> : ""
    },
    {
        title: "Name",
        dataIndex: "serviceInfo.name",
    },
    {
        title: "Version",
        dataIndex: "serviceInfo.version",
        render: version => <Typography.Text>{version || "-"}</Typography.Text>
    },
    {
        title: "URL",
        dataIndex: "serviceInfo.url",
        render: url => <a href={url}>{url}</a>
    },
    {
        title: "Data Service?",
        dataIndex: "data_service",
        render: dataService => <Icon type={dataService ? "check" : "close"} />
    },
    {
        title: "Status",
        dataIndex: "status",
        render: (status, service) => service.loading
            ? <Tag>LOADING</Tag>
            : <Tag color={status ? "green" : "red"}>{status ? "HEALTHY" : "ERROR"}</Tag>
    }
];

// noinspection JSUnusedGlobalSymbols
const ServiceList = connect(
    state => ({
        dataSource: state.chordServices.items.map(service => ({
            ...service,
            key: `${service.type.organization}:${service.type.artifact}`,
            serviceInfo: state.services.itemsByArtifact[service.type.artifact] || null,
            status: state.services.itemsByArtifact.hasOwnProperty(service.type.artifact),
            loading: state.services.isFetching
        })),
        columns,
        rowKey: "key",
        bordered: true,
        loading: state.chordServices.isFetching || state.services.isFetching,
        size: "middle"
    })
)(Table);

export default ServiceList;
