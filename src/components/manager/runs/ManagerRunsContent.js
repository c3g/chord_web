import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";

import "antd/es/layout/style/css";
import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";


class ManagerRunsContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Switch>
                        <Route exact path="/data/manager/runs" component={RunListContent} />
                        <Route path="/data/manager/runs/:id/:tab" component={RunDetailContent} />
                        <Redirect from="/data/manager/runs/:id" to="/data/manager/runs/:id/request" />
                        <Redirect from="/data/manager" to="/data/manager/projects" />
                    </Switch>
                </Layout.Content>
            </Layout>
        );
    }
}

export default ManagerRunsContent;
