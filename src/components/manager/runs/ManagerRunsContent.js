import React, {Component} from "react";import "antd/es/tag/style/css";
import "antd/es/typography/style/css";

import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";
import "antd/es/layout/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../../styles/layoutContent";

import RunListContent from "./RunListContent";
import RunDetailContent from "./RunDetailContent";
import {withBasePath} from "../../../utils/url";


class ManagerRunsContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Switch>
                        <Route exact path={withBasePath("data/manager/runs")} component={RunListContent} />
                        <Route path={withBasePath("data/manager/runs/:id/:tab")} component={RunDetailContent} />
                        <Redirect from={withBasePath("data/manager/runs/:id")}
                                  to={withBasePath("data/manager/runs/:id/request")} />
                        <Redirect from={withBasePath("data/manager")}
                                  to={withBasePath("data/manager/projects")} />
                    </Switch>
                </Layout.Content>
            </Layout>
        );
    }
}

export default ManagerRunsContent;
