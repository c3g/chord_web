import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Badge, Icon, Layout, Menu} from "antd";

import "antd/es/badge/style/css";
import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import {showNotificationDrawer} from "../modules/notifications/actions";

import {ADMIN_NAME} from "../constants";
import {matchingMenuKeys, renderMenuItem} from "../utils/menu";
import {BASE_PATH, signInURLWithRedirect, withBasePath} from "../utils/url";
import {nodeInfoDataPropTypesShape, notificationPropTypesShape, userPropTypesShape} from "../propTypes";


class AdminHeader extends Component {
    render() {
        const menuItems = [ {
                url: withBasePath("admin/services"),
                icon: <Icon type="dashboard" />,
                text: <span className="nav-text">Services</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: withBasePath("admin/data/manager"),
                icon: <Icon type="folder-open" />,
                text: <span className="nav-text">Data Manager</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: withBasePath("admin/peers"),
                icon: <Icon type="apartment" />,
                text: <span className="nav-text">Peers</span>,
                disabled: !this.props.isOwner,
            }
        ];

        return <Layout.Header>
            <Link to={withBasePath("admin/services")}><h1 style={{
                display: "inlineBlock",
                color: "rgba(255, 255, 255, 0.95)",
                margin: "0 30px 0 0",
                float: "left"
            }}>{ADMIN_NAME}</h1></Link>
            <Menu theme="dark"
                  mode="horizontal"
                  selectedKeys={matchingMenuKeys(menuItems)}
                  style={{lineHeight: "64px"}}>
                {menuItems.map(i => renderMenuItem(i))}
            </Menu>
        </Layout.Header>;
    }
}

AdminHeader.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    unreadNotifications: PropTypes.arrayOf(notificationPropTypesShape),
    user: userPropTypesShape,
    authHasAttempted: PropTypes.bool,
    isOwner: PropTypes.bool,

    showNotificationDrawer: PropTypes.func,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    authHasAttempted: state.auth.hasAttempted,
    isOwner: (state.auth.user || {}).chord_user_role === "owner"
});

export default withRouter(connect(mapStateToProps, {showNotificationDrawer})(AdminHeader));
