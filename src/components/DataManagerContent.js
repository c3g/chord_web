import React, {Component} from "react";
import {Link, Redirect, Route, Switch} from "react-router-dom";

import {Menu, PageHeader} from "antd";

import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";

import ManagerProjectDatasetContent from "./manager/ManagerProjectDatasetContent";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";

const renderContent = Content => route => (
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
                        }} selectedKeys={[route.match.path]}>
                            <Menu.Item key="/data/manager/projects" style={{marginLeft: "4px"}}>
                                <Link to="/data/manager/projects">Projects and Datasets</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/files">
                                <Link to="/data/manager/files">Files</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/ingestion">
                                <Link to="/data/manager/ingestion">Ingestion</Link>
                            </Menu.Item>
                        </Menu>
                    } />
        <Content />
    </>
);

class DummyComponent extends Component {
    render() {
        return (<div />)
    }
}

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <Switch>
                <Route exact path="/data/manager/projects" component={renderContent(ManagerProjectDatasetContent)} />
                <Route exact path="/data/manager/files" component={renderContent(DummyComponent)} />
                <Route exact path="/data/manager/ingestion" component={renderContent(DummyComponent)} />
                <Redirect from="/data/manager" to="/data/manager/projects" />
            </Switch>
        );
    }
}

export default DataManagerContent;
