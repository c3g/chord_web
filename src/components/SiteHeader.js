import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {
    ApartmentOutlined,
    BellOutlined,
    DashboardOutlined,
    FileSearchOutlined,
    FolderOpenOutlined,
    LoginOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';

import {Badge, Layout, Menu} from "antd";
import "antd/es/badge/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";

import {showNotificationDrawer} from "../modules/notifications/actions";

import {SIGN_OUT_URL} from "../constants";
import {
    BASE_PATH,
    matchingMenuKeys,
    nodeInfoDataPropTypesShape,
    renderMenuItem,
    signInURLWithRedirect,
    withBasePath
} from "../utils";


class SiteHeader extends Component {
    render() {
        const menuItems = [
            {
                url: withBasePath("dashboard"),
                icon: <DashboardOutlined />,
                text: <span className="nav-text">Dashboard</span>,
            },
            {
                url: withBasePath("data/discovery"),
                icon: <FileSearchOutlined />,
                text: <span className="nav-text">Data Discovery</span>,
            },
            {
                url: withBasePath("data/manager"),
                icon: <FolderOpenOutlined />,
                text: <span className="nav-text">Data Manager</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: withBasePath("peers"),
                icon: <ApartmentOutlined />,
                text: <span className="nav-text">Peers</span>,
            },
            ...(this.props.user ? [{
                key: "user-menu",
                style: {float: "right"},
                icon: <UserOutlined />,
                text: this.props.user.preferred_username,
                children: [{
                    key: "sign-out-link",
                    onClick: () => window.location.href = withBasePath(SIGN_OUT_URL),
                    icon: <LogoutOutlined />,
                    text: <span className="nav-text">Sign Out</span>,
                }]
            }] : [{
                key: "sign-in",
                style: {float: "right"},
                icon: <LoginOutlined />,
                text: <span className="nav-text">{this.props.authHasAttempted ? "Sign In" : "Loading..."}</span>,
                onClick: () => window.location.href = signInURLWithRedirect(),
            }]),
            {
                url: withBasePath("notifications"),
                style: {float: "right"},
                disabled: !this.props.isOwner,
                icon: <Badge dot count={this.props.unreadNotifications.length}>
                    <BellOutlined style={{marginRight: "0"}} />
                </Badge>,
                text: <span className="nav-text" style={{marginLeft: "10px"}}>
                    Notifications
                    {this.props.unreadNotifications.length > 0 ? (
                        <span> ({this.props.unreadNotifications.length})</span>
                    ) : null}
                </span>,
                onClick: () => this.props.dispatch(showNotificationDrawer()),
            }
        ];

        return (
            <Layout.Header>
                <Link to={BASE_PATH}><h1 style={{
                    display: "inlineBlock",
                    color: "rgba(255, 255, 255, 0.95)",
                    margin: "0 30px 0 0",
                    float: "left"
                }}>CHORD</h1></Link>
                <Menu theme="dark"
                      mode="horizontal"
                      selectedKeys={matchingMenuKeys(menuItems)}
                      style={{lineHeight: "64px"}}>
                    {menuItems.map(i => renderMenuItem(i))}
                </Menu>
            </Layout.Header>
        );
    }
}

SiteHeader.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    unreadNotifications: PropTypes.array,
    user: PropTypes.shape({
        chord_user_role: PropTypes.string.isRequired,
        email_verified: PropTypes.bool,
        preferred_username: PropTypes.string,
        sub: PropTypes.string.isRequired,
    }),
    authHasAttempted: PropTypes.bool,
    isOwner: PropTypes.bool,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    authHasAttempted: state.auth.hasAttempted,
    isOwner: (state.auth.user || {}).chord_user_role === "owner"
});

export default withRouter(connect(mapStateToProps)(SiteHeader));
