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
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={["aaa"]}>
                            <Menu.Item key="aaa">
                                <Icon type="cloud-server" />
                                <span className="nav-text">Services</span>
                            </Menu.Item>
                        </Menu>
                    </Layout.Sider>
                    <Layout>
                        <Layout>
                            <Layout.Content style={{margin: "30px"}}>
                                <section style={{padding: "30px 30px 12px", background: "white"}}>
                                    <ServiceList />
                                </section>
                            </Layout.Content>
                        </Layout>
                    </Layout>
                </Layout>
            </main>
        );
    }
}

export default App;
