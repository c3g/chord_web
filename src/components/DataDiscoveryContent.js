import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Layout, PageHeader} from "antd";
import "antd/es/layout/style/css";
import "antd/es/page-header/style/css";

import DiscoverySearchContent from "./discovery/DiscoverySearchContent";

import {clearDiscoveryServiceDataType} from "../modules/discovery/actions";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";


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
                    <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Data Discovery</div>}
                                subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>Federated data exploration</span>}
                                style={PAGE_HEADER_STYLE} />
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

DataDiscoveryContent.propTypes = {
    selectedServiceID: PropTypes.string,
    selectedDataTypeID: PropTypes.string,

    clearSelectedDataType: PropTypes.func
};

const mapStateToProps = state => ({
    selectedServiceID: state.discovery.selectedServiceID,
    selectedDataTypeID: state.discovery.selectedDataTypeID
});

const mapDispatchToProps = dispatch => ({
    clearSelectedDataType: () => dispatch(clearDiscoveryServiceDataType())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DataDiscoveryContent));
