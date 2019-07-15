import React, {Component} from "react";
import {connect} from "react-redux";

import {withRouter, Link, Redirect, Route, Switch} from "react-router-dom";

import {Layout, Menu, Typography, Icon} from "antd";
import "antd/es/typography/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import ServicesContent from "./ServicesContent";
import DataDiscoveryContent from "./DataDiscoveryContent";
import DataManagerContent from "./DataManagerContent";

import {fetchServicesWithMetadataAndDatasets} from "../actions";

class App extends Component {
    render() {
        return (
            <main>
                <Layout style={{minHeight: "100vh"}}>
                    <Layout.Header>
                        <Link to="/"><h1 style={{
                            display: "inlineBlock",
                            color: "rgba(255, 255, 255, 0.95)",
                            margin: "0 30px 0 0",
                            float: "left"
                        }}>CHORD</h1></Link>
                        <Menu theme="dark" mode="horizontal" selectedKeys={[this.props.location.pathname]}
                              style={{lineHeight: "64px"}}>
                            <Menu.Item key="/services">
                                <Icon type="cloud-server" />
                                <span className="nav-text">Services</span>
                                <Link to="/services" />
                            </Menu.Item>
                            <Menu.Item key="/data/discovery">
                                <Icon type="file-search" />
                                <span className="nav-text">Data Discovery</span>
                                <Link to="/data/discovery" />
                            </Menu.Item>
                            <Menu.Item key="/data/manager">
                                <Icon type="folder-open" />
                                <span className="nav-text">Data Manager</span>
                                <Link to="/data/manager" />
                            </Menu.Item>
                        </Menu>
                    </Layout.Header>
                    <Layout>
                        <Layout.Content style={{margin: "50px"}}>
                            <section style={{background: "white"}}>
                                {/*padding: "30px 40px 12px",*/}
                                <Switch>
                                    <Route path="/services" component={ServicesContent} />
                                    <Route path="/data/discovery" component={DataDiscoveryContent} />
                                    <Route path="/data/manager" component={DataManagerContent} />
                                    <Redirect from="/" to="/services" />
                                </Switch>
                            </section>
                        </Layout.Content>
                        <Layout.Footer style={{textAlign: "center"}}>
                            CHORD <br />
                            Copyright &copy; 2019 the Canadian Centre for Computational Genomics
                        </Layout.Footer>
                    </Layout>
                </Layout>
            </main>
        );
    }

    componentDidMount() {
        this.props.dispatch(fetchServicesWithMetadataAndDatasets());
    }
}

export default connect(null)(withRouter(App));
