import React, {Component} from "react";
import {connect} from "react-redux";

import {Link, Redirect, Route, Switch} from "react-router-dom";

import {Layout, Icon, Menu} from "antd";

import "antd/es/layout/style/css";
import "antd/es/icon/style/css";
import "antd/es/menu/style/css";

import ServicesContent from "./ServicesContent";
import DataDiscoveryContent from "./DataDiscoveryContent";
import DataManagerContent from "./DataManagerContent";
import PeersContent from "./PeersContent";

import {fetchServicesWithMetadataAndDataTypesAndTables} from "../modules/services/actions";
import {fetchPeers} from "../modules/peers/actions";

// noinspection HtmlUnknownTarget
const renderContent = Content => route => (
    <Layout style={{minHeight: "100vh"}}>
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
                        <Icon type="cloud-server" />
                        <span className="nav-text">Services</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="/data/discovery">
                    <Link to="/data/discovery">
                        <Icon type="file-search" />
                        <span className="nav-text">Data Discovery</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="/data/manager">
                    <Link to="/data/manager">
                        <Icon type="folder-open" />
                        <span className="nav-text">Data Manager</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="/peers">
                    <Link to="/peers">
                        <Icon type="apartment" />
                        <span className="nav-text">Peers</span>
                    </Link>
                </Menu.Item>
            </Menu>
        </Layout.Header>
        <Layout>
            <Layout.Content style={{margin: "50px"}}>
                <Content />
            </Layout.Content>
            <Layout.Footer style={{textAlign: "center"}}>
                Copyright &copy; 2019
                the <a href="http://computationalgenomics.ca">Canadian Centre for Computational Genomics</a>. <br />
                <span style={{fontFamily: "monospace"}}>chord_web</span> is licensed under
                the <a href="/LICENSE.txt">LGPLv3</a>. The source code is
                available <a href="https://bitbucket.org/genap/chord_web">on BitBucket</a>.
            </Layout.Footer>
        </Layout>
    </Layout>
);

class App extends Component {
    render() {
        return (
            <main>
                <Switch>
                    <Route path="/services" component={renderContent(ServicesContent)} />
                    <Route path="/data/discovery" component={renderContent(DataDiscoveryContent)} />
                    <Route path="/data/manager" component={renderContent(DataManagerContent)} />
                    <Route path="/peers" component={renderContent(PeersContent)} />
                    <Redirect from="/" to="/services" />
                </Switch>
            </main>
        );
    }

    componentDidMount() {
        this.props.dispatch(fetchPeers());
        this.props.dispatch(fetchServicesWithMetadataAndDataTypesAndTables());
    }
}

export default connect(null)(App);
