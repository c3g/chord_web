import React, {Component} from "react";
import {Link, Redirect, Route, Switch} from "react-router-dom";

import {Menu, PageHeader} from "antd";

import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";

import ManagerProjectDatasetContent from "./manager/ManagerProjectDatasetContent";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Data Manager</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>
                                Share data with the CHORD federation
                            </span>}
                            style={{...PAGE_HEADER_STYLE, borderBottom: "none", paddingBottom: "0"}}
                            footer={
                                <Menu mode="horizontal" style={{
                                    marginLeft: "-24px",
                                    marginRight: "-24px",
                                    marginTop: "-12px"
                                }}>
                                    <Menu.Item style={{marginLeft: "4px"}}>Projects and Datasets</Menu.Item>
                                    <Menu.Item>Files</Menu.Item>
                                    <Menu.Item>Ingestion</Menu.Item>
                                </Menu>
                            } />
                <ManagerProjectDatasetContent />
            </>
        );
    }
}

export default DataManagerContent;
