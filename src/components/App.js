import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom";

import {Layout} from "antd";

import "antd/es/layout/style/css";

import NotificationDrawer from "./NotificationDrawer";
import SiteHeader from "./SiteHeader";

import ServicesContent from "./ServicesContent";
import DataDiscoveryContent from "./DataDiscoveryContent";
import DataManagerContent from "./DataManagerContent";
import PeersContent from "./PeersContent";

import {fetchPeers} from "../modules/peers/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../modules/services/actions";
import {fetchDropBoxTree} from "../modules/manager/actions";
import {fetchRuns, fetchAllRunDetailsIfNeeded} from "../modules/wes/actions";
import {
    fetchProjectsWithDatasetsAndTables,

    fetchPhenopacketsIfNeeded,
    fetchBiosamplesIfNeeded,
    fetchIndividualsIfNeeded
} from "../modules/metadata/actions";
import {fetchNotifications} from "../modules/notifications/actions";

class App extends Component {
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }

    renderContent(Content) {
        // noinspection HtmlUnknownTarget
        return () => (
            <Layout style={{minHeight: "100vh"}}>
                <NotificationDrawer />
                <SiteHeader />
                <Layout>
                    <Layout.Content style={{margin: "50px"}}>
                        <Content />
                    </Layout.Content>
                    <Layout.Footer style={{textAlign: "center"}}>
                        Copyright &copy; 2019
                        the <a href="http://computationalgenomics.ca">Canadian Centre for Computational
                        Genomics</a>. <br/>
                        <span style={{fontFamily: "monospace"}}>chord_web</span> is licensed under
                        the <a href="/LICENSE.txt">LGPLv3</a>. The source code is
                        available <a href="https://github.com/c3g/chord_web">on BitBucket</a>.
                    </Layout.Footer>
                </Layout>
            </Layout>
        )
    }

    render() {
        return (
            <main>
                <Switch>
                    <Route path="/services" component={this.renderContent(ServicesContent)} />
                    <Route path="/data/discovery" component={this.renderContent(DataDiscoveryContent)} />
                    <Route path="/data/manager" component={this.renderContent(DataManagerContent)} />
                    <Route path="/peers" component={this.renderContent(PeersContent)} />
                    <Redirect from="/" to="/services" />
                </Switch>
            </main>
        );
    }

    async componentDidMount() {
        await this.props.dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());

        await Promise.all([
            this.props.dispatch(fetchPeers()),
            this.props.dispatch(fetchProjectsWithDatasetsAndTables()),  // TODO: If needed
            this.props.dispatch(fetchDropBoxTree()),
            (async () => {
                await this.props.dispatch(fetchRuns());
                await this.props.dispatch(fetchAllRunDetailsIfNeeded());
            })(),
            this.props.dispatch(fetchPhenopacketsIfNeeded()),
            this.props.dispatch(fetchBiosamplesIfNeeded()),
            this.props.dispatch(fetchIndividualsIfNeeded()),
            this.props.dispatch(fetchNotifications())
        ]);
    }
}

export default App;
