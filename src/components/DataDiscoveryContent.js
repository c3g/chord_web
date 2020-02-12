import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Layout} from "antd";
import "antd/es/layout/style/css";

import SitePageHeader from "./SitePageHeader";
import DiscoverySearchContent from "./discovery/DiscoverySearchContent";
import DiscoveryDatasetContent from "./discovery/DiscoveryDatasetContent";


class DataDiscoveryContent extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        return (
            <>
                <SitePageHeader title="Data Discovery" subTitle="Federated data exploration" />
                <Layout>
                    <Layout.Content style={{background: "white", padding: "24px 30px"}}>
                        <Switch>
                            <Route exact path="/data/discovery/search" component={DiscoverySearchContent} />
                            <Route exact path="/data/discovery/datasets/:dataset" component={DiscoveryDatasetContent} />
                            <Redirect from="/data/discovery" to="/data/discovery/search" />
                        </Switch>
                    </Layout.Content>
                </Layout>
            </>
        );
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
