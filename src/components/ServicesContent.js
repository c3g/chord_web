import React, {Component} from "react";

import {Layout, PageHeader, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

import ServiceList from "./ServiceList";


class ServicesContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Services";
    }

    render() {
        return (
            <div>
                <PageHeader title="Services" subTitle="Application health monitor"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}/>
                <Layout>
                    <Layout.Content style={{background: "white", padding: "36px 30px 4px"}}>
                        <ServiceList />
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

export default ServicesContent;
