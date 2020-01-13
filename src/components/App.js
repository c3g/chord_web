import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter, Redirect, Route, Switch} from "react-router-dom";

import io from "socket.io-client";

import {Layout, Modal} from "antd";

import "antd/es/layout/style/css";
import "antd/es/modal/style/css";

import OwnerRoute from "./OwnerRoute";

import NotificationDrawer from "./NotificationDrawer";
import SiteHeader from "./SiteHeader";

import ServicesContent from "./ServicesContent";
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
        this.renderContent = this.renderContent.bind(this);
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

    renderContent(Content) {
        return () => <><SiteHeader /><Layout.Content style={{margin: "50px"}}><Content /></Layout.Content></>;
    }

    render() {
        const signInURL = "/api/auth/sign-in";

        // noinspection HtmlUnknownTarget
        return (
            <main>
                <Modal title="You have been signed out"
                       onOk={() => window.location.href = signInURL}
                       onCancel={() => {
                           this.clearPingInterval();  // Stop pinging until the user decides to sign in again
                           this.setState({signedOutModal: false});  // Close the modal
                           // TODO: Set a new interval at a slower rate
                       }}
                       visible={this.state.signedOutModal}>
                    Please <a href={signInURL}>sign in</a> again to continue working.
                </Modal>
                <Layout style={{minHeight: "100vh"}}>
                    <NotificationDrawer />
                    <Switch>
                        <Route path="/services" component={this.renderContent(ServicesContent)} />
                        <Route path="/data/discovery" component={this.renderContent(DataDiscoveryContent)} />
                        <OwnerRoute path="/data/manager" component={this.renderContent(DataManagerContent)} />
                        <Route path="/peers" component={this.renderContent(PeersContent)} />
                        <OwnerRoute path="/notifications" component={this.renderContent(NotificationsContent)} />
                        <Redirect from="/" to="/services" />
                    </Switch>
                    <Layout.Footer style={{textAlign: "center"}}>
                        Copyright &copy; 2019 the <a href="http://computationalgenomics.ca">Canadian Centre for
                        Computational Genomics</a>. <br/>
                        <span style={{fontFamily: "monospace"}}>chord_web</span> is licensed under
                        the <a href="/LICENSE.txt">LGPLv3</a>. The source code is available
                        <a href="https://github.com/c3g/chord_web">on GitHub</a>.
                    </Layout.Footer>
                </Layout>
            </main>
        );
    }

    async componentDidMount() {
        await this.props.dispatch(fetchUserAndDependentData(async () => {
            await this.props.dispatch(fetchPeersOrError());
            this.eventRelayConnection = (() => {
                if (this.eventRelayConnection) return this.eventRelayConnection;
                const url = (this.props.eventRelay || {url: null}).url || null;
                return url ? (() => io("/", {path: `${urlPath(url)}/private/socket.io`})
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
    eventRelay: state.services.eventRelay,
    user: state.auth.user
}))(App));
