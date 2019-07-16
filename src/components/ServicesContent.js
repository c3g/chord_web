import React, {Component} from "react";

import {Layout, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

import ServiceList from "./ServiceList";


class ServicesContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Services";
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={{background: "white", padding: "24px 32px 4px"}}>
                    <Typography.Title level={2}>Services</Typography.Title>
                    <ServiceList />
                </Layout.Content>
            </Layout>
        );
    }
}

export default ServicesContent;
