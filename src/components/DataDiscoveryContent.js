import React, {Component, Suspense, lazy} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Layout} from "antd";
import "antd/es/layout/style/css";

import SitePageHeader from "./SitePageHeader";
import {withBasePath} from "../utils/url";

const DiscoverySearchContent = lazy(() => import("./discovery/DiscoverySearchContent"));
const DiscoveryDatasetContent = lazy(() => import("./discovery/DiscoveryDatasetContent"));


class DataDiscoveryContent extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        return <>
            <SitePageHeader title="Data Discovery" subTitle="Federated, censored dataset search" />
            <Layout>
                <Layout.Content style={{background: "white", padding: "24px"}}>
                    <Suspense fallback={<div />}>
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

DataDiscoveryContent.propTypes = {
    selectedServiceID: PropTypes.string,
    selectedDataTypeID: PropTypes.string,
};

const mapStateToProps = state => ({
    selectedServiceID: state.discovery.selectedServiceID,
    selectedDataTypeID: state.discovery.selectedDataTypeID
});

export default connect(mapStateToProps)(withRouter(DataDiscoveryContent));
