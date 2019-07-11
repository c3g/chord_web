import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import ServiceList from "./ServiceList";


class ServicesContent extends Component {
    render() {
        return (
            <div>
                <Typography.Title level={2}>Services</Typography.Title>
                <ServiceList />
            </div>
        );
    }
}

export default ServicesContent;
