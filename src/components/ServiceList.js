import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Table, Typography, Tag} from "antd";
import "antd/es/table/style/css";
import "antd/es/tag/style/css";
import "antd/es/table/style/css.js";

import {chordServicePropTypesMixin, serviceInfoPropTypesShape} from "../utils";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

const SERVICE_COLUMNS = [
    {
        title: "Artifact",
        dataIndex: ["type", "artifact"],
        render: artifact => artifact ? <span style={{fontFamily: "monospace"}}>{artifact}</span> : ""
    },
    {
        title: "Name",
        dataIndex: ["serviceInfo", "name"],
    },
    {
        title: "Version",
        dataIndex: ["serviceInfo", "version"],
        render: version => <Typography.Text>{version || "-"}</Typography.Text>
    },
    {
        title: "URL",
        dataIndex: ["serviceInfo", "url"],
        render: url => <a href={url}>{url}</a>
    },
    {
        title: "Data Service?",
        dataIndex: "data_service",
        render: dataService => dataService ? <CheckOutlined /> : <CloseOutlined />
    },
    {
        title: "Status",
        dataIndex: "status",
        render: (status, service) => service.loading
            ? <Tag>LOADING</Tag>
            : <Tag color={status ? "green" : "red"}>{status ? "HEALTHY" : "ERROR"}</Tag>
    }
];

class ServiceList extends Component {
    render() {
        return <Table {...this.props} />;
    }
}

ServiceList.propTypes = {
    dataSource: PropTypes.arrayOf(PropTypes.shape({
        ...chordServicePropTypesMixin,
        key: PropTypes.string,
        serviceInfo: serviceInfoPropTypesShape,
        status: PropTypes.bool,
        loading: PropTypes.bool,
    }))
};

const mapStateToProps = state => ({
    dataSource: state.chordServices.items.map(service => ({
        ...service,
        key: `${service.type.organization}:${service.type.artifact}`,
        serviceInfo: state.services.itemsByArtifact[service.type.artifact] || null,
        status: state.services.itemsByArtifact.hasOwnProperty(service.type.artifact),
        loading: state.services.isFetching
    })),
    columns: SERVICE_COLUMNS,
    rowKey: "key",
    bordered: true,
    loading: state.chordServices.isFetching || state.services.isFetching,
    size: "middle"
});

export default connect(mapStateToProps)(ServiceList);
