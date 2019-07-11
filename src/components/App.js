import React, {Component} from "react";

import {Layout, Menu, Typography, Icon} from "antd";
import ServiceList from "./ServiceList";

import "antd/es/typography/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

class App extends Component {
    render() {
        return (
            <main>
                <Layout>
                    <Layout.Sider style={{minHeight: "100vh"}}>
                        <Typography.Title style={{
                            color: "rgba(255, 255, 255, 0.95)",
                            textAlign: "center",
                            marginTop: "24px",
                            lineHeight: "1em"
                        }}>CHORD</Typography.Title>
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                            <Menu.Item key="1">
                                <Icon type="cloud-server" />
                                <span className="nav-text">Services</span>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Icon type="file-search" />
                                <span className="nav-text">Discover Data</span>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <Icon type="folder-open" />
                                <span className="nav-text">Data Manager</span>
                            </Menu.Item>
                        </Menu>
                    </Layout.Sider>
                    <Layout>
                        <Layout.Content style={{margin: "30px"}}>
                            <section style={{padding: "30px 30px 12px", background: "white"}}>
                                <Typography.Title level={2}>Services</Typography.Title>
                                <ServiceList />
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
}

export default App;
