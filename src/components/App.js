import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";

import io from "socket.io-client";

import {Layout, Modal} from "antd";
import "antd/es/layout/style/css";
import "antd/es/modal/style/css";

import {SIGN_IN_URL} from "../constants";

import OwnerRoute from "./OwnerRoute";

import NotificationDrawer from "./notifications/NotificationDrawer";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

import DashboardContent from "./DashboardContent";
import DataDiscoveryContent from "./DataDiscoveryContent";
import DataManagerContent from "./DataManagerContent";
import PeersContent from "./PeersContent";
import NotificationsContent from "./notifications/NotificationsContent";

import {fetchUserAndDependentData} from "../modules/auth/actions";
import {fetchPeersOrError} from "../modules/peers/actions";

import eventHandler from "../events";
import {BASE_PATH, urlPath, withBasePath} from "../utils";

class App extends Component {
    constructor(props) {
        super(props);
        this.eventRelayConnection = null;
        this.pingInterval = null;
        this.lastUser = null;

        this.state = {
            signedOutModal: false
        };
    }

    clearPingInterval() {
        if (this.pingInterval === null) return;
        clearInterval(this.pingInterval);
        this.pingInterval = null;
    }

    render() {
        // noinspection HtmlUnknownTarget
        return (
            <>
                <Modal title="You have been signed out"
                       onOk={() => window.location.href = withBasePath(SIGN_IN_URL)}
                       onCancel={() => {
                           this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                           this.setState({signedOutModal: false});  // Close the modal
                           // TODO: Set a new interval at a slower rate
                       }}
                       visible={this.state.signedOutModal}>
                    Please <a href={withBasePath(SIGN_IN_URL)}>sign in</a> again to continue working.
                </Modal>
                <Layout style={{minHeight: "100vh"}}>
                    <NotificationDrawer />
                    <SiteHeader />
                    <Layout.Content style={{margin: "50px"}}>
                        <Switch>
                            <Route path={withBasePath("dashboard")} component={DashboardContent} />
                            <Route path={withBasePath("data/discovery")}
                                   component={DataDiscoveryContent} />
                            <OwnerRoute path={withBasePath("data/manager")}
                                        component={DataManagerContent} />
                            <Route path={withBasePath("peers")} component={PeersContent} />
                            <OwnerRoute path={withBasePath("notifications")}
                                        component={NotificationsContent} />
                            <Redirect from={BASE_PATH} to={withBasePath("dashboard")} />
                        </Switch>
                    </Layout.Content>
                    <SiteFooter />
                </Layout>
            </>
        );
    }

    async componentDidMount() {
        await this.props.dispatch(fetchUserAndDependentData(async () => {
            await this.props.dispatch(fetchPeersOrError());
            this.eventRelayConnection = (() => {
                if (this.eventRelayConnection) return this.eventRelayConnection;
                const url = (this.props.eventRelay || {url: null}).url || null;
                return url ? (() => io(BASE_PATH, {path: `${urlPath(url)}/private/socket.io`})
                    .on("events", message => eventHandler(message, this.props.history)))() : null;
            })();
        }));

        // TODO: Refresh other data
        this.pingInterval = setInterval(async () => {
            await this.props.dispatch(fetchUserAndDependentData());
            if (this.lastUser !== null && this.props.user === null) {
                // We got de-authenticated, so show a prompt
                this.setState({signedOutModal: true});
            }
            this.lastUser = this.props.user;
        }, 30000);  // TODO: Variable rate
    }

    componentWillUnmount() {
        this.clearPingInterval();
    }
}

export default withRouter(connect(state => ({
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    eventRelay: state.services.eventRelay,
    user: state.auth.user
}))(App));
