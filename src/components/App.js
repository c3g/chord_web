import React, {Component} from "react";
import {connect} from "react-redux";

import {Link, Redirect, Route, Switch} from "react-router-dom";

import {Badge, Drawer, Layout, Icon, Menu} from "antd";

import "antd/es/badge/style/css";
import "antd/es/drawer/style/css";
import "antd/es/layout/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";

import NotificationDrawer from "./NotificationDrawer";

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
import {showNotificationDrawer, fetchNotifications} from "../modules/notifications/actions";

class App extends Component {
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }

    renderContent(Content) {
        // noinspection HtmlUnknownTarget
        return route => (
            <Layout style={{minHeight: "100vh"}}>
                <NotificationDrawer />
                <Layout.Header>
                    <Link to="/"><h1 style={{
                        display: "inlineBlock",
                        color: "rgba(255, 255, 255, 0.95)",
                        margin: "0 30px 0 0",
                        float: "left"
                    }}>CHORD</h1></Link>
                    <Menu theme="dark" mode="horizontal" selectedKeys={[route.match.path]}
                          style={{lineHeight: "64px"}}>
                        <Menu.Item key="/services">
                            <Link to="/services">
                                <Icon type="cloud-server"/>
                                <span className="nav-text">Services</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="/data/discovery">
                            <Link to="/data/discovery">
                                <Icon type="file-search"/>
                                <span className="nav-text">Data Discovery</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="/data/manager">
                            <Link to="/data/manager">
                                <Icon type="folder-open"/>
                                <span className="nav-text">Data Manager</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="/peers">
                            <Link to="/peers">
                                <Icon type="apartment"/>
                                <span className="nav-text">Peers</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="notifications" style={{float: "right"}}
                                   onClick={() => this.props.dispatch(showNotificationDrawer())}>
                            <Badge dot>
                                <Icon type="bell" style={{marginRight: "0"}}/>
                            </Badge>
                            <span className="nav-text" style={{marginLeft: "10px"}}>Notifications (5)</span>
                        </Menu.Item>
                    </Menu>
                </Layout.Header>
                <Layout>
                    <Layout.Content style={{margin: "50px"}}>
                        <Content/>
                    </Layout.Content>
                    <Layout.Footer style={{textAlign: "center"}}>
                        Copyright &copy; 2019
                        the <a href="http://computationalgenomics.ca">Canadian Centre for Computational
                        Genomics</a>. <br/>
                        <span style={{fontFamily: "monospace"}}>chord_web</span> is licensed under
                        the <a href="/LICENSE.txt">LGPLv3</a>. The source code is
                        available <a href="https://bitbucket.org/genap/chord_web">on BitBucket</a>.
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

export default connect(state => ({
    notificationDrawerVisible: state.notifications.drawerVisible
}))(App);
