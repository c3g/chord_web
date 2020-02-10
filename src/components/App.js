import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";

import io from "socket.io-client";

import {Layout, Modal, Spin} from "antd";

import "antd/es/layout/style/css";
import "antd/es/modal/style/css";
import "antd/es/spin/style/css";

import {SIGN_IN_URL} from "../constants";

import OwnerRoute from "./OwnerRoute";

import NotificationDrawer from "./NotificationDrawer";
import SiteHeader from "./SiteHeader";

import DashboardContent from "./DashboardContent";
import DataDiscoveryContent from "./DataDiscoveryContent";
import DataManagerContent from "./DataManagerContent";
import PeersContent from "./PeersContent";
import NotificationsContent from "./NotificationsContent";

import {fetchUserAndDependentData} from "../modules/auth/actions";
import {fetchPeersOrError} from "../modules/peers/actions";

import eventHandler from "../events";
import {urlPath} from "../utils";

class App extends Component {
    constructor(props) {
        super(props);
        this.eventRelayConnection = null;
        this.pingInterval = null;
        this.lastUser = null;

        this.state = {
            signedOutModal: false
        };

        this.withBasePath = this.withBasePath.bind(this);
    }

    withBasePath(path) {
        return `${this.props.basePath}${path}`;
    }

    clearPingInterval() {
        if (this.pingInterval === null) return;
        clearInterval(this.pingInterval);
        this.pingInterval = null;
    }

    render() {
        // noinspection HtmlUnknownTarget
        return (
            <main>
                <Modal title="You have been signed out"
                       onOk={() => window.location.href = this.withBasePath(SIGN_IN_URL)}
                       onCancel={() => {
                           this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                           this.setState({signedOutModal: false});  // Close the modal
                           // TODO: Set a new interval at a slower rate
                       }}
                       visible={this.state.signedOutModal}>
                    Please <a href={this.withBasePath(SIGN_IN_URL)}>sign in</a> again to continue working.
                </Modal>
                <Spin spinning={this.props.isFetchingNodeInfo}>
                    <Layout style={{minHeight: "100vh"}}>
                        <NotificationDrawer />
                        <SiteHeader />
                        <Layout.Content style={{margin: "50px"}}>
                            {this.props.isFetchingNodeInfo ? null : (
                                <Switch>
                                    <Route path={this.withBasePath("dashboard")} component={DashboardContent} />
                                    <Route path={this.withBasePath("data/discovery")}
                                           component={DataDiscoveryContent} />
                                    <OwnerRoute path={this.withBasePath("data/manager")}
                                                component={DataManagerContent} />
                                    <Route path={this.withBasePath("peers")} component={PeersContent} />
                                    <OwnerRoute path={this.withBasePath("notifications")}
                                                component={NotificationsContent} />
                                    <Redirect from={this.props.basePath} to={this.withBasePath("dashboard")} />
                                </Switch>
                            )}
                        </Layout.Content>
                        <Layout.Footer style={{textAlign: "center"}}>
                            Copyright &copy; 2019-2020 the <a href="http://computationalgenomics.ca">Canadian Centre for
                            Computational Genomics</a>. <br/>
                            <span style={{fontFamily: "monospace"}}>chord_web</span> is licensed under
                            the <a href={this.withBasePath("LICENSE.txt")}>LGPLv3</a>. The source code is
                            available <a href="https://github.com/c3g/chord_web">on GitHub</a>.
                        </Layout.Footer>
                    </Layout>
                </Spin>
            </main>
        );
    }

    async componentDidMount() {
        await this.props.dispatch(fetchUserAndDependentData(async () => {
            await this.props.dispatch(fetchPeersOrError());
            this.eventRelayConnection = (() => {
                if (this.eventRelayConnection) return this.eventRelayConnection;
                const url = (this.props.eventRelay || {url: null}).url || null;
                return url ? (() => io(this.props.basePath, {path: `${urlPath(url)}/private/socket.io`})
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
    // Base path for routes, with trailing slash
    basePath: state.nodeInfo.data.CHORD_URL ? urlPath(state.nodeInfo.data.CHORD_URL) : "/",

    isFetchingNodeInfo: state.nodeInfo.isFetching,
    eventRelay: state.services.eventRelay,
    user: state.auth.user
}))(App));
