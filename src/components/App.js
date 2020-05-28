import React, {Component, Suspense, lazy} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";
import PropTypes from "prop-types";

import io from "socket.io-client";

import {Layout, Modal, Skeleton} from "antd";
import "antd/es/layout/style/css";
import "antd/es/modal/style/css";

import OwnerRoute from "./OwnerRoute";

import NotificationDrawer from "./notifications/NotificationDrawer";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

import {fetchUserAndDependentData} from "../modules/auth/actions";
import {fetchPeersOrError} from "../modules/peers/actions";

import eventHandler from "../events";
import {nop} from "../utils/misc";
import {BASE_PATH, signInURLWithRedirect, urlPath, withBasePath} from "../utils/url";
import {serviceInfoPropTypesShape, userPropTypesShape} from "../propTypes";

// Lazy-load notification drawer

// Lazy-load route components
const DashboardContent = lazy(() => import("./DashboardContent"));
const DataDiscoveryContent = lazy(() => import("./DataDiscoveryContent.js"));
const DataExplorerContent = lazy(() => import("./DataExplorerContent"));
const DataManagerContent = lazy(() => import("./DataManagerContent"));
const PeersContent = lazy(() => import("./PeersContent"));
const NotificationsContent = lazy(() => import("./notifications/NotificationsContent"));

class App extends Component {
    constructor(props) {
        super(props);

        /** @type {null|io.Manager} */
        this.eventRelayConnection = null;

        this.pingInterval = null;
        this.lastUser = null;

        this.state = {
            signedOutModal: false
        };

        this.createEventRelayConnectionIfNecessary = this.createEventRelayConnectionIfNecessary.bind(this);
        this.refreshUserAndDependentData = this.refreshUserAndDependentData.bind(this);
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
                       onOk={() => window.location.href = signInURLWithRedirect()}
                       onCancel={() => {
                           this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                           this.setState({signedOutModal: false});  // Close the modal
                           // TODO: Set a new interval at a slower rate
                       }}
                       visible={this.state.signedOutModal}>
                    Please <a href={signInURLWithRedirect()}>sign in</a> again to continue working.
                </Modal>
                <Layout style={{minHeight: "100vh"}}>
                    <NotificationDrawer />
                    <SiteHeader />
                    <Layout.Content style={{margin: "50px"}}>
                        <Suspense fallback={<Skeleton />}>
                            <Switch>
                                <Route path={withBasePath("dashboard")} component={DashboardContent} />
                                <Route path={withBasePath("data/discovery")} component={DataDiscoveryContent} />
                                <OwnerRoute path={withBasePath("data/explorer")}
                                            component={DataExplorerContent} />
                                <OwnerRoute path={withBasePath("data/manager")} component={DataManagerContent} />
                                <Route path={withBasePath("peers")} component={PeersContent} />
                                <OwnerRoute path={withBasePath("notifications")}
                                            component={NotificationsContent} />
                                <Redirect from={BASE_PATH} to={withBasePath("dashboard")} />
                            </Switch>
                        </Suspense>
                    </Layout.Content>
                    <SiteFooter />
                </Layout>
            </>
        );
    }

    createEventRelayConnectionIfNecessary() {
        this.eventRelayConnection = (() => {
            if (this.eventRelayConnection) {
                return this.eventRelayConnection;
            }

            // Don't bother trying to create the event relay connection if the user isn't authenticated
            if (!this.props.user) return null;

            const url = (this.props.eventRelay || {url: null}).url || null;
            return url ? (() => io(BASE_PATH, {
                path: `${urlPath(url)}/private/socket.io`,
                reconnection: !!this.props.user  // Only try to reconnect if we're authenticated
            }).on("events", message => eventHandler(message, this.props.history)))() : null;
        })();
    }

    // TODO: Don't execute on focus if it's been checked recently
    async refreshUserAndDependentData() {
        await this.props.fetchUserAndDependentData();
        if (this.lastUser !== null && this.props.user === null) {
            // We got de-authenticated, so show a prompt...
            this.setState({signedOutModal: true});
            // ... and disable constant websocket pinging if necessary by removing existing connections
            if (this.eventRelayConnection) {
                this.eventRelayConnection.close();
                this.eventRelayConnection = null;
            }
        } else if (this.lastUser === null && this.props.user) {
            // We got authenticated, so re-enable reconnection on the websocket..
            this.createEventRelayConnectionIfNecessary();
            // ... and minimize the sign-in prompt modal if necessary
            this.setState({signedOutModal: false});
        }
        this.lastUser = this.props.user;
    }

    componentDidMount() {
        (async () => {
            await this.props.fetchUserAndDependentData(async () => {
                await this.props.fetchPeersOrError();
                this.createEventRelayConnectionIfNecessary();
            });

            // TODO: Refresh other data
            // TODO: Variable rate
            this.pingInterval = setInterval(this.refreshUserAndDependentData, 30000);
            window.addEventListener("focus", () => this.refreshUserAndDependentData());
        })();
    }

    componentWillUnmount() {
        this.clearPingInterval();
    }
}

App.propTypes = {
    isFetchingNodeInfo: PropTypes.bool,
    eventRelay: serviceInfoPropTypesShape,
    user: userPropTypesShape,

    fetchUserAndDependentData: PropTypes.func,
    fetchPeersOrError: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingNodeInfo: state.nodeInfo.isFetching,
    eventRelay: state.services.eventRelay,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    fetchUserAndDependentData: (servicesCb = nop) => dispatch(fetchUserAndDependentData(servicesCb)),
    fetchPeersOrError: () => dispatch(fetchPeersOrError()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
