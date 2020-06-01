import React, {Component, Suspense, lazy} from "react";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";

import {Card, Layout, Skeleton} from "antd";
import "antd/es/card/style/css";
import "antd/es/layout/style/css";
import "antd/es/skeleton/style/css";

import SitePageHeader from "./SitePageHeader";
import {withBasePath} from "../utils/url";

const DiscoverySearchContent = lazy(() => import("./discovery/DiscoverySearchContent"));
const DiscoveryDatasetContent = lazy(() => import("./discovery/DiscoveryDatasetContent"));


class DataDiscoveryContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        return <>
            <SitePageHeader title="Data Discovery" subTitle="Federated, censored dataset search" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "24px"}}>
                    <Suspense fallback={<Card><Skeleton /></Card>}>
                        <Switch>
                            <Route exact path={withBasePath("data/discovery/search")}
                                   component={DiscoverySearchContent} />
                            <Route exact path={withBasePath("data/discovery/datasets/:dataset")}
                                   component={DiscoveryDatasetContent} />
                            <Redirect from={withBasePath("data/discovery")}
                                      to={withBasePath("data/discovery/search")} />
                        </Switch>
                    </Suspense>
                </Layout.Content>
            </Layout>
        </>;
    }
}

export default withRouter(DataDiscoveryContent);
