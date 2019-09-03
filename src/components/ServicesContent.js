import React, {Component} from "react";

import {Layout, PageHeader} from "antd";
import "antd/es/layout/style/css";

import ServiceList from "./ServiceList";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";


class ServicesContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Services";
    }

    render() {
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Services</div>}
                            subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>Application health monitor</span>}
                            style={PAGE_HEADER_STYLE}/>
                <Layout>
                    <Layout.Content style={{background: "white", padding: "32px 24px 4px"}}>
                        <ServiceList />
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

export default ServicesContent;
