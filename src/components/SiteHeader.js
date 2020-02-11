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

import {SIGN_IN_URL, SIGN_OUT_URL} from "../constants";
import {BASE_PATH, matchingMenuKeys, nodeInfoDataPropTypesShape, renderMenuItem, withBasePath} from "../utils";


class SiteHeader extends Component {
    render() {
        const menuItems = [
            {
                url: withBasePath("dashboard"),
                icon: <Icon type="dashboard" />,
                text: <span className="nav-text">Dashboard</span>,
            },
            {
                url: withBasePath("data/discovery"),
                icon: <Icon type="file-search" />,
                text: <span className="nav-text">Data Discovery</span>,
            },
            {
                url: withBasePath("data/manager"),
                icon: <Icon type="folder-open" />,
                text: <span className="nav-text">Data Manager</span>,
                disabled: !this.props.isOwner,
            },
            {
                url: withBasePath("peers"),
                icon: <Icon type="apartment" />,
                text: <span className="nav-text">Peers</span>,
            },
            ...(this.props.user ? [{
                key: "user-menu",
                style: {float: "right"},
                icon: <Icon type="user" />,
                text: this.props.user.preferred_username,
                children: [{
                    key: "sign-out-link",
                    onClick: () => window.location.href = withBasePath(SIGN_OUT_URL),
                    icon: <Icon type="logout" />,
                    text: <span className="nav-text">Sign Out</span>,
                }]
            }] : [{
                key: "sign-in",
                style: {float: "right"},
                icon: <Icon type="login" />,
                text: <span className="nav-text">{this.props.userFetching ? "Loading..." : "Sign In"}</span>,
                onClick: () => window.location.href = withBasePath(SIGN_IN_URL),
            }]),
            {
                url: withBasePath("notifications"),
                style: {float: "right"},
                disabled: !this.props.isOwner,
                icon: <Badge dot count={this.props.unreadNotifications.length}>
                    <Icon type="bell" style={{marginRight: "0"}}/>
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
                      selectedKeys={matchingMenuKeys(menuItems, BASE_PATH)}
                      style={{lineHeight: "64px"}}>
                    {menuItems.map(i => renderMenuItem(i))}
                </Menu>
            </Layout.Header>
        );
    }
}

SiteHeader.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    user: PropTypes.shape({
        chord_user_role: PropTypes.string.isRequired,
        email_verified: PropTypes.bool,
        preferred_username: PropTypes.string,
        sub: PropTypes.string.isRequired,
    }),
    userFetching: PropTypes.bool,
    unreadNotifications: PropTypes.array,
    isOwner: PropTypes.bool,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    unreadNotifications: state.notifications.items.filter(n => !n.read),
    user: state.auth.user,
    userFetching: state.auth.isFetching,
    isOwner: (state.auth.user || {}).chord_user_role === "owner"
});

export default withRouter(connect(mapStateToProps)(SiteHeader));
