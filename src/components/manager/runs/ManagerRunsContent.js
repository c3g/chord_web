import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";

import "antd/es/layout/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";

const renderContent = Content => route => (
    <Layout>
        <Layout.Content style={LAYOUT_CONTENT_STYLE}>
            <Content match={route.match} />
        </Layout.Content>
    </Layout>
);

class ManagerRunsContent extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/data/manager/runs" component={renderContent(RunListContent)} />
                <Route path="/data/manager/runs/:id" component={renderContent(RunDetailContent)} />
                <Redirect from="/data/manager" to="/data/manager/projects" />
            </Switch>
        );
    }
}

export default ManagerRunsContent;