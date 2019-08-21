import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";

import {Layout, PageHeader} from "antd";
import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";

import DiscoverySearchContent from "./discovery/DiscoverySearchContent";

import {selectDiscoveryServiceDataType, clearDiscoveryServiceDataType} from "../modules/discovery/actions";


class DataDiscoveryContent extends Component {
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    renderContent(Content) {
        return () => {
            if (!(this.props.selectedServiceID && this.props.selectedDataTypeID) &&
                    (this.props.selectedServiceID || this.props.selectedDataTypeID)) {
                this.props.clearSelectedDataType();
            }

            return (
                <>
                    <PageHeader title="Data Discovery" subTitle="Federated data exploration"
                                style={{borderBottom: "1px solid rgb(232, 232, 232)"}}/>
                    <Layout>
                        <Layout.Content style={{background: "white", padding: "24px 30px"}}>
                            <Content />
                        </Layout.Content>
                    </Layout>
                </>
            );
        }
    }

    render() {
        return (
            <Switch>
                <Route exact path="/data/discovery/search"
                       component={this.renderContent(DiscoverySearchContent)} />
                <Redirect from="/data/discovery" to="/data/discovery/search" />
            </Switch>
        );
    }
}

const mapStateToProps = state => ({
    services: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypes,
    selectedServiceID: state.discovery.selectedServiceID,
    selectedDataTypeID: state.discovery.selectedDataTypeID
});

const mapDispatchToProps = dispatch => ({
    selectDataType: (serviceID, dataTypeID) => dispatch(selectDiscoveryServiceDataType(serviceID, dataTypeID)),
    clearSelectedDataType: () => dispatch(clearDiscoveryServiceDataType())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DataDiscoveryContent));
